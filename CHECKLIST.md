# Killjoy - Setup & Launch Checklist

## Pre-Launch Checklist

### ✅ Development Environment

- [x] Node.js 18+ installed
- [x] PostgreSQL installed and running
- [x] npm/yarn available
- [x] Git configured
- [x] Editor/IDE set up

### ✅ Project Files

- [x] Backend source code (`src/` directory)
  - [x] Database schema
  - [x] Services (7 modules)
  - [x] Routes (5 endpoints)
  - [x] Middleware (auth)
  - [x] Utils (telegram validation)

- [x] Frontend source code (`frontend/src/` directory)
  - [x] Main app component
  - [x] Pages (dashboard)
  - [x] Components (6 sections)
  - [x] Hooks (telegram integration)
  - [x] Store (zustand)
  - [x] API client
  - [x] Styles (CSS)

- [x] Configuration files
  - [x] tsconfig.json (backend)
  - [x] frontend/tsconfig.json
  - [x] vite.config.ts
  - [x] package.json (both)

- [x] Documentation
  - [x] README.md (comprehensive)
  - [x] SETUP.md (quick start)
  - [x] DEPLOY.md (production)
  - [x] ARCHITECTURE.md (technical)
  - [x] PROJECT_SUMMARY.md (overview)
  - [x] .env.example (template)

### 🔧 Installation Steps

- [ ] **Step 1: Install Dependencies**
  ```bash
  npm install
  cd frontend && npm install && cd ..
  ```
  - [ ] Backend dependencies installed
  - [ ] Frontend dependencies installed
  - [ ] node_modules created

- [ ] **Step 2: Create Database**
  ```bash
  createdb killjoy_db
  ```
  - [ ] Database created successfully
  - [ ] Verify with: `psql -l | grep killjoy_db`

- [ ] **Step 3: Configure Environment**
  ```bash
  cp .env.example .env
  # Edit .env with your credentials
  ```
  - [ ] .env file created
  - [ ] DB_HOST set (localhost)
  - [ ] DB_USER set (postgres)
  - [ ] DB_PASSWORD set
  - [ ] TELEGRAM_BOT_TOKEN set (from @BotFather)

- [ ] **Step 4: Get Telegram Bot Token**
  - [ ] Open Telegram
  - [ ] Message @BotFather
  - [ ] Send `/newbot`
  - [ ] Follow prompts
  - [ ] Copy token
  - [ ] Paste in .env as TELEGRAM_BOT_TOKEN
  - [ ] Copy bot username

- [ ] **Step 5: Create Mini App**
  - [ ] Message @BotFather
  - [ ] Send `/mybots`
  - [ ] Select your bot
  - [ ] Select "Bot Settings"
  - [ ] Select "Menu Button"
  - [ ] Set to "Web App"
  - [ ] Enter URL: `http://localhost:5173`
  - [ ] Save

