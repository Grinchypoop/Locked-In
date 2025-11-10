# Killjoy Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Setup Database

Make sure PostgreSQL is running, then:

```bash
# Create the database
createdb killjoy_db

# Or if you use postgres user:
# sudo -u postgres createdb killjoy_db
```

### 3. Configure Environment

Create `.env` file in root:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=killjoy_db
DB_USER=postgres
DB_PASSWORD=

TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
TELEGRAM_WEBHOOK_SECRET=secret123
WORKOUT_BOT_TOKEN=8585822791:AAEl9hwTzz0bLNv6ZUln-mrfwwUSrX9M88o

FRONTEND_URL=http://localhost:5173

# Optional - Only if you want Notion Calendar integration
NOTION_API_KEY=
NOTION_CALENDAR_DB_ID=
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## Telegram Bot Setup

### Get Your Bot Token:
1. Open Telegram and message `@BotFather`
2. Send `/newbot`
3. Give it a name and username
4. Copy the token provided (looks like `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
5. Paste in `.env` as `TELEGRAM_BOT_TOKEN`

### Create Mini App:
1. Message `@BotFather` again
2. Send `/mybots`
3. Choose your bot
4. Select "Bot Settings" → "Menu Button"
5. Set to "Web App"
6. Set URL to `http://localhost:5173` (for local) or your deployed URL

## Notion Calendar (Optional)

### Setup Notion Integration:
1. Go to https://www.notion.com/my-integrations
2. Click "Create new integration"
3. Name it "Killjoy"
4. Copy the "Internal Integration Token"
5. Paste in `.env` as `NOTION_API_KEY`

### Share Calendar with Integration:
1. Open your Notion Calendar
2. Click "..." (three dots) → "Add connections"
3. Search for "Killjoy"
4. Copy the Database ID from the URL (after `/database/`)
5. Paste in `.env` as `NOTION_CALENDAR_DB_ID`

## Verify Everything Works

### Test Backend:
```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","timestamp":"..."}
```

### Test Frontend:
Open `http://localhost:5173` - you should see Killjoy loading screen

Note: Frontend will require opening from Telegram Mini App to authenticate properly.

## Build for Production

### Backend:
```bash
npm run build
npm start
```

### Frontend:
```bash
cd frontend
npm run build
# Upload dist/ folder to your hosting
```

## Common Issues

### "Cannot find module 'pg'"
```bash
npm install pg
```

### "Database connection failed"
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Try: `psql -U postgres -d killjoy_db`

### "Telegram Mini App not loading"
- Ensure bot token is correct
- Mini App URL must be HTTPS in production
- Check frontend URL in `.env` and Telegram settings match

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or change PORT in .env
```

## Next Steps

1. Add your non-negotiables in the app
2. Log your daily work hours and workouts
3. Watch your streaks build up
4. Connect your Notion calendar
5. Deploy to production (Railway/Render)

## Support

Check the main README.md for:
- Full API documentation
- Database schema details
- Deployment guides
- Future enhancements roadmap
