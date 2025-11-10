# Killjoy Architecture

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    Telegram Mini App (Browser)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   React Frontend                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  Dashboard   │  │  Components  │  │   Styles     │  │   │
│  │  │   (5 tabs)   │  │  (6 modules) │  │  (CSS vars)  │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │         ↑                  ↑                  ↑          │   │
│  │  ┌────────────────────────────────────────────────┐    │   │
│  │  │         Zustand State Management               │    │   │
│  │  │  (auth, tasks, hours, workouts, streaks)     │    │   │
│  │  └────────────────────────────────────────────────┘    │   │
│  │         ↑                                       ↑       │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │    API Client (Axios)                            │  │   │
│  │  │    + Telegram Auth Headers                       │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │         ↓                                       ↓       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ↓ HTTPS                               │
└─────────────────────────────────────────────────────────────────┘
                           ↓
          ┌────────────────────────────────┐
          │   Telegram Server (Auth)       │
          │   Validates initData signature │
          └────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│              Node.js Backend (Express + TypeScript)             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Express Server                          │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐ │  │
│  │  │   Routes   │  │ Middleware  │  │  Error Handling  │ │  │
│  │  │  (5 sets)  │  │  (Auth)     │  │  (Global)        │ │  │
│  │  └────────────┘  └─────────────┘  └──────────────────┘ │  │
│  │         ↓              ↓                      ↓          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Service Layer (Business Logic)             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │  │
│  │  │ Users        │  │ Non-Negot.   │  │ WorkHours   │   │  │
│  │  │ Service      │  │ Service      │  │ Service     │   │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │  │
│  │  │ Workouts     │  │ Streaks      │  │ Notion      │   │  │
│  │  │ Service      │  │ Service      │  │ Service     │   │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘   │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │          Cron Jobs (node-cron)                   │  │  │
│  │  │  - Reset expired tasks (midnight)                │  │  │
│  │  │  - Sync streaks (every 6h)                       │  │  │
│  │  │  - Sync calendar (every 4h)                      │  │  │
│  │  │  - Clean cache (weekly)                          │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                           ↓                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Data Access Layer (pg)                      │  │
│  │  - Query builders                                        │  │
│  │  - Connection pooling                                    │  │
│  │  - Transaction management                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
└─────────────────────────────────────────────────────────────────┘
                           ↓
          ┌────────────────────────────────┐
          │    PostgreSQL Database         │
          │  - 9 tables                    │
          │  - 10+ indexes                 │
          │  - Cascade deletes             │
          └────────────────────────────────┘
            ↑              ↑              ↑
            │              │              │
     ┌──────┴──────┐  ┌───┴────┐  ┌────┴──────┐
     │ External    │  │ Notion │  │ Telegram  │
     │ Workout Bot │  │ API    │  │ API       │
     │ (Read)      │  │ (Read) │  │ (Auth)    │
     └─────────────┘  └────────┘  └───────────┘
```

## Data Flow

### 1. User Authentication Flow

```
User opens Telegram → Telegram sends → Frontend receives
  Mini App               initData         initData
       ↓                   ↓                  ↓
    Telegram        Creates signature     Stores in
  generates         using bot token     window.Telegram
  unique data
       ↓                   ↓                  ↓
    Includes:          Frontend sends    Backend validates
  - user_id           POST /auth/test     signature
  - username          with initData
  - auth_date         ↓
  - hash              Axios adds
                      header:
                      X-Telegram-Init-Data
                      ↓
                      Backend verifies
                      HMAC-SHA256 hash
                      ↓
                      Returns userId
                      ↓
                      Frontend stores
                      in Zustand
                      ↓
                      All future API calls
                      include header
```

### 2. Non-Negotiables Creation Flow

```
User fills form → Frontend validation → API call
   (title,            (required fields)   POST
  duration)                               /api/non-negotiables
     ↓                   ↓                    ↓
  Zustand          Local state         Axios with
  updates          updates            Telegram header
  pending
                                           ↓
                                    Backend receives
                                    + validates
                                    + authenticates
                                         ↓
                                    Create in DB
                                    - users.id
                                    - title
                                    - end_date
                                         ↓
                                    Return response
                                         ↓
                                    Frontend updates
                                    Zustand store
                                         ↓
                                    Component re-renders
                                    with new item
