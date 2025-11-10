import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/db';
import { authenticateTelegramUser } from './middleware/auth';
import { initializeCronJobs } from './services/cronJobs';

// Routes
import nonNegotiablesRoutes from './routes/nonNegotiables';
import workHoursRoutes from './routes/workHours';
import workoutsRoutes from './routes/workouts';
import streaksRoutes from './routes/streaks';
import calendarRoutes from './routes/calendar';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth test endpoint
app.post('/auth/test', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      res.status(400).json({ error: 'initData is required' });
      return;
    }

    // Set header and call middleware
    req.headers['x-telegram-init-data'] = initData;
    await new Promise((resolve, reject) => {
      authenticateTelegramUser(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    if (req.userId) {
      res.json({
        success: true,
        userId: req.userId,
        telegramId: req.telegramId,
        user: req.telegramUser,
      });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error('Auth test error:', error);
    res.status(500).json({ error: 'Authentication test failed' });
  }
});

// API Routes (all protected)
app.use('/api/non-negotiables', authenticateTelegramUser, nonNegotiablesRoutes);
app.use('/api/work-hours', authenticateTelegramUser, workHoursRoutes);
app.use('/api/workouts', authenticateTelegramUser, workoutsRoutes);
app.use('/api/streaks', authenticateTelegramUser, streaksRoutes);
app.use('/api/calendar', authenticateTelegramUser, calendarRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function start() {
  try {
    console.log('🚀 Starting Killjoy Productivity App...');

    // Initialize database
    await initializeDatabase();

    // Initialize cron jobs
    initializeCronJobs();

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
