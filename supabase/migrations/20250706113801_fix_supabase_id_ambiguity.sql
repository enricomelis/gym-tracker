-- Fix supabase_id ambiguity in RPC functions

-- Drop and recreate functions with correct column references

DROP FUNCTION IF EXISTS get_coach_athletes_rpc(UUID, BOOLEAN)
DROP FUNCTION IF EXISTS deactivate_athlete_rpc(UUID)
DROP FUNCTION IF EXISTS reactivate_athlete_rpc(UUID)
DROP FUNCTION IF EXISTS change_athlete_coach_rpc(UUID, UUID)
DROP FUNCTION IF EXISTS get_weekly_goals_rpc(UUID, INTEGER)
DROP FUNCTION IF EXISTS get_weekly_goals_rpc(UUID, INTEGER, INTEGER)
DROP FUNCTION IF EXISTS create_weekly_goal_rpc(UUID, INTEGER, INTEGER, TEXT, INTEGER, INTEGER)
DROP FUNCTION IF EXISTS get_training_sessions_rpc(UUID, DATE, DATE)
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
    SELECT coaches.id INTO authorized_coach_id FROM coaches WHERE coaches.supabase_id = current_user_id;
    
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
    SELECT id INTO coach_id FROM coaches WHERE coaches.supabase_id = current_user_id;
    
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
    SELECT id INTO coach_id FROM coaches WHERE coaches.supabase_id = current_user_id;
    
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
    SELECT id INTO current_coach_id FROM coaches WHERE coaches.supabase_id = current_user_id;
    
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