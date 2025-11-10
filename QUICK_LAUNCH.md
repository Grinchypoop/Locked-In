# 🚀 Quick Launch Guide

Your Telegram bot token is configured! Here's what to do next:

## Step 1: Create Database (if not done)
```bash
createdb killjoy_db
```

## Step 2: Install Dependencies (if not done)
```bash
npm install
cd frontend && npm install && cd ..
```

## Step 3: Start Backend (Terminal 1)
```bash
npm run dev
```

You should see:
```
✅ Database schema initialized successfully
🚀 Starting Killjoy Productivity App...
✅ All cron jobs initialized
✅ Server running on http://localhost:3000
```

## Step 4: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

You should see:
```
✅ Local: http://localhost:5173
```

## Step 5: Set Up Mini App in Telegram

### Via BotFather:
1. Open Telegram
2. Message **@BotFather**
3. Send `/mybots`
4. Select your bot (Killjoy related one)
5. Click **"Bot Settings"**
6. Click **"Menu Button"**
7. Select **"Web App"**
8. Enter URL: `http://localhost:5173`
9. Click "Done"

## Step 6: Test the App

1. Open Telegram
2. Search for your bot (created with that token)
3. Click the **Menu button** at bottom
4. Click **"Open Web App"**
5. App should load and ask for permissions
6. Grant permissions
7. You're in! 🎉

## What to Test First

1. **Create a Non-Negotiable**
   - Click Tasks tab
   - Add "Morning Meditation" (90 days)
   - Click checkbox to complete

2. **Log Work Hours**
   - Click Work tab
   - Enter "8" hours
   - Click "Log Hours"

3. **Log a Workout**
   - Click Workout tab
   - Select "Running"
   - Enter "30" minutes
   - Click "Log Workout"

4. **Check Streaks**
   - Click Overview tab
   - See your streaks building!

## Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000
# Kill it if needed
kill -9 <PID>

# Or change PORT in .env
PORT=3001
```

### Frontend won't start
```bash
cd frontend
npm install  # Reinstall deps
npm run dev
```

### Database error
```bash
# Make sure PostgreSQL is running
pg_isready

# Create database if missing
createdb killjoy_db

# Check connection
psql -U postgres -d killjoy_db
```

### Telegram Mini App not showing menu
- Check bot token in .env matches your bot
- Verify Mini App URL is set in BotFather settings
- Restart Telegram app
- Try incognito/private mode

## Environment Variables

Your `.env` file is now configured with:
- ✅ Telegram bot token
- ✅ Database settings (needs password if not empty)
- ✅ Workout bot token
- ✅ Frontend URL

Optional (if you want them):
- Notion API key (for calendar)
- Forest API key (for focus tracking)

## Database Note

If your PostgreSQL user requires a password:

```bash
# Edit .env
DB_PASSWORD=your_password_here

# OR use a connection string in code
```

## Next Steps

- Read **START_HERE.md** for more details
- Read **CHECKLIST.md** for comprehensive setup
- Check **README.md** for full documentation
- Follow **DEPLOY.md** when ready to go live

---

**Everything is ready! Start with Step 3 above.** 🎉
