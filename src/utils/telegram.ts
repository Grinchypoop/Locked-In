import crypto from 'crypto';

interface InitData {
  query_id?: string;
  user?: string;
  auth_date?: string;
  hash?: string;
  [key: string]: any;
}

export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): InitData | null {
  try {
    const data = new URLSearchParams(initData);
    const hash = data.get('hash');

    if (!hash) {
      console.error('No hash in initData');
      return null;
    }

    // Create check string
    const entries: string[] = [];
    data.forEach((value, key) => {
      if (key !== 'hash') {
        entries.push(`${key}=${value}`);
      }
    });

    const checkString = entries.sort().join('\n');

    // Verify signature
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    if (computedHash === hash) {
      const result: InitData = {};
      data.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }

    console.error('Hash verification failed');
    return null;
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return null;
  }
}

export function getTelegramUserId(initData: InitData): number | null {
  try {
    const userStr = initData.user;
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.id;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export function getTelegramUserInfo(initData: InitData) {
  try {
    const userStr = initData.user;
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}
