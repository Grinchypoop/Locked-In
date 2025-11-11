import cron from 'node-cron';
import * as nonNegotiablesService from './nonNegotiablesService';
import * as streaksService from './streaksService';
import * as notionService from './notionService';
import pool from '../database/db';

// Reset expired non-negotiables daily at midnight
export function scheduleNonNegotiablesReset() {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('⏰ Running non-negotiables reset job...');
      await nonNegotiablesService.resetExpiredNonNegotiables();
    } catch (error) {
      console.error('❌ Error in non-negotiables reset job:', error);
    }
  });
}

// Sync streaks for all users every 6 hours
export function scheduleSyncStreaks() {
  cron.schedule('0 */6 * * *', async () => {
    try {
      console.log('⏰ Running streak sync job for all users...');
      const usersResult = await pool.query('SELECT id FROM users');

      for (const user of usersResult.rows) {
        try {
          await streaksService.calculateAndUpdateStreaks(user.id);
        } catch (error) {
          console.error(`Error syncing streaks for user ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in streak sync job:', error);
    }
  });
}

// Sync Notion calendar every 4 hours
export function scheduleSyncNotionCalendar() {
  cron.schedule('0 */4 * * *', async () => {
    try {
      const apiKey = process.env.NOTION_API_KEY;
      const databaseId = process.env.NOTION_CALENDAR_DB_ID;

      if (!apiKey || !databaseId) {
        console.log('⏰ Notion calendar sync skipped (not configured)');
        return;
      }

      console.log('⏰ Running Notion calendar sync job...');
      const usersResult = await pool.query('SELECT id FROM users');

      for (const user of usersResult.rows) {
        try {
          await notionService.getNotionCalendarEvents(apiKey, databaseId, user.id, 30);
        } catch (error) {
          console.error(`Error syncing Notion calendar for user ${user.id}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Error in Notion sync job:', error);
    }
  });
}

// Clean up old calendar cache every week
export function scheduleCleanupOldCache() {
  cron.schedule('0 0 * * 0', async () => {
    try {
      console.log('⏰ Running cache cleanup job...');
      await pool.query(
        `DELETE FROM notion_calendar_cache
         WHERE event_date < CURRENT_DATE - INTERVAL '30 days'`
      );
      console.log('✅ Cache cleanup completed');
    } catch (error) {
      console.error('❌ Error in cache cleanup job:', error);
    }
  });
}

// Initialize all cron jobs
export function initializeCronJobs() {
  console.log('🚀 Initializing cron jobs...');
  try {
    scheduleNonNegotiablesReset();
    scheduleSyncStreaks();
    scheduleSyncNotionCalendar();
    scheduleCleanupOldCache();
    console.log('✅ All cron jobs initialized');
  } catch (error) {
    console.error('❌ Error initializing cron jobs:', error);
    // Don't throw - cron jobs are non-critical
  }
}
