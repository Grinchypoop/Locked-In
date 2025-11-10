import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as nonNegotiablesService from '../services/nonNegotiablesService';
import * as streaksService from '../services/streaksService';

const router = Router();

// Get all non-negotiables for user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const nonNegotiables = await nonNegotiablesService.getUserNonNegotiables(req.userId!);
    res.json(nonNegotiables);
  } catch (error) {
    console.error('Error fetching non-negotiables:', error);
    res.status(500).json({ error: 'Failed to fetch non-negotiables' });
  }
});

// Get today's non-negotiables with tracking
router.get('/today', requireAuth, async (req: Request, res: Response) => {
  try {
    const todayNonNegotiables = await nonNegotiablesService.getTodayNonNegotiables(req.userId!);
    res.json(todayNonNegotiables);
  } catch (error) {
    console.error('Error fetching today non-negotiables:', error);
    res.status(500).json({ error: 'Failed to fetch today non-negotiables' });
  }
});

// Create new non-negotiable
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description, duration_days } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const nonNegotiable = await nonNegotiablesService.createNonNegotiable(
      req.userId!,
      title,
      description,
      duration_days || 90
    );

    res.status(201).json(nonNegotiable);
  } catch (error) {
    console.error('Error creating non-negotiable:', error);
    res.status(500).json({ error: 'Failed to create non-negotiable' });
  }
});

// Toggle non-negotiable completion
router.post('/:id/toggle', requireAuth, async (req: Request, res: Response) => {
  try {
    const { date, completed } = req.body;
    const nonNegotiableId = parseInt(req.params.id);

    if (!date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    const tracking = await nonNegotiablesService.toggleNonNegotiableCompletion(
      nonNegotiableId,
      req.userId!,
      date,
      completed
    );

    // Update streaks
    await streaksService.updateStreakCalendar(req.userId!, date, 'non_negotiables', completed);
    await streaksService.calculateAndUpdateStreaks(req.userId!);

    res.json(tracking);
  } catch (error) {
    console.error('Error toggling non-negotiable:', error);
    res.status(500).json({ error: 'Failed to toggle non-negotiable' });
  }
});

// Delete non-negotiable
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const nonNegotiableId = parseInt(req.params.id);
    const success = await nonNegotiablesService.deleteNonNegotiable(nonNegotiableId, req.userId!);

    if (!success) {
      res.status(404).json({ error: 'Non-negotiable not found' });
      return;
    }

    res.json({ message: 'Non-negotiable deleted successfully' });
  } catch (error) {
    console.error('Error deleting non-negotiable:', error);
    res.status(500).json({ error: 'Failed to delete non-negotiable' });
  }
});

// Get monthly stats for a non-negotiable
router.get('/:id/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const nonNegotiableId = parseInt(req.params.id);
    const stats = await nonNegotiablesService.getMonthlyCompletionStats(req.userId!, nonNegotiableId);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
