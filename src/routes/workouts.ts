import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import * as workoutService from '../services/workoutService';
import * as streaksService from '../services/streaksService';

const router = Router();

// Get today's workout
router.get('/today', requireAuth, async (req: Request, res: Response) => {
  try {
    const workout = await workoutService.getTodayWorkout(req.userId!);
    res.json(workout || { completed: false });
  } catch (error) {
    console.error('Error fetching today workout:', error);
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

// Get weekly workouts
router.get('/week', requireAuth, async (req: Request, res: Response) => {
  try {
    const workouts = await workoutService.getWeeklyWorkouts(req.userId!);
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching weekly workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// Get monthly workouts
router.get('/month', requireAuth, async (req: Request, res: Response) => {
  try {
    const workouts = await workoutService.getMonthlyWorkouts(req.userId!);
    res.json(workouts);
  } catch (error) {
    console.error('Error fetching monthly workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// Get workout stats
router.get('/stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const stats = await workoutService.getWorkoutStats(req.userId!);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Add a workout
router.post('/log', requireAuth, async (req: Request, res: Response) => {
  try {
    const { date, workout_type, duration_minutes, intensity, notes } = req.body;

    if (!date || !workout_type) {
      res.status(400).json({ error: 'Date and workout type are required' });
      return;
    }

    const workout = await workoutService.addWorkout(
      req.userId!,
      date,
      workout_type,
      duration_minutes || 0,
      intensity || 'moderate',
      notes
    );

    // Update streaks
    await streaksService.updateStreakCalendar(req.userId!, date, 'workouts', true);
    await streaksService.calculateAndUpdateStreaks(req.userId!);

    res.status(201).json(workout);
  } catch (error) {
    console.error('Error adding workout:', error);
    res.status(500).json({ error: 'Failed to add workout' });
  }
});

// Get current workout streak
router.get('/streak', requireAuth, async (req: Request, res: Response) => {
  try {
    const streak = await workoutService.getWorkoutStreak(req.userId!);
    res.json({ streak });
  } catch (error) {
    console.error('Error fetching streak:', error);
    res.status(500).json({ error: 'Failed to fetch streak' });
  }
});

// Sync workouts from external bot
router.post('/sync-bot', requireAuth, async (req: Request, res: Response) => {
  try {
    const { date } = req.body;
    const botToken = process.env.WORKOUT_BOT_TOKEN;

    if (!botToken) {
      res.status(500).json({ error: 'Workout bot not configured' });
      return;
    }

    const workout = await workoutService.syncWorkoutFromBot(
      req.userId!,
      botToken,
      date || new Date().toISOString().split('T')[0]
    );

    if (!workout) {
      res.status(404).json({ error: 'No workout found from bot' });
      return;
    }

    res.json(workout);
  } catch (error) {
    console.error('Error syncing workout from bot:', error);
    res.status(500).json({ error: 'Failed to sync workout' });
  }
});

export default router;
