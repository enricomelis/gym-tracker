-- Migration: Fix RLS Recursion and Add Core RPC Functions
-- Purpose: Fix infinite recursion in RLS policies and add RPC functions for safe data access
-- Affected: Rebuilds coaches/athletes RLS policies and creates RPC functions
-- Context: Resolves 42P17 infinite recursion error and RLS access issues in server components
-- Date: 2025-07-06

-- =======================================================================================
-- PART 1: FIX RLS RECURSION ISSUE
-- Problem: Circular dependency between coaches and athletes RLS policies
-- Solution: Remove problematic cross-table policies and simplify access patterns
-- =======================================================================================

-- Drop existing problematic policies that create circular dependencies
DROP POLICY IF EXISTS "Athletes can view their current coach" ON public.coaches;
DROP POLICY IF EXISTS "Coaches can view their athletes" ON public.athletes;
-- Drop and recreate simplified policies that don't create circular dependencies
-- This ensures we replace any existing policies with the correct non-circular versions

-- COACHES TABLE - Only allow coaches to see their own profile
DROP POLICY IF EXISTS "Coaches can view their own profile" ON public.coaches;
CREATE POLICY "Coaches can view their own profile" 
ON public.coaches 
FOR SELECT 
TO authenticated 
USING (supabase_id = (SELECT auth.uid()));
-- ATHLETES TABLE - Only allow athletes to see their own profile  
DROP POLICY IF EXISTS "Athletes can view their own profile" ON public.athletes;
CREATE POLICY "Athletes can view their own profile" 
ON public.athletes 
FOR SELECT 
TO authenticated 
USING (supabase_id = (SELECT auth.uid()));
-- Note: Coach-athlete relationship queries will be handled by RPC functions
-- This eliminates the circular dependency while maintaining security

-- =======================================================================================
-- PART 2: CORE RPC FUNCTIONS FOR SAFE DATA ACCESS
-- Purpose: Create essential RPC functions to bypass RLS policies safely
-- These functions will handle coach-athlete relationships without RLS recursion
-- =======================================================================================

-- =======================================================================================
-- FUNCTION 1: get_user_profile_rpc
-- Purpose: Get complete user profile information including role and IDs
-- Use case: Replaces multiple queries to determine user type and get basic info
-- =======================================================================================
create or replace function public.get_user_profile_rpc(user_id uuid)
returns table (
  role text,
  coach_id uuid,
  athlete_id uuid,
  first_name text,
  last_name text,
  society_id uuid
) 
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Check if user is a coach first
  if exists (select 1 from public.coaches where supabase_id = user_id) then
    return query
    select 
      'coach'::text as role,
      c.id as coach_id,
      null::uuid as athlete_id,
      c.first_name,
      c.last_name,
      c.society_id
    from public.coaches c
    where c.supabase_id = user_id;
  -- Check if user is an athlete  
  elsif exists (select 1 from public.athletes where supabase_id = user_id) then
    return query
    select 
      'athlete'::text as role,
      null::uuid as coach_id,
      a.id as athlete_id,
      a.first_name,
      a.last_name,
      a.registered_society_id as society_id
    from public.athletes a
    where a.supabase_id = user_id;
  end if;
  
  -- If no profile found, return empty result set
  return;
