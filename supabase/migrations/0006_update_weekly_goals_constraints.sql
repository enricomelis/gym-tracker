-- Step 1: Drop the old, too-restrictive constraint
ALTER TABLE public.apparatus_weekly_goals
DROP CONSTRAINT apparatus_weekly_goals_exercise_volume_check;

-- Step 2: Add a new, more flexible constraint that ensures at least one volume is set
ALTER TABLE public.apparatus_weekly_goals
ADD CONSTRAINT weekly_goals_volume_check
CHECK (
  exercise_volume >= 0 AND
  dismount_volume >= 0 AND
  COALESCE(base_volume, 0) >= 0 AND
  (exercise_volume + dismount_volume + COALESCE(base_volume, 0)) > 0
); 