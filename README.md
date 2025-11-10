# Killjoy - Founder Discipline & Productivity Tracker

A comprehensive Telegram Mini App for tracking founder discipline, productivity, and fitness goals. Integrates with your existing workout bot, Notion calendar, and provides unified streak tracking across all metrics.

## Features

### 1. Non-Negotiables Tracker
- Daily checklist of non-negotiable tasks/habits
- Simple tick/untick interface
- Configurable list with custom durations (default 90 days)
- Auto-reset after duration expires
- Monthly completion statistics

### 2. Workout Tracking
- Log workouts with type, duration, and intensity
- Automatic sync from your existing Telegram workout bot
- Weekly and monthly workout statistics
- Workout streaks tracking
- Activity intensity levels (light, moderate, intense)

### 3. Work Hours Tracking
- Manual daily work hours logging
- Daily/weekly/monthly aggregations
- Running cumulative totals
- Average hours per day calculations
- Work hour streaks

### 4. Unified Streaks Dashboard
- Combined view of all metrics streaks
- Current vs. best streak comparisons
- Visual streak calendar (heatmap style)
- Motivational progress statistics
- Completion percentages

### 5. Calendar Integration
- Read-only access to Notion Calendar
- Display today's schedule
- Show upcoming tasks/meetings (next 14 days)
- Time blocking visualization

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **APIs**: Notion API, Telegram Mini App API
- **Task Scheduling**: node-cron
- **Authentication**: Telegram Mini App validation

### Frontend
- **Framework**: React 19 + TypeScript
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **UI Framework**: Custom CSS (Telegram UI compatible)

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Telegram Bot Token (from BotFather)
- Notion API Key (optional for calendar)

### 1. Clone & Install Dependencies

```bash
# Install all dependencies
npm install

# Install frontend dependencies separately
cd frontend
npm install
cd ..
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb killjoy_db

# Run migrations (schema is auto-initialized on first run)
npm run build && npm start
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=killjoy_db
DB_USER=postgres
DB_PASSWORD=your_password

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret

# Notion (optional)
NOTION_API_KEY=your_notion_api_key
NOTION_CALENDAR_DB_ID=your_calendar_db_id

# Workout Bot
WORKOUT_BOT_TOKEN=8585822791:AAEl9hwTzz0bLNv6ZUln-mrfwwUSrX9M88o

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 4. Start Development

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend (in frontend directory)
cd frontend
npm run dev
```

Backend will run on `http://localhost:3000`
Frontend will run on `http://localhost:5173`

## API Endpoints

All endpoints require Telegram Mini App authentication via `X-Telegram-Init-Data` header.

### Non-Negotiables
- `GET /api/non-negotiables` - List all
- `GET /api/non-negotiables/today` - Today's tasks
- `POST /api/non-negotiables` - Create
- `POST /api/non-negotiables/:id/toggle` - Toggle completion
- `DELETE /api/non-negotiables/:id` - Delete
- `GET /api/non-negotiables/:id/stats` - Monthly stats

### Work Hours
- `GET /api/work-hours/today` - Today's hours
- `GET /api/work-hours/week` - Weekly history
- `GET /api/work-hours/month` - Monthly history
- `POST /api/work-hours/log` - Log hours
- `GET /api/work-hours/stats` - Weekly statistics
- `DELETE /api/work-hours/:date` - Delete entry

### Workouts
- `GET /api/workouts/today` - Today's workout
- `GET /api/workouts/week` - Weekly workouts
- `GET /api/workouts/month` - Monthly workouts
- `POST /api/workouts/log` - Log workout
- `GET /api/workouts/stats` - Monthly statistics
- `POST /api/workouts/sync-bot` - Sync from workout bot

### Streaks
- `GET /api/streaks/dashboard` - All streaks
- `GET /api/streaks/calendar/:metricType` - Heatmap data
- `POST /api/streaks/recalculate` - Recalculate streaks

### Calendar
- `GET /api/calendar/today` - Today's events
- `GET /api/calendar/upcoming?days=7` - Upcoming events
- `GET /api/calendar/cached` - Cached events

## Database Schema

### Core Tables
- `users` - User accounts
- `non_negotiables` - Non-negotiable items
- `non_negotiables_tracking` - Daily tracking
- `work_hours` - Work hours logs
- `workouts` - Workout data
- `streaks` - Streak cache
- `streak_calendar` - Heatmap data
- `notion_calendar_cache` - Notion events cache

## Cron Jobs

Automatic tasks running in the background:

- **Midnight**: Reset expired non-negotiables
- **Every 6 hours**: Sync and recalculate streaks
- **Every 4 hours**: Sync Notion Calendar
- **Weekly (Sunday)**: Clean up old cache entries

## Deployment

### Option 1: Railway
```bash
railway link
railway deploy
```

### Option 2: Render
```bash
git push
# Configure in Render dashboard
```

### Option 3: Vercel (Frontend)
```bash
vercel deploy
```

## Configuration in Telegram

1. Create a Mini App with BotFather
2. Set the Mini App URL to your deployed frontend
3. Users can access via the bot's menu

## Future Enhancements

- [ ] Forest App integration
- [ ] Email notifications
- [ ] Data export (CSV, PDF)
- [ ] Custom reminders
- [ ] Social sharing
- [ ] Mobile app wrapper
- [ ] Advanced analytics

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Run `npm run dev` to auto-initialize schema

### Telegram Auth Failing
- Verify bot token is correct
- Check Mini App is properly configured
- Ensure frontend URL matches Telegram settings

### Notion Calendar Not Showing
- Generate Notion API key from integration settings
- Share the calendar database with the integration
- Set `NOTION_CALENDAR_DB_ID` in `.env`

## License

MIT

## Support

For issues and feature requests, please create an issue in the repository.