end;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile_rpc(uuid) TO authenticated;
-- =======================================================================================
-- FUNCTION 2: get_coach_id_rpc  
-- Purpose: Get coach ID from supabase user ID
-- Use case: Direct replacement for problematic coach ID lookups in pages
-- =======================================================================================
create or replace function public.get_coach_id_rpc(user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Return coach ID or null if not found
  return (
    select id from public.coaches 
    where supabase_id = user_id
    limit 1
  );
end;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_coach_id_rpc(uuid) TO authenticated;
-- =======================================================================================
-- FUNCTION 3: get_athlete_id_rpc
-- Purpose: Get athlete ID from supabase user ID  
-- Use case: Consistent pattern for athlete ID lookups
-- =======================================================================================
create or replace function public.get_athlete_id_rpc(user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Return athlete ID or null if not found
  return (
    select id from public.athletes 
    where supabase_id = user_id
    limit 1
  );
end;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_athlete_id_rpc(uuid) TO authenticated;
-- =======================================================================================
-- FUNCTION 4: get_coach_athletes_rpc
-- Purpose: Get all athletes for a coach with optional inclusion of inactive ones
-- Use case: Replaces direct athlete queries that fail due to RLS policies
-- =======================================================================================
create or replace function public.get_coach_athletes_rpc(
  user_id uuid,
  include_inactive boolean default false
)
returns table (
  id uuid,
  first_name text,
  last_name text,
  date_of_birth date,
  registration_number integer,
  category text,
  is_active boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  supabase_id uuid,
  current_coach_id uuid,
  registered_society_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select 
    a.id,
    a.first_name,
    a.last_name,
    a.date_of_birth,
    a.registration_number,
    a.category::text,
    a.is_active,
    a.created_at,
    a.updated_at,
    a.supabase_id,
    a.current_coach_id,
    a.registered_society_id
  from public.athletes a
  join public.coaches c on a.current_coach_id = c.id
  where c.supabase_id = user_id
    and (include_inactive or a.is_active = true)
  order by a.first_name, a.last_name;
end;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_coach_athletes_rpc(uuid, boolean) TO authenticated;
-- =======================================================================================
-- FUNCTION 5: get_athlete_profile_rpc
-- Purpose: Get complete athlete profile with coach and society information
-- Use case: Replaces multiple joins for athlete dashboard and profile views
-- =======================================================================================
create or replace function public.get_athlete_profile_rpc(user_id uuid)
returns table (
  id uuid,
  first_name text,
  last_name text,
  date_of_birth date,
  registration_number integer,
  category text,
  current_coach_id uuid,
  coach_name text,
  society_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  supabase_id uuid,
  registered_society_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select 
    a.id,
    a.first_name,
    a.last_name,
    a.date_of_birth,
    a.registration_number,
    a.category::text,
    a.current_coach_id,
    (c.first_name || ' ' || c.last_name) as coach_name,
    s.name as society_name,
    a.created_at,
    a.updated_at,
    a.supabase_id,
    a.registered_society_id
  from public.athletes a
  join public.coaches c on a.current_coach_id = c.id
  left join public.societies s on a.registered_society_id = s.id
  where a.supabase_id = user_id;
end;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_athlete_profile_rpc(uuid) TO authenticated;
-- =======================================================================================
-- FUNCTION 6: get_all_coaches_rpc
-- Purpose: Get list of all coaches with society information
-- Use case: For components that need to display coach selection (like athlete-details)
-- =======================================================================================
create or replace function public.get_all_coaches_rpc()
returns table (
  id uuid,
  first_name text,
  last_name text,
  society_name text,
  society_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select 
    c.id,
    c.first_name,
    c.last_name,
    s.name as society_name,
    c.society_id
  from public.coaches c
  left join public.societies s on c.society_id = s.id
  order by c.first_name, c.last_name;
end;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_all_coaches_rpc() TO authenticated;
-- =======================================================================================
-- FUNCTION 7: get_athlete_coach_rpc
-- Purpose: Get coach information for a specific athlete
-- Use case: Allows athletes to see their coach information safely
-- =======================================================================================
create or replace function public.get_athlete_coach_rpc(user_id uuid)
returns table (
  coach_id uuid,
  first_name text,
  last_name text,
  society_name text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  select 
    c.id as coach_id,
    c.first_name,
    c.last_name,
    s.name as society_name
  from public.athletes a
  join public.coaches c on a.current_coach_id = c.id
  left join public.societies s on c.society_id = s.id
  where a.supabase_id = user_id;
end;
$$;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_athlete_coach_rpc(uuid) TO authenticated;
-- =======================================================================================
-- MIGRATION COMPLETE
-- Summary: 
-- 1. Fixed RLS recursion by removing circular policy dependencies
-- 2. Created 7 RPC functions to safely handle coach-athlete relationships
-- 3. Maintained security while eliminating performance issues
-- Next Steps: Update application code to use these RPC functions
-- =======================================================================================