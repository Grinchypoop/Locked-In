import pool from '../database/db';
import axios from 'axios';

interface NotionEvent {
  id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  event_date: string;
}

const NOTION_API_BASE = 'https://api.notion.com/v1';

export async function getNotionCalendarEvents(
  apiKey: string,
  databaseId: string,
  userId: number,
  daysAhead: number = 7
): Promise<NotionEvent[]> {
  try {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    const response = await axios.post(
      `${NOTION_API_BASE}/databases/${databaseId}/query`,
      {
        filter: {
          and: [
            {
              property: 'Date',
              date: {
                on_or_after: today.toISOString().split('T')[0],
              },
            },
            {
              property: 'Date',
              date: {
                on_or_before: endDate.toISOString().split('T')[0],
              },
            },
          ],
        },
        sorts: [
          {
            property: 'Date',
            direction: 'ascending',
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
      }
    );

    const events: NotionEvent[] = response.data.results.map((page: any) => ({
      id: page.id,
      title: page.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      description: page.properties.Description?.rich_text?.[0]?.plain_text,
      start_time: new Date(page.properties.Date?.date?.start),
      end_time: page.properties.Date?.date?.end
        ? new Date(page.properties.Date.date.end)
        : new Date(page.properties.Date?.date?.start),
      event_date: page.properties.Date?.date?.start?.split('T')[0],
    }));

    // Cache events in database
    for (const event of events) {
      await cacheNotionEvent(userId, event);
    }

    return events;
  } catch (error) {
    console.error('Error fetching Notion calendar events:', error);
    // Return cached events if API fails
    return getCachedNotionEvents(userId);
  }
}

async function cacheNotionEvent(userId: number, event: NotionEvent): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO notion_calendar_cache (user_id, event_id, title, description, start_time, end_time, event_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (event_id)
       DO UPDATE SET title = $3, description = $4, start_time = $5, end_time = $6
       RETURNING *`,
      [userId, event.id, event.title, event.description, event.start_time, event.end_time, event.event_date]
    );
  } catch (error) {
    console.error('Error caching Notion event:', error);
  }
}

export async function getCachedNotionEvents(userId: number): Promise<NotionEvent[]> {
  try {
    const result = await pool.query(
      `SELECT
        event_id as id,
        title,
        description,
        start_time,
        end_time,
        event_date
       FROM notion_calendar_cache
       WHERE user_id = $1
       AND event_date >= CURRENT_DATE
       ORDER BY event_date ASC
       LIMIT 30`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching cached Notion events:', error);
    return [];
  }
}

export async function getTodayCalendarEvents(userId: number): Promise<NotionEvent[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT
        event_id as id,
        title,
        description,
        start_time,
        end_time,
        event_date
       FROM notion_calendar_cache
       WHERE user_id = $1
       AND event_date = $2
       ORDER BY start_time ASC`,
      [userId, today]
    );

    return result.rows;
  } catch (error) {
    console.error('Error fetching today calendar events:', error);
    return [];
  }
}
