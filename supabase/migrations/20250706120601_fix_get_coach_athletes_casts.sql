-- Fix mismatched column types in get_coach_athletes_rpc
-- Cast varchar / enum fields to TEXT so they match declared return TABLE

DROP FUNCTION IF EXISTS get_coach_athletes_rpc(UUID, BOOLEAN);
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
        SELECT a.id,
               a.first_name::text,
               a.last_name::text,
               a.date_of_birth,
               a.registration_number,
               a.category::text,
               a.current_coach_id,
               a.registered_society_id,
               a.created_at,
               a.updated_at,
               a.supabase_id,
               a.is_active
        FROM athletes a
        WHERE a.current_coach_id = p_coach_id AND a.is_active = true
        ORDER BY a.first_name, a.last_name;
    ELSE
        RETURN QUERY
        SELECT a.id,
               a.first_name::text,
               a.last_name::text,
               a.date_of_birth,
               a.registration_number,
               a.category::text,
               a.current_coach_id,
               a.registered_society_id,
               a.created_at,
               a.updated_at,
               a.supabase_id,
               a.is_active
        FROM athletes a
        WHERE a.current_coach_id = p_coach_id AND a.is_active = false
        ORDER BY a.first_name, a.last_name;
    END IF;
END;
$$;
-- Ensure authenticated users can execute it
GRANT EXECUTE ON FUNCTION get_coach_athletes_rpc(UUID, BOOLEAN) TO authenticated;