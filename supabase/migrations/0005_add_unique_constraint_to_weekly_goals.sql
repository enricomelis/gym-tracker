ALTER TABLE public.apparatus_weekly_goals
ADD CONSTRAINT apparatus_weekly_goals_unique_entry UNIQUE (athlete_id, week_number, year, apparatus); 