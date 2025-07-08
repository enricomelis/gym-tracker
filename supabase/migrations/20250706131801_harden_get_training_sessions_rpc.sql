-- Migration: Aggiunge un controllo di robustezza per coach_id in get_training_sessions_rpc
-- Scopo: Assicurarsi che la funzione fallisca in modo esplicito se non trova un coach per l'utente.

-- 1️⃣ Drop della funzione precedente per evitare conflitti
DROP FUNCTION IF EXISTS public.get_training_sessions_rpc(UUID, DATE, DATE);
-- 2️⃣ Creazione nuova funzione con controllo esplicito
CREATE OR REPLACE FUNCTION public.get_training_sessions_rpc(
  p_athlete_id  UUID DEFAULT NULL,
  p_start_date  DATE DEFAULT NULL,
  p_end_date    DATE DEFAULT NULL
)
RETURNS TABLE (
  id             UUID,
  date           DATE,
  session_number INTEGER,
  daily_routines JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  coach_id        UUID;
BEGIN
  -- Identifica l'utente corrente
  SELECT auth.uid() INTO current_user_id;
  
  -- ID del coach collegato all'utente corrente (se coach)
  SELECT c.id INTO coach_id FROM public.coaches AS c WHERE c.supabase_id = current_user_id;

  -- CONTROLLO ESPLICITO: Se non viene trovato un coach, termina immediatamente.
  IF coach_id IS NULL THEN
    RAISE WARNING 'Nessun profilo coach trovato per l''utente corrente (supabase_id: %). La funzione ritornerà un set vuoto.', current_user_id;
    RETURN; -- Termina l'esecuzione e restituisce un set vuoto.
  END IF;

  /*
   * CASO 1: viene passato un athlete_id specifico
   */
  IF p_athlete_id IS NOT NULL THEN
    -- Se l'utente non è coach dell'atleta → errore
    IF NOT EXISTS (
      SELECT 1
      FROM public.athletes AS a
      WHERE a.id = p_athlete_id AND a.current_coach_id = coach_id
    ) THEN
      RAISE EXCEPTION 'You can only access training sessions for athletes you coach';
    END IF;

    RETURN QUERY
    SELECT ts.id,
           ts.date,
           ts.session_number,
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
           )
    FROM public.training_sessions ts
    JOIN public.athlete_training_sessions ats ON ts.id = ats.training_session_id
    LEFT JOIN public.daily_routines dr ON ts.id = dr.session_id
    WHERE ats.athlete_id = p_athlete_id
      AND (p_start_date IS NULL OR ts.date >= p_start_date)
      AND (p_end_date   IS NULL OR ts.date <= p_end_date)
    GROUP BY ts.id, ts.date, ts.session_number
    ORDER BY ts.date DESC, ts.session_number;

  /*
   * CASO 2: nessun athlete_id → restituisce tutte le sessioni degli atleti del coach
   */
  ELSE
    RETURN QUERY
    SELECT ts.id,
           ts.date,
           ts.session_number,
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
           )
    FROM public.training_sessions ts
    JOIN public.athlete_training_sessions ats ON ts.id = ats.training_session_id
    JOIN public.athletes a ON ats.athlete_id = a.id
    LEFT JOIN public.daily_routines dr ON ts.id = dr.session_id
    WHERE a.current_coach_id = coach_id
      AND (p_start_date IS NULL OR ts.date >= p_start_date)
      AND (p_end_date   IS NULL OR ts.date <= p_end_date)
    GROUP BY ts.id, ts.date, ts.session_number
    ORDER BY ts.date DESC, ts.session_number;
  END IF;
END;
$$;
-- 3️⃣ Permessi di esecuzione
GRANT EXECUTE ON FUNCTION public.get_training_sessions_rpc(UUID, DATE, DATE) TO authenticated;