```

### 3. Workout Sync from Bot

```
User taps sync → Frontend API call → Backend receives
 (daily)         GET /api/workouts/  request
                 sync-bot
     ↓               ↓                   ↓
  Loading        Axios sends        Backend calls
  spinner        bot token          Telegram API
                                    with bot token
                                         ↓
                                    Fetches user's
                                    workout from
                                    your bot
                                         ↓
                                    Stores in DB
                                    - user_id
                                    - type
                                    - duration
                                    - intensity
                                         ↓
                                    Returns data
                                         ↓
                                    Frontend updates
                                    Zustand
                                         ↓
                                    Displays in UI
                                    ✓ Success message
```

### 4. Streak Calculation

```
Daily cron (6h) → Query all users → For each user:
                                       ↓
                              Get non-negotiables
                              Count consecutive
                              completed days
                                       ↓
                              Get workouts
                              Count consecutive
                              days with workouts
                                       ↓
                              Get work hours
                              Count consecutive
                              days logged
                                       ↓
                              Update streaks table
                              - current_streak
                              - best_streak
                              - last_completed_date
                                       ↓
                              Update streak_calendar
                              for heatmap
                                       ↓
                              Dashboard fetches
                              /api/streaks/dashboard
                                       ↓
                              Displays to user
```

## Service Architecture

### Non-Negotiables Service
```
createNonNegotiable(userId, title, desc, duration)
  ↓
  Calculate end_date = now + duration
  ↓
  INSERT into DB
  ↓
  RETURN with id

getUserNonNegotiables(userId)
  ↓
  SELECT * WHERE user_id = userId AND is_active
  ↓
  RETURN array

getTodayNonNegotiables(userId)
  ↓
  SELECT * with LEFT JOIN on tracking for today
  ↓
  RETURN with completion status

toggleNonNegotiableCompletion(id, userId, date, completed)
  ↓
  INSERT or UPDATE tracking record
  ↓
  Trigger streak recalculation
  ↓
  RETURN updated record

resetExpiredNonNegotiables()
  ↓
  UPDATE is_active = false WHERE end_date <= now
  ↓
  Called by cron job daily
  ↓
  RETURN count of reset items
```

### Streaks Service
```
calculateAndUpdateStreaks(userId)
  ↓
  For each metric_type (non_negotiables, workouts, work_hours):
    ↓
    calculateStreakForMetric(userId, type)
    ↓
    Get all dates with completions
    ↓
    Calculate consecutive days from most recent
    ↓
    Find best streak ever
    ↓
    UPSERT into streaks table
    ↓
  RETURN array of updated streaks

calculateConsecutiveDays(userId, table, column)
  ↓
  Complex SQL with window functions
  ↓
  ROW_NUMBER() OVER ORDER BY date
  ↓
  Gap analysis
  ↓
  Count consecutive before first gap
  ↓
  RETURN current and best

updateStreakCalendar(userId, date, type, completed)
  ↓
  UPSERT into streak_calendar
  ↓
  Used for heatmap visualization
```

## Database Transactions

### User Registration (First Request)
```sql
BEGIN TRANSACTION
  SELECT * FROM users WHERE telegram_id = ?
  IF NOT EXISTS:
    INSERT INTO users (telegram_id, username, ...)

  SELECT * (returns user)
COMMIT
```

### Non-Negotiable Toggle
```sql
BEGIN TRANSACTION
  INSERT/UPDATE non_negotiables_tracking
    (non_negotiable_id, user_id, date, completed)

  UPDATE streaks calculation
    (async, not blocking response)

  UPDATE streak_calendar
    (for heatmap)
COMMIT
```

### Cron Job: Sync All User Streaks
```
FOR EACH user:
  BEGIN TRANSACTION
    CALCULATE streaks
    UPDATE streaks table
    UPDATE streak_calendar
  COMMIT
