import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as workHoursService from '../services/workHoursService';
import * as streaksService from '../services/streaksService';

const router = Router();

// Get today's work hours
router.get('/today', requireAuth, async (req: Request, res: Response) => {
  try {
    const workHours = await workHoursService.getTodayWorkHours(req.userId!);
    res.json(workHours || { hours: 0 });
  } catch (error) {
    console.error('Error fetching today work hours:', error);
    res.status(500).json({ error: 'Failed to fetch work hours' });
  }
});

// Get weekly work hours
router.get('/week', requireAuth, async (req: Request, res: Response) => {
  try {
    const workHours = await workHoursService.getWeeklyWorkHours(req.userId!);
    res.json(workHours);
  } catch (error) {
    console.error('Error fetching weekly work hours:', error);
    res.status(500).json({ error: 'Failed to fetch weekly work hours' });
  }
});

// Get monthly work hours
router.get('/month', requireAuth, async (req: Request, res: Response) => {
  try {
    const workHours = await workHoursService.getMonthlyWorkHours(req.userId!);
    res.json(workHours);
  } catch (error) {
    console.error('Error fetching monthly work hours:', error);
    res.status(500).json({ error: 'Failed to fetch monthly work hours' });
  }
});

// Get work hours stats
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const stats = await workHoursService.getWorkHoursStats(req.userId!);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching work hours stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Log work hours for a date
router.post('/log', requireAuth, async (req: Request, res: Response) => {
  try {
    const { date, hours, notes } = req.body;

    if (!date || hours === undefined) {
      res.status(400).json({ error: 'Date and hours are required' });
      return;
    }

    if (hours < 0 || hours > 24) {
      res.status(400).json({ error: 'Hours must be between 0 and 24' });
      return;
    }

    const workHours = await workHoursService.logWorkHours(req.userId!, date, hours, notes);

    // Update streaks
    await streaksService.updateStreakCalendar(req.userId!, date, 'work_hours', hours > 0);
    await streaksService.calculateAndUpdateStreaks(req.userId!);

    res.json(workHours);
  } catch (error) {
    console.error('Error logging work hours:', error);
    res.status(500).json({ error: 'Failed to log work hours' });
  }
});

// Delete work hours for a date
router.delete('/:date', requireAuth, async (req: Request, res: Response) => {
  try {
    const success = await workHoursService.deleteWorkHours(req.userId!, req.params.date);

    if (!success) {
      res.status(404).json({ error: 'Work hours record not found' });
      return;
    }

    res.json({ message: 'Work hours deleted successfully' });
  } catch (error) {
    console.error('Error deleting work hours:', error);
    res.status(500).json({ error: 'Failed to delete work hours' });
  }
});

export default router;
