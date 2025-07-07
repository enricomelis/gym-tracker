-- Comprehensive RLS Conflicts Fix
-- This migration addresses all identified RLS conflicts in the gym-tracker app

-- ===========================================
-- FASE 1: Fix societies access for athlete creation
-- ===========================================

-- Drop the restrictive policy that prevents coaches from seeing all societies
DROP POLICY IF EXISTS "Coaches can view their own society" ON public.societies
-- Create a more permissive policy for authenticated users
-- This allows coaches to see all societies when creating/managing athletes
CREATE POLICY "Authenticated users can view all societies" 
ON public.societies 
FOR SELECT 
TO authenticated 
USING (true)
-- Add comment explaining the rationale
COMMENT ON POLICY "Authenticated users can view all societies" ON public.societies IS 
'Allows coaches to view all societies when creating/assigning athletes. This is necessary for the athlete creation form dropdown.'
-- ===========================================
-- FASE 2: Create RPC functions for athlete operations
-- ===========================================

-- Drop existing functions to avoid signature conflicts
DROP FUNCTION IF EXISTS get_coach_athletes_rpc(UUID, BOOLEAN)
DROP FUNCTION IF EXISTS get_coach_athletes_rpc(UUID)
DROP FUNCTION IF EXISTS deactivate_athlete_rpc(UUID)
DROP FUNCTION IF EXISTS reactivate_athlete_rpc(UUID)
DROP FUNCTION IF EXISTS change_athlete_coach_rpc(UUID, UUID)
DROP FUNCTION IF EXISTS get_weekly_goals_rpc()
DROP FUNCTION IF EXISTS get_weekly_goals_rpc(UUID, INTEGER, INTEGER)
DROP FUNCTION IF EXISTS get_weekly_goals_rpc(UUID, INTEGER)
DROP FUNCTION IF EXISTS create_weekly_goal_rpc(UUID, INTEGER, INTEGER, TEXT, INTEGER, INTEGER)
DROP FUNCTION IF EXISTS get_training_sessions_rpc(UUID, DATE, DATE)
DROP FUNCTION IF EXISTS get_training_sessions_rpc(DATE)
DROP FUNCTION IF EXISTS create_training_session_rpc(UUID, DATE, INTEGER, TEXT)
-- RPC to get coach's athletes (both active and inactive)
CREATE OR REPLACE FUNCTION get_coach_athletes_rpc(p_coach_id UUID, p_active_only BOOLEAN)
RETURNS TABLE(
    id UUID,
    first_name TEXT,
    last_name TEXT,
    date_of_birth DATE,
    registration_number INTEGER,
    category TEXT,
    current_coach_id UUID,
    registered_society_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    supabase_id UUID,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    authorized_coach_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT coaches.id INTO authorized_coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Check if current user is authorized to access this coach's athletes
    IF authorized_coach_id != p_coach_id THEN
        RAISE EXCEPTION 'You can only access your own athletes';
    END IF;
    
    -- Return athletes based on active filter
    IF p_active_only THEN
        RETURN QUERY
        SELECT a.id, a.first_name, a.last_name, a.date_of_birth, a.registration_number, 
               a.category, a.current_coach_id, a.registered_society_id, a.created_at, 
               a.updated_at, a.supabase_id, a.is_active
        FROM athletes a
        WHERE a.current_coach_id = p_coach_id AND a.is_active = true
        ORDER BY a.first_name, a.last_name;
    ELSE
        RETURN QUERY
        SELECT a.id, a.first_name, a.last_name, a.date_of_birth, a.registration_number, 
               a.category, a.current_coach_id, a.registered_society_id, a.created_at, 
               a.updated_at, a.supabase_id, a.is_active
        FROM athletes a
        WHERE a.current_coach_id = p_coach_id AND a.is_active = false
        ORDER BY a.first_name, a.last_name;
    END IF;
END;
$$
-- RPC to deactivate an athlete
CREATE OR REPLACE FUNCTION deactivate_athlete_rpc(athlete_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    coach_id UUID;
    athlete_coach_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT id INTO coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Get athlete's coach ID
    SELECT current_coach_id INTO athlete_coach_id FROM athletes WHERE id = athlete_id;
    
    -- Check if current user is the athlete's coach
    IF coach_id != athlete_coach_id THEN
        RAISE EXCEPTION 'You can only deactivate athletes you coach';
    END IF;
    
    -- Deactivate the athlete
    UPDATE athletes 
    SET is_active = false, updated_at = now() 
    WHERE id = athlete_id;
    
    RETURN true;
END;
$$
-- RPC to reactivate an athlete
CREATE OR REPLACE FUNCTION reactivate_athlete_rpc(athlete_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    coach_id UUID;
    athlete_coach_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT id INTO coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Get athlete's coach ID
    SELECT current_coach_id INTO athlete_coach_id FROM athletes WHERE id = athlete_id;
    
    -- Check if current user is the athlete's coach
    IF coach_id != athlete_coach_id THEN
        RAISE EXCEPTION 'You can only reactivate athletes you coach';
    END IF;
    
    -- Reactivate the athlete
    UPDATE athletes 
    SET is_active = true, updated_at = now() 
    WHERE id = athlete_id;
    
    RETURN true;
END;
$$
-- RPC to change athlete's coach
CREATE OR REPLACE FUNCTION change_athlete_coach_rpc(athlete_id UUID, new_coach_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    current_coach_id UUID;
    athlete_coach_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT id INTO current_coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Get athlete's current coach ID
    SELECT current_coach_id INTO athlete_coach_id FROM athletes WHERE id = athlete_id;
    
    -- Check if current user is the athlete's current coach
    IF current_coach_id != athlete_coach_id THEN
        RAISE EXCEPTION 'You can only transfer athletes you currently coach';
    END IF;
    
    -- Verify new coach exists
    IF NOT EXISTS (SELECT 1 FROM coaches WHERE id = new_coach_id) THEN
        RAISE EXCEPTION 'New coach does not exist';
    END IF;
    
    -- Change the athlete's coach
    UPDATE athletes 
    SET current_coach_id = new_coach_id, updated_at = now() 
    WHERE id = athlete_id;
    
    RETURN true;
END;
$$
-- ===========================================
-- FASE 3: Fix weekly goals access
-- ===========================================

-- RPC to get weekly goals for current user's athletes (all goals for a year)
CREATE OR REPLACE FUNCTION get_weekly_goals_rpc(p_athlete_id UUID DEFAULT NULL, p_year INTEGER DEFAULT NULL)
RETURNS TABLE(
    id UUID,
    athlete_id UUID,
    week_number INTEGER,
    year INTEGER,
    apparatus TEXT,
    exercise_volume INTEGER,
    dismount_volume INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    coach_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT coaches.id INTO coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Return goals based on parameters
    IF p_athlete_id IS NOT NULL AND p_year IS NOT NULL THEN
        -- Specific athlete and year
        RETURN QUERY
        SELECT awg.id, awg.athlete_id, awg.week_number, awg.year, awg.apparatus, 
               awg.exercise_volume, awg.dismount_volume, awg.created_at, awg.updated_at
        FROM apparatus_weekly_goals awg
        JOIN athletes a ON awg.athlete_id = a.id
        WHERE a.current_coach_id = coach_id 
          AND awg.athlete_id = p_athlete_id 
          AND awg.year = p_year
        ORDER BY awg.week_number, awg.apparatus;
    ELSIF p_athlete_id IS NOT NULL THEN
        -- Specific athlete, all years
        RETURN QUERY
        SELECT awg.id, awg.athlete_id, awg.week_number, awg.year, awg.apparatus, 
               awg.exercise_volume, awg.dismount_volume, awg.created_at, awg.updated_at
        FROM apparatus_weekly_goals awg
        JOIN athletes a ON awg.athlete_id = a.id
        WHERE a.current_coach_id = coach_id 
          AND awg.athlete_id = p_athlete_id
        ORDER BY awg.year DESC, awg.week_number, awg.apparatus;
    ELSIF p_year IS NOT NULL THEN
        -- All athletes, specific year
        RETURN QUERY
        SELECT awg.id, awg.athlete_id, awg.week_number, awg.year, awg.apparatus, 
               awg.exercise_volume, awg.dismount_volume, awg.created_at, awg.updated_at
        FROM apparatus_weekly_goals awg
        JOIN athletes a ON awg.athlete_id = a.id
        WHERE a.current_coach_id = coach_id 
          AND awg.year = p_year
        ORDER BY awg.week_number, a.first_name, a.last_name, awg.apparatus;
    ELSE
        -- All goals for current coach
        RETURN QUERY
        SELECT awg.id, awg.athlete_id, awg.week_number, awg.year, awg.apparatus, 
               awg.exercise_volume, awg.dismount_volume, awg.created_at, awg.updated_at
        FROM apparatus_weekly_goals awg
        JOIN athletes a ON awg.athlete_id = a.id
        WHERE a.current_coach_id = coach_id
        ORDER BY awg.year DESC, awg.week_number, a.first_name, a.last_name, awg.apparatus;
    END IF;
END;
$$
-- RPC to get weekly goals for specific athlete, week, and year
CREATE OR REPLACE FUNCTION get_weekly_goals_rpc(p_athlete_id UUID, p_week_number INTEGER, p_year INTEGER)
RETURNS TABLE(
    id UUID,
    athlete_id UUID,
    week_number INTEGER,
    year INTEGER,
    apparatus TEXT,
    exercise_volume INTEGER,
    dismount_volume INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    coach_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT coaches.id INTO coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Check if current user is the athlete's coach
    IF NOT EXISTS (SELECT 1 FROM athletes WHERE id = p_athlete_id AND current_coach_id = coach_id) THEN
        RAISE EXCEPTION 'You can only access goals for athletes you coach';
    END IF;
    
    RETURN QUERY
    SELECT awg.id, awg.athlete_id, awg.week_number, awg.year, awg.apparatus, 
           awg.exercise_volume, awg.dismount_volume, awg.created_at, awg.updated_at
    FROM apparatus_weekly_goals awg
    WHERE awg.athlete_id = p_athlete_id 
      AND awg.week_number = p_week_number 
      AND awg.year = p_year
    ORDER BY awg.apparatus;
END;
$$
-- RPC to create weekly goal
CREATE OR REPLACE FUNCTION create_weekly_goal_rpc(
    p_athlete_id UUID,
    p_week_number INTEGER,
    p_year INTEGER,
    p_apparatus TEXT,
    p_exercise_volume INTEGER,
    p_dismount_volume INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    coach_id UUID;
    athlete_coach_id UUID;
    new_goal_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT id INTO coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Get athlete's coach ID
    SELECT current_coach_id INTO athlete_coach_id FROM athletes WHERE id = p_athlete_id;
    
    -- Check if current user is the athlete's coach
    IF coach_id != athlete_coach_id THEN
        RAISE EXCEPTION 'You can only create goals for athletes you coach';
    END IF;
    
    -- Create the weekly goal
    INSERT INTO apparatus_weekly_goals (athlete_id, week_number, year, apparatus, exercise_volume, dismount_volume)
    VALUES (p_athlete_id, p_week_number, p_year, p_apparatus, p_exercise_volume, p_dismount_volume)
    RETURNING id INTO new_goal_id;
    
    RETURN new_goal_id;
END;
$$
-- ===========================================
-- FASE 4: Fix training sessions access
-- ===========================================

-- RPC to get training sessions for current user's athletes with date range
CREATE OR REPLACE FUNCTION get_training_sessions_rpc(
    p_athlete_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    date DATE,
    session_number INTEGER,
    daily_routines JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    coach_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT coaches.id INTO coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Return training sessions based on parameters
    IF p_athlete_id IS NOT NULL THEN
        -- Check if current user is the athlete's coach
        IF NOT EXISTS (SELECT 1 FROM athletes WHERE id = p_athlete_id AND current_coach_id = coach_id) THEN
            RAISE EXCEPTION 'You can only access training sessions for athletes you coach';
        END IF;
        
        RETURN QUERY
        SELECT ts.id, ts.date, ts.session_number, 
               COALESCE(
                   jsonb_agg(
                       jsonb_build_object(
                           'id', dr.id,
                           'session_id', dr.session_id,
                           'apparatus', dr.apparatus,
                           'type', dr.type,
                           'quantity', dr.quantity,
                           'target_sets', dr.target_sets,
                           'target_execution', dr.target_execution
                       )
                   ) FILTER (WHERE dr.id IS NOT NULL), 
                   '[]'::jsonb
               ) as daily_routines
        FROM training_sessions ts
        JOIN athlete_training_sessions ats ON ts.id = ats.training_session_id
        LEFT JOIN daily_routines dr ON ts.id = dr.session_id
        WHERE ats.athlete_id = p_athlete_id
          AND (p_start_date IS NULL OR ts.date >= p_start_date)
          AND (p_end_date IS NULL OR ts.date <= p_end_date)
        GROUP BY ts.id, ts.date, ts.session_number
        ORDER BY ts.date DESC, ts.session_number;
    ELSE
        -- Return all training sessions for current coach's athletes
        RETURN QUERY
        SELECT ts.id, ts.date, ts.session_number,
               COALESCE(
                   jsonb_agg(
                       jsonb_build_object(
                           'id', dr.id,
                           'session_id', dr.session_id,
                           'apparatus', dr.apparatus,
                           'type', dr.type,
                           'quantity', dr.quantity,
                           'target_sets', dr.target_sets,
                           'target_execution', dr.target_execution
                       )
                   ) FILTER (WHERE dr.id IS NOT NULL), 
                   '[]'::jsonb
               ) as daily_routines
        FROM training_sessions ts
        JOIN athlete_training_sessions ats ON ts.id = ats.training_session_id
        JOIN athletes a ON ats.athlete_id = a.id
        LEFT JOIN daily_routines dr ON ts.id = dr.session_id
        WHERE a.current_coach_id = coach_id
          AND (p_start_date IS NULL OR ts.date >= p_start_date)
          AND (p_end_date IS NULL OR ts.date <= p_end_date)
        GROUP BY ts.id, ts.date, ts.session_number
        ORDER BY ts.date DESC, ts.session_number;
    END IF;
END;
$$
-- RPC to create training session
CREATE OR REPLACE FUNCTION create_training_session_rpc(
    p_athlete_id UUID,
    p_date DATE,
    p_session_number INTEGER,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id UUID;
    coach_id UUID;
    athlete_coach_id UUID;
    new_session_id UUID;
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Get coach ID for current user
    SELECT id INTO coach_id FROM coaches WHERE supabase_id = current_user_id;
    
    -- Get athlete's coach ID
    SELECT current_coach_id INTO athlete_coach_id FROM athletes WHERE id = p_athlete_id;
    
    -- Check if current user is the athlete's coach
    IF coach_id != athlete_coach_id THEN
        RAISE EXCEPTION 'You can only create training sessions for athletes you coach';
    END IF;
    
    -- Create the training session
    INSERT INTO training_sessions (date, session_number, notes)
    VALUES (p_date, p_session_number, p_notes)
    RETURNING id INTO new_session_id;
    
    -- Link the training session to the athlete
    INSERT INTO athlete_training_sessions (athlete_id, training_session_id)
    VALUES (p_athlete_id, new_session_id);
    
    RETURN new_session_id;
END;
$$
-- ===========================================
-- FASE 5: Optimize existing RLS policies
-- ===========================================

-- Update athletes policies to be more specific
DROP POLICY IF EXISTS "Coaches can view their own athletes" ON public.athletes
DROP POLICY IF EXISTS "Coaches can insert athletes" ON public.athletes
DROP POLICY IF EXISTS "Coaches can update their own athletes" ON public.athletes
-- Create consolidated athletes policy
CREATE POLICY "Coaches can manage their own athletes" 
ON public.athletes 
FOR ALL 
TO authenticated 
USING (current_coach_id IN (SELECT id FROM coaches WHERE supabase_id = auth.uid()))
-- Update apparatus_weekly_goals policies
DROP POLICY IF EXISTS "Coaches can view weekly goals for their athletes" ON public.apparatus_weekly_goals
DROP POLICY IF EXISTS "Coaches can insert weekly goals for their athletes" ON public.apparatus_weekly_goals
DROP POLICY IF EXISTS "Coaches can update weekly goals for their athletes" ON public.apparatus_weekly_goals
-- Create consolidated weekly goals policy
CREATE POLICY "Coaches can manage weekly goals for their athletes" 
ON public.apparatus_weekly_goals 
FOR ALL 
TO authenticated 
USING (athlete_id IN (SELECT id FROM athletes WHERE current_coach_id IN (SELECT id FROM coaches WHERE supabase_id = auth.uid())))
-- Update training_sessions policies
DROP POLICY IF EXISTS "Coaches can view training sessions for their athletes" ON public.training_sessions
DROP POLICY IF EXISTS "Coaches can insert training sessions for their athletes" ON public.training_sessions
DROP POLICY IF EXISTS "Coaches can update training sessions for their athletes" ON public.training_sessions
-- Create consolidated training sessions policy
CREATE POLICY "Coaches can manage training sessions for their athletes" 
ON public.training_sessions 
FOR ALL 
TO authenticated 
USING (id IN (SELECT training_session_id FROM athlete_training_sessions WHERE athlete_id IN (SELECT id FROM athletes WHERE current_coach_id IN (SELECT id FROM coaches WHERE supabase_id = auth.uid()))))
-- ===========================================
-- COMMENTS FOR DOCUMENTATION
-- ===========================================

COMMENT ON FUNCTION get_coach_athletes_rpc(UUID, BOOLEAN) IS 'RPC function to get coach athletes with proper authorization filtering'
COMMENT ON FUNCTION deactivate_athlete_rpc(UUID) IS 'RPC function to safely deactivate an athlete with proper coach authorization'
COMMENT ON FUNCTION reactivate_athlete_rpc(UUID) IS 'RPC function to safely reactivate an athlete with proper coach authorization'
COMMENT ON FUNCTION change_athlete_coach_rpc(UUID, UUID) IS 'RPC function to transfer an athlete to a different coach with proper authorization'
COMMENT ON FUNCTION get_weekly_goals_rpc(UUID, INTEGER) IS 'RPC function to get weekly goals for specific parameters'
COMMENT ON FUNCTION get_weekly_goals_rpc(UUID, INTEGER, INTEGER) IS 'RPC function to get weekly goals for specific athlete, week and year'
COMMENT ON FUNCTION create_weekly_goal_rpc(UUID, INTEGER, INTEGER, TEXT, INTEGER, INTEGER) IS 'RPC function to create weekly goals with proper coach authorization'
COMMENT ON FUNCTION get_training_sessions_rpc(UUID, DATE, DATE) IS 'RPC function to get training sessions for current user athletes with optional date filtering'
COMMENT ON FUNCTION create_training_session_rpc(UUID, DATE, INTEGER, TEXT) IS 'RPC function to create training sessions with proper coach authorization'