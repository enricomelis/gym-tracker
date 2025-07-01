-- Add useful indexes to improve query performance on filtered columns
-- Migration: 0009_add_indexes

-- athlete_training_sessions
CREATE INDEX IF NOT EXISTS idx_athlete_training_sessions_athlete_training
  ON public.athlete_training_sessions (athlete_id, training_session_id);

CREATE INDEX IF NOT EXISTS idx_athlete_training_sessions_training_session
  ON public.athlete_training_sessions (training_session_id);

-- daily_routines
CREATE INDEX IF NOT EXISTS idx_daily_routines_session_id
  ON public.daily_routines (session_id);

-- apparatus_sessions
CREATE INDEX IF NOT EXISTS idx_apparatus_sessions_training_session_id
  ON public.apparatus_sessions (training_session_id);

-- apparatus_weekly_goals
CREATE INDEX IF NOT EXISTS idx_apparatus_weekly_goals_athlete_week_year
  ON public.apparatus_weekly_goals (athlete_id, week_number, year); 