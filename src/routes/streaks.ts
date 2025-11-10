import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as streaksService from '../services/streaksService';

const router = Router();

// Get all streaks for user
router.get('/dashboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const streaks = await streaksService.getUserStreaks(req.userId!);

    // Calculate total completion percentage
    const totalCompletions = streaks.reduce((sum, streak) => sum + streak.current_streak, 0);
    const totalPossible = streaks.length * 30; // Assume 30-day month

    res.json({
      streaks,
      summary: {
        total_streaks: streaks.length,
        average_streak_length: streaks.length > 0
          ? Math.round(streaks.reduce((sum, s) => sum + s.current_streak, 0) / streaks.length)
          : 0,
        completion_percentage: Math.round((totalCompletions / totalPossible) * 100),
      },
    });
  } catch (error) {
    console.error('Error fetching streaks:', error);
    res.status(500).json({ error: 'Failed to fetch streaks' });
  }
});

// Get streak calendar for a metric
router.get('/calendar/:metricType', requireAuth, async (req: Request, res: Response) => {
  try {
    const { metricType } = req.params;
    const calendar = await streaksService.getStreakCalendar(req.userId!, metricType);

    res.json(calendar);
  } catch (error) {
    console.error('Error fetching streak calendar:', error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// Recalculate all streaks
router.post('/recalculate', requireAuth, async (req: Request, res: Response) => {
  try {
    const streaks = await streaksService.calculateAndUpdateStreaks(req.userId!);
    res.json({ message: 'Streaks recalculated', streaks });
  } catch (error) {
    console.error('Error recalculating streaks:', error);
    res.status(500).json({ error: 'Failed to recalculate streaks' });
  }
});

export default router;
