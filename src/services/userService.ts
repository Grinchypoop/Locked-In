import pool from '../database/db';

interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

interface UserData {
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export async function getOrCreateUser(userData: UserData): Promise<User> {
  try {
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [userData.telegram_id]
    );

    if (existingUser.rows.length > 0) {
      return existingUser.rows[0];
    }

    // Create new user
    const newUser = await pool.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userData.telegram_id, userData.username, userData.first_name, userData.last_name]
    );

    console.log(`✅ New user created: ${userData.first_name} (${userData.telegram_id})`);
    return newUser.rows[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function getUserByTelegramId(telegramId: number): Promise<User | null> {
  try {
    const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by telegram ID:', error);
    throw error;
  }
}
