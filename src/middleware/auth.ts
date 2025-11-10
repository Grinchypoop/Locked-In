import { Request, Response, NextFunction } from 'express';
import { validateTelegramWebAppData, getTelegramUserId, getTelegramUserInfo } from '../utils/telegram';
import { getOrCreateUser } from '../services/userService';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      telegramId?: number;
      telegramUser?: any;
    }
  }
}

export async function authenticateTelegramUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      res.status(401).json({ error: 'Missing Telegram init data' });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      res.status(500).json({ error: 'Bot token not configured' });
      return;
    }

    // Validate Telegram data
    const validatedData = validateTelegramWebAppData(initData, botToken);
    if (!validatedData) {
      res.status(401).json({ error: 'Invalid Telegram authentication' });
      return;
    }

    // Get user info from Telegram
    const telegramId = getTelegramUserId(validatedData);
    const userInfo = getTelegramUserInfo(validatedData);

    if (!telegramId || !userInfo) {
      res.status(401).json({ error: 'Invalid user data' });
      return;
    }

    // Get or create user in database
    const user = await getOrCreateUser({
      telegram_id: telegramId,
      username: userInfo.username,
      first_name: userInfo.first_name,
      last_name: userInfo.last_name,
    });

    // Attach user info to request
    req.userId = user.id;
    req.telegramId = telegramId;
    req.telegramUser = userInfo;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.userId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
