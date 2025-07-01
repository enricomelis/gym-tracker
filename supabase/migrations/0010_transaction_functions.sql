-- Migration: 0010_transaction_functions
-- Atomic helpers for daily planning

-- 1. Create empty training session and join in one transaction
CREATE OR REPLACE FUNCTION public.create_empty_training_session(
  p_athlete_id uuid,
  p_date date,
  p_session_number int
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_id uuid;
  v_week int;
  v_year int := EXTRACT(YEAR FROM p_date);
BEGIN
  v_week := EXTRACT(WEEK FROM p_date);

  INSERT INTO public.training_sessions (date, session_number, week_number, year)
  VALUES (p_date, p_session_number, v_week, v_year)
  RETURNING id INTO v_session_id;

  INSERT INTO public.athlete_training_sessions (athlete_id, training_session_id)
  VALUES (p_athlete_id, v_session_id);

  RETURN v_session_id;
END;
$$;

-- 2. Save daily routine: delete old and insert new in one transaction
CREATE OR REPLACE FUNCTION public.save_daily_routines(
  p_session_id uuid,
  p_athlete_id uuid,
  p_routines jsonb
) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.daily_routines WHERE session_id = p_session_id;

  INSERT INTO public.daily_routines (
    athlete_id,
    session_id,
    apparatus,
    type,
    quantity,
    target_sets,
    target_execution
  )
  SELECT
    p_athlete_id,
    p_session_id,
    (r->>'apparatus')::apparatus_enum,
    (r->>'type')::daily_routine_type_enum,
    (r->>'quantity')::int,
    (r->>'target_sets')::int,
    (r->>'target_execution')::execution_coefficient_enum
  FROM jsonb_array_elements(p_routines) AS r;
END;
$$;

-- 3. Delete training session with cascades in one transaction
CREATE OR REPLACE FUNCTION public.delete_training_session(p_session_id uuid) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.daily_routines WHERE session_id = p_session_id;
  DELETE FROM public.athlete_training_sessions WHERE training_session_id = p_session_id;
  DELETE FROM public.training_sessions WHERE id = p_session_id;
END;
$$; 