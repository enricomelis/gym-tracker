-- Enable Row Level Security on remaining tables
-- This completes the RLS implementation for competitions, presets, and relationships

-- Enable RLS on competition tables
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes_competitions ENABLE ROW LEVEL SECURITY;
-- Enable RLS on preset tables
ALTER TABLE public.weekly_goal_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routine_presets ENABLE ROW LEVEL SECURITY;
-- Enable RLS on relationship tables
ALTER TABLE public.coaches_athletes ENABLE ROW LEVEL SECURITY;
-- COMPETITIONS POLICIES
-- Coaches can view competitions related to their athletes
CREATE POLICY "Coaches can view competitions of their athletes" 
ON public.competitions 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT ac.competition_id 
    FROM public.athletes_competitions ac
    JOIN public.athletes a ON ac.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);
-- Athletes can view competitions they are registered for
CREATE POLICY "Athletes can view their own competitions" 
ON public.competitions 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT ac.competition_id 
    FROM public.athletes_competitions ac
    JOIN public.athletes a ON ac.athlete_id = a.id
    WHERE a.supabase_id = (SELECT auth.uid())
  )
);
-- Only authenticated users can create competitions (for now, could be restricted further)
CREATE POLICY "Coaches can create competitions" 
ON public.competitions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
-- Coaches can update competitions if they have athletes registered
CREATE POLICY "Coaches can update competitions with their athletes" 
ON public.competitions 
FOR UPDATE 
TO authenticated 
USING (
  id IN (
    SELECT ac.competition_id 
    FROM public.athletes_competitions ac
    JOIN public.athletes a ON ac.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
)
WITH CHECK (
  id IN (
    SELECT ac.competition_id 
    FROM public.athletes_competitions ac
    JOIN public.athletes a ON ac.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);
-- ATHLETES_COMPETITIONS POLICIES
-- Coaches can manage competition registrations for their athletes
CREATE POLICY "Coaches can view competition registrations of their athletes" 
ON public.athletes_competitions 
FOR SELECT 
TO authenticated 
USING (
  athlete_id IN (
    SELECT id FROM public.athletes 
    WHERE current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);
-- Athletes can view their own competition registrations
CREATE POLICY "Athletes can view their own competition registrations" 
ON public.athletes_competitions 
FOR SELECT 
TO authenticated 
USING (
  athlete_id IN (
    SELECT id FROM public.athletes WHERE supabase_id = (SELECT auth.uid())
  )
);
-- Coaches can register their athletes for competitions
CREATE POLICY "Coaches can register their athletes for competitions" 
ON public.athletes_competitions 
FOR INSERT 
TO authenticated 
WITH CHECK (
  athlete_id IN (
    SELECT id FROM public.athletes 
    WHERE current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);
-- Coaches can update competition registrations for their athletes
CREATE POLICY "Coaches can update competition registrations of their athletes" 
ON public.athletes_competitions 
FOR UPDATE 
TO authenticated 
USING (
  athlete_id IN (
    SELECT id FROM public.athletes 
    WHERE current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
)
WITH CHECK (
  athlete_id IN (
    SELECT id FROM public.athletes 
    WHERE current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);
-- Coaches can remove their athletes from competitions
CREATE POLICY "Coaches can remove their athletes from competitions" 
ON public.athletes_competitions 
FOR DELETE 
TO authenticated 
USING (
  athlete_id IN (
    SELECT id FROM public.athletes 
    WHERE current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);
-- WEEKLY_GOAL_PRESETS POLICIES
-- Coaches can manage their own presets
CREATE POLICY "Coaches can view their own weekly goal presets" 
ON public.weekly_goal_presets 
FOR SELECT 
TO authenticated 
USING (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
CREATE POLICY "Coaches can create their own weekly goal presets" 
ON public.weekly_goal_presets 
FOR INSERT 
TO authenticated 
WITH CHECK (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
CREATE POLICY "Coaches can update their own weekly goal presets" 
ON public.weekly_goal_presets 
FOR UPDATE 
TO authenticated 
USING (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
CREATE POLICY "Coaches can delete their own weekly goal presets" 
ON public.weekly_goal_presets 
FOR DELETE 
TO authenticated 
USING (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
-- DAILY_ROUTINE_PRESETS POLICIES
-- Coaches can manage their own presets
CREATE POLICY "Coaches can view their own daily routine presets" 
ON public.daily_routine_presets 
FOR SELECT 
TO authenticated 
USING (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
CREATE POLICY "Coaches can create their own daily routine presets" 
ON public.daily_routine_presets 
FOR INSERT 
TO authenticated 
WITH CHECK (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
CREATE POLICY "Coaches can update their own daily routine presets" 
ON public.daily_routine_presets 
FOR UPDATE 
TO authenticated 
USING (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
CREATE POLICY "Coaches can delete their own daily routine presets" 
ON public.daily_routine_presets 
FOR DELETE 
TO authenticated 
USING (
  created_by IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
-- COACHES_ATHLETES POLICIES
-- Coaches can manage relationships with their athletes
CREATE POLICY "Coaches can view their athlete relationships" 
ON public.coaches_athletes 
FOR SELECT 
TO authenticated 
USING (
  coach_id IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
-- Athletes can view their coach relationships
CREATE POLICY "Athletes can view their coach relationships" 
ON public.coaches_athletes 
FOR SELECT 
TO authenticated 
USING (
  athlete_id IN (
    SELECT id FROM public.athletes WHERE supabase_id = (SELECT auth.uid())
  )
);
-- Coaches can create relationships with athletes
CREATE POLICY "Coaches can create athlete relationships" 
ON public.coaches_athletes 
FOR INSERT 
TO authenticated 
WITH CHECK (
  coach_id IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
-- Coaches can update their athlete relationships
CREATE POLICY "Coaches can update their athlete relationships" 
ON public.coaches_athletes 
FOR UPDATE 
TO authenticated 
USING (
  coach_id IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  coach_id IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);
-- Coaches can end their athlete relationships
CREATE POLICY "Coaches can delete their athlete relationships" 
ON public.coaches_athletes 
FOR DELETE 
TO authenticated 
USING (
  coach_id IN (
    SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
  )
);