```

## API Response Format

### Success Response
```json
{
  "id": 123,
  "user_id": 1,
  "title": "Meditation",
  "duration_days": 90,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "error": "Invalid request",
  "message": "Required field missing"
}
```

### List Response
```json
[
  { /* item 1 */ },
  { /* item 2 */ },
  { /* item 3 */ }
]
```

### Dashboard Response
```json
{
  "streaks": [
    {
      "metric_type": "non_negotiables",
      "current_streak": 15,
      "best_streak": 45,
      "last_completed_date": "2024-01-15"
    }
  ],
  "summary": {
    "total_streaks": 3,
    "average_streak_length": 12,
    "completion_percentage": 78
  }
}
```

## State Management (Zustand)

```javascript
useAppStore
  ├── Auth State
  │   ├── userId: number | null
  │   ├── telegramId: number | null
  │   ├── isAuthenticated: boolean
  │   └── setAuthenticated(userId, telegramId)
  │
  ├── Non-Negotiables
  │   ├── nonNegotiables: Array
  │   ├── setNonNegotiables(items)
  │   ├── addNonNegotiable(item)
  │   ├── removeNonNegotiable(id)
  │   └── toggleNonNegotiable(id)
  │
  ├── Work Hours
  │   ├── workHours: Array
  │   ├── setWorkHours(hours)
  │   └── addWorkHours(hours)
  │
  ├── Workouts
  │   ├── workouts: Array
  │   ├── setWorkouts(items)
  │   └── addWorkout(item)
  │
  ├── Streaks
  │   ├── streaks: Array
  │   └── setStreaks(items)
  │
  └── UI State
      ├── isLoading: boolean
      └── setIsLoading(loading)
```

## Component Hierarchy

```
App
  ├── useTelegram() [Hook]
  │   └── Validates Telegram auth
  │
  ├── Dashboard
  │   ├── Dashboard Nav
  │   │   ├── Overview Tab
  │   │   │   ├── StreaksSection
  │   │   │   │   └── Streak cards grid
  │   │   │   └── Quick Stats
  │   │   ├── Tasks Tab
  │   │   │   └── NonNegotiablesSection
  │   │   │       ├── Task list
  │   │   │       └── Add form
  │   │   ├── Work Tab
  │   │   │   └── WorkHoursSection
  │   │   │       ├── Stats grid
  │   │   │       ├── Log form
  │   │   │       └── History
  │   │   ├── Workout Tab
  │   │   │   └── WorkoutsSection
  │   │   │       ├── Stats grid
  │   │   │       ├── Log form
  │   │   │       └── Weekly list
  │   │   └── Calendar Tab
  │   │       └── CalendarSection
  │   │           ├── Today's events
  │   │           └── Upcoming events
  │   │
  │   └── Bottom Nav (5 buttons)
```

## Cron Job Timeline

```
00:00 (Midnight)    → resetExpiredNonNegotiables()
04:00               → syncNotionCalendar()
06:00               → syncStreaks()
08:00               → syncNotionCalendar()
10:00               → syncStreaks()
12:00 (Noon)        → syncNotionCalendar()
14:00               → syncStreaks()
16:00               → syncNotionCalendar()
18:00               → syncStreaks()
20:00               → syncNotionCalendar()
22:00               → syncStreaks()
00:00 (Sunday)      → cleanupOldCache()
```

## Security Layers

```
1. Telegram Signature Validation
   - HMAC-SHA256 verification
   - Timestamp check (optional)
   - User ID validation

2. CORS Protection
   - Origin whitelist
   - Credentials enabled
   - Preflight handling

3. SQL Injection Prevention
   - Parameterized queries
   - pg library escaping

4. XSS Protection
   - React sanitization
   - No dangerouslySetInnerHTML

5. Authentication Middleware
   - Header validation
   - User context injection
   - Per-route protection
```

## Error Handling

```
API Request
  ↓
Error Occurs?
  ├─ No → Success response (200/201)
  │
  └─ Yes → Error classification
      ├─ Auth error (401)
      │  └─ Retry auth flow
      │
      ├─ Validation error (400)
      │  └─ Show form error
      │
      ├─ Not found (404)
      │  └─ Show not found message
      │
      ├─ Server error (500)
      │  └─ Try fallback/cache
      │
      └─ Network error
         └─ Show offline message
```

---

This architecture ensures:
- **Scalability**: Stateless backend, independent components
- **Maintainability**: Clear separation of concerns
- **Reliability**: Transaction safety, cron automation
- **Security**: Multi-layer protection
- **Performance**: Indexed queries, caching, pooling
