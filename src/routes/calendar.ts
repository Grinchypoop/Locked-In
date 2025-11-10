import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as notionService from '../services/notionService';

const router = Router();

// Get today's calendar events
router.get('/today', requireAuth, async (req: Request, res: Response) => {
  try {
    const events = await notionService.getTodayCalendarEvents(req.userId!);
    res.json(events);
  } catch (error) {
    console.error('Error fetching today calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Get upcoming events from Notion
router.get('/upcoming', requireAuth, async (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const daysAhead = days ? parseInt(days as string) : 7;

    const apiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_CALENDAR_DB_ID;

    if (!apiKey || !databaseId) {
      // Return cached events if Notion not configured
      const events = await notionService.getCachedNotionEvents(req.userId!);
      res.json(events);
      return;
    }

    const events = await notionService.getNotionCalendarEvents(
      apiKey,
      databaseId,
      req.userId!,
      daysAhead
    );

    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    // Return cached events on error
    const cachedEvents = await notionService.getCachedNotionEvents(req.userId!);
    res.json(cachedEvents);
  }
});

// Get cached events (fallback)
router.get('/cached', requireAuth, async (req: Request, res: Response) => {
  try {
    const events = await notionService.getCachedNotionEvents(req.userId!);
    res.json(events);
  } catch (error) {
    console.error('Error fetching cached events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;
