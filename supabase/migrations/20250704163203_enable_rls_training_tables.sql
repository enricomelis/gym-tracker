-- Enable Row Level Security on training and planning tables
-- This implements access control based on coach-athlete relationships

-- Enable RLS on training tables
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apparatus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_training_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on planning tables
ALTER TABLE public.apparatus_weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routines ENABLE ROW LEVEL SECURITY;

-- TRAINING_SESSIONS POLICIES
-- Coaches can see sessions of their athletes
CREATE POLICY "Coaches can view training sessions of their athletes" 
ON public.training_sessions 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

-- Athletes can see their own training sessions
CREATE POLICY "Athletes can view their own training sessions" 
ON public.training_sessions 
FOR SELECT 
TO authenticated 
USING (
  id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.supabase_id = (SELECT auth.uid())
  )
);

-- Coaches can create training sessions for their athletes
CREATE POLICY "Coaches can create training sessions" 
ON public.training_sessions 
FOR INSERT 
TO authenticated 
WITH CHECK (true);  -- Will be controlled by athlete_training_sessions policies

-- Coaches can update training sessions of their athletes
CREATE POLICY "Coaches can update training sessions of their athletes" 
ON public.training_sessions 
FOR UPDATE 
TO authenticated 
USING (
  id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
)
WITH CHECK (
  id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

-- Coaches can delete training sessions of their athletes
CREATE POLICY "Coaches can delete training sessions of their athletes" 
ON public.training_sessions 
FOR DELETE 
TO authenticated 
USING (
  id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

-- ATHLETE_TRAINING_SESSIONS POLICIES
-- Coaches can manage athlete-session relationships for their athletes
CREATE POLICY "Coaches can view athlete training session links for their athletes" 
ON public.athlete_training_sessions 
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

CREATE POLICY "Coaches can create athlete training session links for their athletes" 
ON public.athlete_training_sessions 
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

CREATE POLICY "Coaches can delete athlete training session links for their athletes" 
ON public.athlete_training_sessions 
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

-- Athletes can view their own training session links
CREATE POLICY "Athletes can view their own training session links" 
ON public.athlete_training_sessions 
FOR SELECT 
TO authenticated 
USING (
  athlete_id IN (
    SELECT id FROM public.athletes WHERE supabase_id = (SELECT auth.uid())
  )
);

-- APPARATUS_SESSIONS POLICIES
-- Coaches can manage apparatus sessions for training sessions of their athletes
CREATE POLICY "Coaches can view apparatus sessions of their athletes" 
ON public.apparatus_sessions 
FOR SELECT 
TO authenticated 
USING (
  training_session_id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

-- Athletes can view their own apparatus sessions
CREATE POLICY "Athletes can view their own apparatus sessions" 
ON public.apparatus_sessions 
FOR SELECT 
TO authenticated 
USING (
  training_session_id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.supabase_id = (SELECT auth.uid())
  )
);

-- Coaches can manage apparatus sessions
CREATE POLICY "Coaches can create apparatus sessions for their athletes" 
ON public.apparatus_sessions 
FOR INSERT 
TO authenticated 
WITH CHECK (
  training_session_id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "Coaches can update apparatus sessions of their athletes" 
ON public.apparatus_sessions 
FOR UPDATE 
TO authenticated 
USING (
  training_session_id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
)
WITH CHECK (
  training_session_id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "Coaches can delete apparatus sessions of their athletes" 
ON public.apparatus_sessions 
FOR DELETE 
TO authenticated 
USING (
  training_session_id IN (
    SELECT ats.training_session_id 
    FROM public.athlete_training_sessions ats
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

-- TRAINING_SETS POLICIES
-- Coaches can manage training sets for apparatus sessions of their athletes
CREATE POLICY "Coaches can view training sets of their athletes" 
ON public.training_sets 
FOR SELECT 
TO authenticated 
USING (
  apparatus_session_id IN (
    SELECT ap.id
    FROM public.apparatus_sessions ap
    JOIN public.athlete_training_sessions ats ON ap.training_session_id = ats.training_session_id
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

-- Athletes can view their own training sets
CREATE POLICY "Athletes can view their own training sets" 
ON public.training_sets 
FOR SELECT 
TO authenticated 
USING (
  apparatus_session_id IN (
    SELECT ap.id
    FROM public.apparatus_sessions ap
    JOIN public.athlete_training_sessions ats ON ap.training_session_id = ats.training_session_id
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.supabase_id = (SELECT auth.uid())
  )
);

-- Coaches can manage training sets
CREATE POLICY "Coaches can create training sets for their athletes" 
ON public.training_sets 
FOR INSERT 
TO authenticated 
WITH CHECK (
  apparatus_session_id IN (
    SELECT ap.id
    FROM public.apparatus_sessions ap
    JOIN public.athlete_training_sessions ats ON ap.training_session_id = ats.training_session_id
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "Coaches can update training sets of their athletes" 
ON public.training_sets 
FOR UPDATE 
TO authenticated 
USING (
  apparatus_session_id IN (
    SELECT ap.id
    FROM public.apparatus_sessions ap
    JOIN public.athlete_training_sessions ats ON ap.training_session_id = ats.training_session_id
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
)
WITH CHECK (
  apparatus_session_id IN (
    SELECT ap.id
    FROM public.apparatus_sessions ap
    JOIN public.athlete_training_sessions ats ON ap.training_session_id = ats.training_session_id
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "Coaches can delete training sets of their athletes" 
ON public.training_sets 
FOR DELETE 
TO authenticated 
USING (
  apparatus_session_id IN (
    SELECT ap.id
    FROM public.apparatus_sessions ap
    JOIN public.athlete_training_sessions ats ON ap.training_session_id = ats.training_session_id
    JOIN public.athletes a ON ats.athlete_id = a.id
    WHERE a.current_coach_id IN (
      SELECT id FROM public.coaches WHERE supabase_id = (SELECT auth.uid())
    )
  )
);

-- APPARATUS_WEEKLY_GOALS POLICIES
-- Coaches can manage weekly goals for their athletes
CREATE POLICY "Coaches can view weekly goals of their athletes" 
ON public.apparatus_weekly_goals 
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

-- Athletes can view their own weekly goals
CREATE POLICY "Athletes can view their own weekly goals" 
ON public.apparatus_weekly_goals 
FOR SELECT 
TO authenticated 
USING (
  athlete_id IN (
    SELECT id FROM public.athletes WHERE supabase_id = (SELECT auth.uid())
  )
);

-- Coaches can manage weekly goals for their athletes
CREATE POLICY "Coaches can create weekly goals for their athletes" 
ON public.apparatus_weekly_goals 
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

CREATE POLICY "Coaches can update weekly goals of their athletes" 
ON public.apparatus_weekly_goals 
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

CREATE POLICY "Coaches can delete weekly goals of their athletes" 
ON public.apparatus_weekly_goals 
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

-- DAILY_ROUTINES POLICIES
-- Coaches can manage daily routines for their athletes
CREATE POLICY "Coaches can view daily routines of their athletes" 
ON public.daily_routines 
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

-- Athletes can view their own daily routines
CREATE POLICY "Athletes can view their own daily routines" 
ON public.daily_routines 
FOR SELECT 
TO authenticated 
USING (
  athlete_id IN (
    SELECT id FROM public.athletes WHERE supabase_id = (SELECT auth.uid())
  )
);

-- Coaches can manage daily routines for their athletes
CREATE POLICY "Coaches can create daily routines for their athletes" 
ON public.daily_routines 
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

CREATE POLICY "Coaches can update daily routines of their athletes" 
ON public.daily_routines 
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

CREATE POLICY "Coaches can delete daily routines of their athletes" 
ON public.daily_routines 
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