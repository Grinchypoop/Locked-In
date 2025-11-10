import pool from '../database/db';
import axios from 'axios';

interface Workout {
  id: number;
  user_id: number;
  date: string;
  workout_type?: string;
  duration_minutes?: number;
  intensity?: string;
  notes?: string;
  external_id?: string;
  created_at: Date;
  updated_at: Date;
}

export async function syncWorkoutFromBot(
  userId: number,
  botToken: string,
  date: string
): Promise<Workout | null> {
  try {
    // Get workout data from your workout bot API
    // This is a placeholder - adjust based on your actual bot's API
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/method/getWorkout`, {
      params: {
        user_id: userId,
        date: date,
      },
    });

    if (!response.data.ok) {
      return null;
    }

    const workoutData = response.data.result;

    // Save to database
    const result = await pool.query(
      `INSERT INTO workouts (user_id, date, workout_type, duration_minutes, intensity, notes, external_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, date, external_id)
       DO UPDATE SET workout_type = $3, duration_minutes = $4, intensity = $5, notes = $6
       RETURNING *`,
      [
        userId,
        date,
        workoutData.type,
        workoutData.duration,
        workoutData.intensity,
        workoutData.notes,
        workoutData.id,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error syncing workout:', error);
    return null;
  }
}

export async function getTodayWorkout(userId: number): Promise<Workout | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT * FROM workouts WHERE user_id = $1 AND date = $2 LIMIT 1',
      [userId, today]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching today workout:', error);
    return null;
  }
}

export async function getWeeklyWorkouts(userId: number): Promise<Workout[]> {
  try {
    const result = await pool.query(
      `SELECT * FROM workouts
       WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY date DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching weekly workouts:', error);
    throw error;
  }
}

export async function getMonthlyWorkouts(userId: number): Promise<Workout[]> {
  try {
    const result = await pool.query(
      `SELECT * FROM workouts
       WHERE user_id = $1
       AND date >= DATE_TRUNC('month', CURRENT_DATE)
       ORDER BY date DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching monthly workouts:', error);
    throw error;
  }
}

export async function getWorkoutStats(userId: number) {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_workouts,
        ROUND(AVG(duration_minutes)::numeric, 2) as avg_duration,
        SUM(duration_minutes) as total_minutes,
        COUNT(DISTINCT date) as days_with_workouts
       FROM workouts
       WHERE user_id = $1
       AND date >= CURRENT_DATE - INTERVAL '30 days'`,
      [userId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    throw error;
  }
}

export async function addWorkout(
  userId: number,
  date: string,
  workoutType: string,
  durationMinutes: number,
  intensity: string,
  notes?: string
): Promise<Workout> {
  try {
    const result = await pool.query(
      `INSERT INTO workouts (user_id, date, workout_type, duration_minutes, intensity, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date, external_id)
       DO UPDATE SET workout_type = $3, duration_minutes = $4, intensity = $5, notes = $6
       RETURNING *`,
      [userId, date, workoutType, durationMinutes, intensity, notes]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error adding workout:', error);
    throw error;
  }
}

export async function getWorkoutStreak(userId: number): Promise<number> {
  try {
    const result = await pool.query(
      `WITH RECURSIVE streak AS (
        SELECT date, ROW_NUMBER() OVER (ORDER BY date DESC) -
               ROW_NUMBER() OVER (ORDER BY date DESC, (CURRENT_DATE - date) DAYS) as grp
        FROM (
          SELECT DISTINCT DATE(date) as date
          FROM workouts
          WHERE user_id = $1
        ) t
      )
      SELECT COUNT(*) as streak
      FROM streak
      WHERE grp = (SELECT grp FROM streak ORDER BY date DESC LIMIT 1)`,
      [userId]
    );

    return parseInt(result.rows[0]?.streak || '0');
  } catch (error) {
    console.error('Error calculating workout streak:', error);
    return 0;
  }
}
