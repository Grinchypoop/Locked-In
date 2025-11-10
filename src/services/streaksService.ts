import pool from '../database/db';

interface Streak {
  id: number;
  user_id: number;
  metric_type: string;
  current_streak: number;
  best_streak: number;
  last_completed_date: string;
  updated_at: Date;
}

export async function calculateAndUpdateStreaks(userId: number): Promise<Streak[]> {
  try {
    const metricTypes = ['non_negotiables', 'workouts', 'work_hours'];
    const updatedStreaks: Streak[] = [];

    for (const metricType of metricTypes) {
      const streak = await calculateStreakForMetric(userId, metricType);
      updatedStreaks.push(streak);
    }

    return updatedStreaks;
  } catch (error) {
    console.error('Error calculating streaks:', error);
    throw error;
  }
}

async function calculateStreakForMetric(userId: number, metricType: string): Promise<Streak> {
  try {
    let currentStreak = 0;
    let bestStreak = 0;
    let lastCompletedDate: string | null = null;

    if (metricType === 'non_negotiables') {
      // Calculate streak logic for non-negotiables
      const streakResult = await calculateConsecutiveDays(
        userId,
        'non_negotiables_tracking',
        'completed'
      );
      currentStreak = streakResult.current;
      bestStreak = streakResult.best;
      lastCompletedDate = streakResult.lastDate;
    } else if (metricType === 'workouts') {
      const streakResult = await calculateConsecutiveDays(userId, 'workouts', null);
      currentStreak = streakResult.current;
      bestStreak = streakResult.best;
      lastCompletedDate = streakResult.lastDate;
    } else if (metricType === 'work_hours') {
      const streakResult = await calculateConsecutiveDays(userId, 'work_hours', null);
      currentStreak = streakResult.current;
      bestStreak = streakResult.best;
      lastCompletedDate = streakResult.lastDate;
    }

    // Update or insert streak
    const result = await pool.query(
      `INSERT INTO streaks (user_id, metric_type, current_streak, best_streak, last_completed_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, metric_type)
       DO UPDATE SET
         current_streak = $3,
         best_streak = GREATEST(streaks.best_streak, $4),
         last_completed_date = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, metricType, currentStreak, bestStreak, lastCompletedDate || null]
    );

    return result.rows[0];
  } catch (error) {
    console.error(`Error calculating ${metricType} streak:`, error);
    throw error;
  }
}

async function calculateConsecutiveDays(
  userId: number,
  tableName: string,
  completedColumn?: string | null
): Promise<{ current: number; best: number; lastDate: string | null }> {
  try {
    let dateColumn = 'date';
    let filterClause = '';

    if (completedColumn) {
      filterClause = ` AND ${completedColumn} = true`;
    }

    const query = `
      WITH date_gaps AS (
        SELECT
          date,
          ROW_NUMBER() OVER (ORDER BY date DESC) -
          ROW_NUMBER() OVER (ORDER BY (CURRENT_DATE - date)::integer DESC) as gap
        FROM ${tableName}
        WHERE user_id = $1 ${filterClause}
      ),
      streaks AS (
        SELECT
          gap,
          COUNT(*) as streak_length
        FROM date_gaps
        GROUP BY gap
      )
      SELECT
        COALESCE(MAX(CASE WHEN gap = (SELECT gap FROM date_gaps LIMIT 1) THEN streak_length ELSE 0 END), 0) as current_streak,
        COALESCE(MAX(streak_length), 0) as best_streak
      FROM streaks
    `;

    const result = await pool.query(query, [userId]);

    const lastDateResult = await pool.query(
      `SELECT MAX(${dateColumn}) as last_date FROM ${tableName} WHERE user_id = $1 ${filterClause}`,
      [userId]
    );

    return {
      current: parseInt(result.rows[0]?.current_streak || '0'),
      best: parseInt(result.rows[0]?.best_streak || '0'),
      lastDate: lastDateResult.rows[0]?.last_date || null,
    };
  } catch (error) {
    console.error('Error calculating consecutive days:', error);
    return { current: 0, best: 0, lastDate: null };
  }
}

export async function getUserStreaks(userId: number): Promise<Streak[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM streaks WHERE user_id = $1 ORDER BY metric_type',
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching user streaks:', error);
    throw error;
  }
}

export async function getStreakCalendar(userId: number, metricType: string) {
  try {
    const result = await pool.query(
      `SELECT
        date,
        completed
       FROM streak_calendar
       WHERE user_id = $1 AND metric_type = $2
       ORDER BY date DESC`,
      [userId, metricType]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching streak calendar:', error);
    throw error;
  }
}

export async function updateStreakCalendar(
  userId: number,
  date: string,
  metricType: string,
  completed: boolean
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO streak_calendar (user_id, date, metric_type, completed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, date, metric_type)
       DO UPDATE SET completed = $4
       RETURNING *`,
      [userId, date, metricType, completed]
    );
  } catch (error) {
    console.error('Error updating streak calendar:', error);
    throw error;
  }
}