- [ ] **Step 6: Optional - Notion Setup**
  - [ ] Go to https://www.notion.com/my-integrations
  - [ ] Click "Create new integration"
  - [ ] Name it "Killjoy"
  - [ ] Copy "Internal Integration Token"
  - [ ] Add to .env as NOTION_API_KEY
  - [ ] (Skip if you don't want calendar)

### 🚀 Local Testing

- [ ] **Backend Startup**
  ```bash
  npm run dev
  # Should show: ✅ Server running on http://localhost:3000
  ```
  - [ ] TypeScript compiles without errors
  - [ ] Database connects successfully
  - [ ] Shows "Database schema initialized"
  - [ ] Cron jobs initialized

- [ ] **Frontend Startup**
  ```bash
  cd frontend
  npm run dev
  # Should show: ✅ Local: http://localhost:5173
  ```
  - [ ] Vite dev server starts
  - [ ] No compilation errors
  - [ ] Ready for connections

- [ ] **Health Check**
  ```bash
  curl http://localhost:3000/health
  # Should return JSON with status: "OK"
  ```
  - [ ] Backend responds

- [ ] **Frontend Access**
  - [ ] Open http://localhost:5173
  - [ ] Should show "Initializing Killjoy..."
  - [ ] (Cannot fully auth without Telegram Mini App)

### 📱 Telegram Testing

- [ ] **Open from Telegram**
  - [ ] Open Telegram
  - [ ] Go to your bot
  - [ ] Click "Menu" button
  - [ ] Click "Open Web App"
  - [ ] App loads in Telegram WebView
  - [ ] Authentication succeeds
  - [ ] Dashboard displays

- [ ] **Test Basic Features**
  - [ ] Add a non-negotiable
  - [ ] Mark it complete
  - [ ] Log work hours
  - [ ] Log a workout
  - [ ] Check streaks update
  - [ ] View calendar (if configured)

- [ ] **Test Navigation**
  - [ ] Switch between all 5 tabs
  - [ ] Forms submit correctly
  - [ ] Data persists on refresh
  - [ ] No console errors

### 🔍 Verification Steps

- [ ] **Database Populated**
  ```bash
  psql killjoy_db
  SELECT COUNT(*) FROM users;
  # Should return at least 1
  ```

- [ ] **API Endpoints Work**
  - [ ] GET /api/non-negotiables
  - [ ] GET /api/work-hours/today
  - [ ] GET /api/workouts/today
  - [ ] GET /api/streaks/dashboard
  - [ ] GET /api/calendar/today

- [ ] **State Management**
  - [ ] Open browser DevTools
  - [ ] Check Zustand store in localStorage
  - [ ] Verify user data stored
  - [ ] Check for auth token

- [ ] **Styles Loaded**
  - [ ] Dark theme displays correctly
  - [ ] Colors match design
  - [ ] Mobile responsive works
  - [ ] No layout shifts

### ⚠️ Common Issues & Fixes

- [ ] **"Cannot find module" error**
  - [ ] Run `npm install` again
  - [ ] Delete node_modules and reinstall
  - [ ] Check package.json

- [ ] **Database connection failed**
  - [ ] Verify PostgreSQL running: `pg_isready`
  - [ ] Check credentials in .env
  - [ ] Try: `psql -U postgres` to test
  - [ ] Recreate database if needed

- [ ] **Telegram Mini App not loading**
  - [ ] Verify bot token correct
  - [ ] Check Mini App URL set in @BotFather
  - [ ] Restart Telegram app
  - [ ] Try incognito mode

- [ ] **Port already in use**
  - [ ] Change PORT in .env
  - [ ] Or kill existing process: `lsof -ti:3000 | xargs kill -9`

- [ ] **Frontend blank page**
  - [ ] Check browser console for errors
  - [ ] Verify backend URL correct
  - [ ] Clear browser cache
  - [ ] Hard refresh: Ctrl+Shift+R

### 📦 Production Deployment Checklist

Once local testing passes:

- [ ] **Code Quality**
  - [ ] No console errors
  - [ ] No TypeScript warnings
  - [ ] Linting passes (if configured)

- [ ] **Build Test**
  ```bash
  npm run build
  # Should create dist/ folder
  ```
  - [ ] dist/ folder created
  - [ ] All files compiled

- [ ] **Environment Configuration**
  - [ ] Create production .env
  - [ ] Set NODE_ENV=production
  - [ ] Use production database
  - [ ] Enable HTTPS URLs

- [ ] **Deploy Backend**
  - [ ] Choose hosting (Railway/Render/VPS)
  - [ ] Follow DEPLOY.md guide
  - [ ] Test production endpoints
  - [ ] Verify database backups

- [ ] **Deploy Frontend**
  - [ ] Build frontend: `cd frontend && npm run build`
  - [ ] Deploy dist/ folder
  - [ ] Update API base URL
  - [ ] Test all features

- [ ] **Update Telegram Bot**
  - [ ] Update Mini App URL in @BotFather
  - [ ] Ensure HTTPS
  - [ ] Test from Telegram

- [ ] **Post-Deployment**
  - [ ] Monitor logs for errors
  - [ ] Test all API endpoints
  - [ ] Verify database writes
  - [ ] Check cron jobs running

## Feature Completion Checklist

### Core Features
- [x] Non-Negotiables Tracker
  - [x] Create/read/update/delete
  - [x] Daily tracking
  - [x] Completion percentage
  - [x] Auto-reset on duration

- [x] Work Hours Tracking
  - [x] Manual input
  - [x] Daily/weekly/monthly views
  - [x] Statistics
  - [x] Streak tracking

- [x] Workout Tracking
  - [x] Manual logging
  - [x] Sync from bot
  - [x] Type/duration/intensity
  - [x] Statistics

- [x] Streaks Dashboard
  - [x] Current streak
  - [x] Best streak
  - [x] Heatmap calendar
  - [x] Completion percentage

- [x] Notion Calendar
  - [x] Read-only integration
  - [x] Event display
  - [x] Auto-sync
  - [x] Caching

### Technical Features
- [x] Authentication
  - [x] Telegram validation
  - [x] User creation
  - [x] Session management

- [x] Database
  - [x] Schema design
  - [x] Indexing
  - [x] Migrations

- [x] API
  - [x] All endpoints
  - [x] Error handling
  - [x] CORS

- [x] Frontend
  - [x] React components
  - [x] State management
  - [x] Styling
  - [x] Responsive design

- [x] Automation
  - [x] Cron jobs
  - [x] Email (if needed)
  - [x] Notifications (if needed)

## Sign-Off Checklist

- [ ] **All Tests Pass**
  - [ ] Backend health check ✓
  - [ ] Database connection ✓
  - [ ] Authentication works ✓
  - [ ] All CRUD operations ✓
  - [ ] Frontend renders ✓
  - [ ] All navigation works ✓

- [ ] **Documentation Complete**
  - [ ] README.md reviewed
  - [ ] SETUP.md tested
  - [ ] DEPLOY.md verified
  - [ ] Code comments added

- [ ] **Ready for Production**
  - [ ] Environment variables secure
  - [ ] Secrets not in code
  - [ ] HTTPS configured
  - [ ] Backups planned

## Success Criteria

When all boxes are checked:

✅ Backend running on port 3000
✅ Frontend running on port 5173
✅ Database connected and initialized
✅ Telegram Mini App opens correctly
✅ All features working
✅ No console errors
✅ Responsive design working
✅ Ready to deploy

---

**Estimated Time to Complete**: 30-60 minutes

**Need Help?** See:
- SETUP.md for installation help
- README.md for full documentation
- TROUBLESHOOTING section above
