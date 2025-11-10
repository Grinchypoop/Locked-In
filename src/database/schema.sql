-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Non-Negotiables table
CREATE TABLE IF NOT EXISTS non_negotiables (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 90,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Non-Negotiables Daily Tracking
CREATE TABLE IF NOT EXISTS non_negotiables_tracking (
  id SERIAL PRIMARY KEY,
  non_negotiable_id INTEGER NOT NULL REFERENCES non_negotiables(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(non_negotiable_id, date)
);

-- Work Hours Tracking
CREATE TABLE IF NOT EXISTS work_hours (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours DECIMAL(5, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Workout Data (synced from external bot)
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  workout_type VARCHAR(255),
  duration_minutes INTEGER,
  intensity VARCHAR(50),
  notes TEXT,
  external_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date, external_id)
);

-- Streaks table (cached for performance)
CREATE TABLE IF NOT EXISTS streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'non_negotiables', 'workouts', 'work_hours'
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, metric_type)
);

-- Notion Calendar Cache
CREATE TABLE IF NOT EXISTS notion_calendar_cache (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  event_date DATE,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Streak Calendar (for heatmap visualization)
CREATE TABLE IF NOT EXISTS streak_calendar (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date, metric_type)
);

-- Indexes for performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_non_negotiables_user_id ON non_negotiables(user_id);
CREATE INDEX idx_non_negotiables_tracking_date ON non_negotiables_tracking(date);
CREATE INDEX idx_work_hours_user_date ON work_hours(user_id, date);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX idx_streaks_user_metric ON streaks(user_id, metric_type);
CREATE INDEX idx_streak_calendar_date ON streak_calendar(user_id, date);
