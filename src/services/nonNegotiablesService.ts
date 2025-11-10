import pool from '../database/db';

interface NonNegotiable {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  duration_days: number;
  start_date: Date;
  end_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface NonNegotiableTracking {
  id: number;
  non_negotiable_id: number;
  user_id: number;
  date: string;
  completed: boolean;
  completed_at?: Date;
}

export async function createNonNegotiable(
  userId: number,
  title: string,
  description?: string,
  durationDays: number = 90
): Promise<NonNegotiable> {
  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const result = await pool.query(
      `INSERT INTO non_negotiables (user_id, title, description, duration_days, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, true)
       RETURNING *`,
      [userId, title, description, durationDays, endDate]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating non-negotiable:', error);
    throw error;
  }
}

export async function getUserNonNegotiables(userId: number): Promise<NonNegotiable[]> {
  try {
    const result = await pool.query(
      `SELECT * FROM non_negotiables
       WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching non-negotiables:', error);
    throw error;
  }
}

export async function toggleNonNegotiableCompletion(
  nonNegotiableId: number,
  userId: number,
  date: string,
  completed: boolean
): Promise<NonNegotiableTracking> {
  try {
    const result = await pool.query(
      `INSERT INTO non_negotiables_tracking (non_negotiable_id, user_id, date, completed, completed_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (non_negotiable_id, date)
       DO UPDATE SET completed = $4, completed_at = $5
       RETURNING *`,
      [
        nonNegotiableId,
        userId,
        date,
        completed,
        completed ? new Date() : null,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error toggling non-negotiable completion:', error);
    throw error;
  }
}

export async function getTodayNonNegotiables(userId: number) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT
        nn.*,
        nnt.id as tracking_id,
        nnt.completed as completed,
        nnt.completed_at
       FROM non_negotiables nn
       LEFT JOIN non_negotiables_tracking nnt
         ON nn.id = nnt.non_negotiable_id AND nnt.date = $2
       WHERE nn.user_id = $1 AND nn.is_active = true
       ORDER BY nn.created_at DESC`,
      [userId, today]
    );

    return result.rows.map((row) => ({
      ...row,
      completed: row.completed || false,
    }));
  } catch (error) {
    console.error('Error fetching today non-negotiables:', error);
    throw error;
  }
}

export async function deleteNonNegotiable(id: number, userId: number): Promise<boolean> {
  try {
    const result = await pool.query(
      `UPDATE non_negotiables SET is_active = false
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting non-negotiable:', error);
    throw error;
  }
}

export async function resetExpiredNonNegotiables(): Promise<number> {
  try {
    const result = await pool.query(
      `UPDATE non_negotiables
       SET is_active = false
       WHERE is_active = true AND end_date <= CURRENT_TIMESTAMP
       RETURNING id`
    );

    console.log(`✅ Reset ${result.rows.length} expired non-negotiables`);
    return result.rows.length;
  } catch (error) {
    console.error('Error resetting expired non-negotiables:', error);
    throw error;
  }
}

export async function getMonthlyCompletionStats(userId: number, nonNegotiableId: number) {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_days,
        SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_days
       FROM non_negotiables_tracking
       WHERE user_id = $1
       AND non_negotiable_id = $2
       AND date >= DATE_TRUNC('month', CURRENT_DATE)
       AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'`,
      [userId, nonNegotiableId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    throw error;
  }
}
