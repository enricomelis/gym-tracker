-- Migration: 20250706122201_fix_daily_planning_functions.sql
-- Scopo: garantire che le funzioni di pianificazione giornaliera possano inserire/modificare dati anche con RLS attivo

-- 1️⃣ create_empty_training_session -------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_empty_training_session(uuid, date, integer);
CREATE OR REPLACE FUNCTION public.create_empty_training_session(
  p_athlete_id      UUID,
  p_date            DATE,
  p_session_number  INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER         -- bypassa RLS in modo controllato
SET search_path = ''
AS $$
DECLARE
  v_session_id UUID;
  v_week       INTEGER := EXTRACT(WEEK FROM p_date);
  v_year       INTEGER := EXTRACT(YEAR  FROM p_date);
BEGIN
  -- Crea la sessione di allenamento
  INSERT INTO public.training_sessions (date, session_number, week_number, year)
  VALUES (p_date, p_session_number, v_week, v_year)
  RETURNING id INTO v_session_id;

  -- Collega l'atleta alla sessione
  INSERT INTO public.athlete_training_sessions (athlete_id, training_session_id)
  VALUES (p_athlete_id, v_session_id);

  RETURN v_session_id;
END;
$$;
-- 2️⃣ save_daily_routines ----------------------------------------------------------------
DROP FUNCTION IF EXISTS public.save_daily_routines(uuid, uuid, jsonb);
CREATE OR REPLACE FUNCTION public.save_daily_routines(
  p_session_id  UUID,
  p_athlete_id  UUID,
  p_routines    JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Cancella le routine precedenti
  DELETE FROM public.daily_routines WHERE session_id = p_session_id;

  -- Inserisce quelle nuove
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
    (r->>'apparatus')::public.apparatus_enum,
    (r->>'type')::public.daily_routine_type_enum,
    (r->>'quantity')::INT,
    (r->>'target_sets')::INT,
    (r->>'target_execution')::public.execution_coefficient_enum
  FROM jsonb_array_elements(p_routines) AS r;
END;
$$;
-- 3️⃣ delete_training_session -------------------------------------------------------------
DROP FUNCTION IF EXISTS public.delete_training_session(uuid);
CREATE OR REPLACE FUNCTION public.delete_training_session(p_session_id UUID) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.daily_routines            WHERE session_id = p_session_id;
  DELETE FROM public.athlete_training_sessions WHERE training_session_id = p_session_id;
  DELETE FROM public.training_sessions         WHERE id = p_session_id;
END;
$$;
-- 4️⃣ Permessi di esecuzione --------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.create_empty_training_session(UUID, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_daily_routines(UUID, UUID, JSONB)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_training_session(UUID)                 TO authenticated;