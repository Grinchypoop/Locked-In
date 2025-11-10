import pool from '../database/db';

interface WorkHours {
  id: number;
  user_id: number;
  date: string;
  hours: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export async function logWorkHours(
  userId: number,
  date: string,
  hours: number,
  notes?: string
): Promise<WorkHours> {
  try {
    const result = await pool.query(
      `INSERT INTO work_hours (user_id, date, hours, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, date)
       DO UPDATE SET hours = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, date, hours, notes]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error logging work hours:', error);
    throw error;
  }
}

export async function getTodayWorkHours(userId: number): Promise<WorkHours | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT * FROM work_hours WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching today work hours:', error);
    throw error;
  }
}

export async function getWeeklyWorkHours(userId: number) {
  try {
    const result = await pool.query(
      `SELECT
        DATE_TRUNC('day', date)::date as date,
        hours,
        notes
       FROM work_hours
       WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY date DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching weekly work hours:', error);
    throw error;
  }
}

export async function getMonthlyWorkHours(userId: number) {
  try {
    const result = await pool.query(
      `SELECT
        DATE_TRUNC('day', date)::date as date,
        hours,
        notes,
        SUM(hours) OVER (ORDER BY date) as cumulative_hours
       FROM work_hours
       WHERE user_id = $1
       AND date >= DATE_TRUNC('month', CURRENT_DATE)
       ORDER BY date DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching monthly work hours:', error);
    throw error;
  }
}

export async function getWorkHoursStats(userId: number) {
  try {
    const result = await pool.query(
      `SELECT
        ROUND(AVG(hours)::numeric, 2) as avg_hours_per_day,
        SUM(hours) as total_hours_week,
        MAX(hours) as max_hours_day,
        MIN(hours) as min_hours_day,
        COUNT(*) as days_logged
       FROM work_hours
       WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching work hours stats:', error);
    throw error;
  }
}

export async function deleteWorkHours(userId: number, date: string): Promise<boolean> {
  try {
    const result = await pool.query(
      'DELETE FROM work_hours WHERE user_id = $1 AND date = $2 RETURNING id',
      [userId, date]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting work hours:', error);
    throw error;
  }
}
