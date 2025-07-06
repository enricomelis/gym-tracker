-- Migration: Fix RPC Function Data Types
-- Purpose: Correct data type mismatches in RPC functions
-- Affected: Updates get_coach_athletes_rpc and get_athlete_profile_rpc functions
-- Context: Fixes ERROR 42804 - structure of query does not match function result type
-- Date: 2025-07-06

-- =======================================================================================
-- Fix get_coach_athletes_rpc function with correct data types
-- =======================================================================================
drop function if exists public.get_coach_athletes_rpc(uuid, boolean);

create function public.get_coach_athletes_rpc(user_id uuid, include_inactive boolean default false)
returns table (
  id uuid,
  first_name varchar,
  last_name varchar,
  date_of_birth date,
  registration_number integer,
  category text,
  is_active boolean,
  created_at timestamp,
  updated_at timestamp,
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

-- =======================================================================================
-- Fix get_athlete_profile_rpc function with correct data types
-- =======================================================================================
drop function if exists public.get_athlete_profile_rpc(uuid);

create function public.get_athlete_profile_rpc(user_id uuid)
returns table (
  id uuid,
  first_name varchar,
  last_name varchar,
  date_of_birth date,
  registration_number integer,
  category text,
  is_active boolean,
  created_at timestamp,
  updated_at timestamp,
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
  where a.supabase_id = user_id;
end;
$$;

-- Grant execute permissions to authenticated users
grant execute on function public.get_coach_athletes_rpc(uuid, boolean) to authenticated;
grant execute on function public.get_athlete_profile_rpc(uuid) to authenticated; 