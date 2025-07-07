-- Migration: 20250707144901_revert_to_0011.sql
-- Purpose: Remove the effects of all migrations applied after 0011_add_is_active_to_athletes.sql.
--
-- This migration performs the following steps:
--   1. Disables Row-Level Security on every table that was switched to RLS in later migrations.
--   2. Drops the policies and RPC helper functions that were introduced afterwards.
--   3. Restores the original transactional helper functions as they existed in 0010_transaction_functions.sql.
--
-- NOTE  ⚠️  This script assumes that no _additional_ DDL (columns, constraints, etc.) was added
--         in the removed migrations.  If later migrations created new tables/columns you still
--         rely on, **do not run this file** or adapt it accordingly.

-- ============================================================
-- 1️⃣  Disable Row-Level Security (RLS) on affected tables
-- ============================================================
ALTER TABLE public.societies                 DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches                   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.apparatus_sessions        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sets             DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_training_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.apparatus_weekly_goals    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routines            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes_competitions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_goal_presets       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routine_presets     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches_athletes          DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2️⃣  Drop RPC / helper functions introduced after 0011
-- ============================================================
-- Profile / ID helpers
DROP FUNCTION IF EXISTS public.get_user_profile_rpc(uuid);
DROP FUNCTION IF EXISTS public.get_coach_id_rpc(uuid);
DROP FUNCTION IF EXISTS public.get_athlete_id_rpc(uuid);

-- Athletes helpers
DROP FUNCTION IF EXISTS public.get_coach_athletes_rpc(uuid, boolean);
DROP FUNCTION IF EXISTS public.get_athlete_profile_rpc(uuid);
DROP FUNCTION IF EXISTS public.deactivate_athlete_rpc(uuid);
DROP FUNCTION IF EXISTS public.reactivate_athlete_rpc(uuid);
DROP FUNCTION IF EXISTS public.change_athlete_coach_rpc(uuid, uuid);

-- Weekly-goal helpers
DROP FUNCTION IF EXISTS public.get_weekly_goals_rpc();
DROP FUNCTION IF EXISTS public.get_weekly_goals_rpc(uuid);
DROP FUNCTION IF EXISTS public.get_weekly_goals_rpc(uuid, integer);
DROP FUNCTION IF EXISTS public.get_weekly_goals_rpc(uuid, integer, integer);
DROP FUNCTION IF EXISTS public.create_weekly_goal_rpc(uuid, integer, integer, text, integer, integer);

-- Training-session helpers
DROP FUNCTION IF EXISTS public.get_training_sessions_rpc(uuid, date, date);
DROP FUNCTION IF EXISTS public.create_training_session_rpc(uuid, date, integer, text);

-- ============================================================
-- 3️⃣  Restore original transactional helper functions (from 0010)
-- ============================================================
-- 3.1 create_empty_training_session -----------------------------------------
DROP FUNCTION IF EXISTS public.create_empty_training_session(uuid, date, integer);

CREATE OR REPLACE FUNCTION public.create_empty_training_session(
  p_athlete_id      uuid,
  p_date            date,
  p_session_number  int
) RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_session_id uuid;
  v_week       int;
  v_year       int := EXTRACT(YEAR FROM p_date);
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

-- 3.2 save_daily_routines ----------------------------------------------------
DROP FUNCTION IF EXISTS public.save_daily_routines(uuid, uuid, jsonb);

CREATE OR REPLACE FUNCTION public.save_daily_routines(
  p_session_id  uuid,
  p_athlete_id  uuid,
  p_routines    jsonb
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

-- 3.3 delete_training_session -----------------------------------------------
DROP FUNCTION IF EXISTS public.delete_training_session(uuid);

CREATE OR REPLACE FUNCTION public.delete_training_session(p_session_id uuid) RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.daily_routines            WHERE session_id = p_session_id;
  DELETE FROM public.athlete_training_sessions WHERE training_session_id = p_session_id;
  DELETE FROM public.training_sessions         WHERE id = p_session_id;
END;
$$; 