-- Enable Row Level Security on core tables
-- This implements access control based on coach-athlete relationships

-- Enable RLS on core authentication tables
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY
-- SOCIETIES POLICIES
-- Coaches can see their own society
CREATE POLICY "Coaches can view their own society" 
ON public.societies 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT society_id 
    FROM public.coaches 
    WHERE supabase_id = (SELECT auth.uid())
  )
)
-- Only coaches can manage societies (no INSERT/UPDATE/DELETE for now)

-- COACHES POLICIES  
-- Coaches can see their own profile
CREATE POLICY "Coaches can view their own profile" 
ON public.coaches 
FOR SELECT 
TO authenticated 
USING (supabase_id = (SELECT auth.uid()))
-- Coaches can update their own profile
CREATE POLICY "Coaches can update their own profile" 
ON public.coaches 
FOR UPDATE 
TO authenticated 
USING (supabase_id = (SELECT auth.uid()))
WITH CHECK (supabase_id = (SELECT auth.uid()))
-- Athletes can see their current coach
CREATE POLICY "Athletes can view their current coach" 
ON public.coaches 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT current_coach_id 
    FROM public.athletes 
    WHERE supabase_id = (SELECT auth.uid())
  )
)
-- ATHLETES POLICIES
-- Coaches can see their athletes
CREATE POLICY "Coaches can view their athletes" 
ON public.athletes 
FOR SELECT 
TO authenticated 
USING (
  current_coach_id IN (
    SELECT id 
    FROM public.coaches 
    WHERE supabase_id = (SELECT auth.uid())
  )
)
-- Athletes can see their own profile  
CREATE POLICY "Athletes can view their own profile" 
ON public.athletes 
FOR SELECT 
TO authenticated 
USING (supabase_id = (SELECT auth.uid()))
-- Coaches can update their athletes
CREATE POLICY "Coaches can update their athletes" 
ON public.athletes 
FOR UPDATE 
TO authenticated 
USING (
  current_coach_id IN (
    SELECT id 
    FROM public.coaches 
    WHERE supabase_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  current_coach_id IN (
    SELECT id 
    FROM public.coaches 
    WHERE supabase_id = (SELECT auth.uid())
  )
)
-- Coaches can insert new athletes
CREATE POLICY "Coaches can create athletes" 
ON public.athletes 
FOR INSERT 
TO authenticated 
WITH CHECK (
  current_coach_id IN (
    SELECT id 
    FROM public.coaches 
    WHERE supabase_id = (SELECT auth.uid())
  )
)
-- Athletes can update their own profile (limited fields)
-- Note: Athletes cannot change coach or society - this would require additional application logic
CREATE POLICY "Athletes can update their own profile" 
ON public.athletes 
FOR UPDATE 
TO authenticated 
USING (supabase_id = (SELECT auth.uid()))
WITH CHECK (supabase_id = (SELECT auth.uid()))
-- Coaches can delete their athletes (mark as inactive)
CREATE POLICY "Coaches can delete their athletes" 
ON public.athletes 
FOR DELETE 
TO authenticated 
USING (
  current_coach_id IN (
    SELECT id 
    FROM public.coaches 
    WHERE supabase_id = (SELECT auth.uid())
  )
)