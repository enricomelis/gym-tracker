-- Migration: 20250706130001_fix_get_coach_athletes_rpc.sql
-- Scopo: correggere ambiguità di colonna e disallineamenti di tipo nella RPC get_coach_athletes_rpc

-- 1️⃣ Elimina la vecchia funzione (se esiste con la stessa firma)
DROP FUNCTION IF EXISTS public.get_coach_athletes_rpc(UUID, BOOLEAN)
-- 2️⃣ Ricrea la funzione con alias qualificati e tipi coerenti
CREATE OR REPLACE FUNCTION public.get_coach_athletes_rpc(
  p_coach_id      UUID,
  p_active_only   BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id                     UUID,
  first_name             TEXT,
  last_name              TEXT,
  date_of_birth          DATE,
  registration_number    INTEGER,
  category               TEXT,
  current_coach_id       UUID,
  registered_society_id  UUID,
  created_at             TIMESTAMP,
  updated_at             TIMESTAMP,
  supabase_id            UUID,
  is_active              BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id     UUID;
  authorized_coach_id UUID;
BEGIN
  -- ID dell'utente loggato
  SELECT auth.uid() INTO current_user_id;

  -- ID del coach loggato (colonna qualificata)
  SELECT c.id
  INTO   authorized_coach_id
  FROM   public.coaches AS c
  WHERE  c.supabase_id = current_user_id;

  -- Verifica accesso
  IF authorized_coach_id IS DISTINCT FROM p_coach_id THEN
    RAISE EXCEPTION 'You can only access your own athletes';
  END IF;

  -- Restituisci gli atleti (filtrando per is_active se richiesto)
  RETURN QUERY
  SELECT a.id,
         a.first_name::TEXT,
         a.last_name::TEXT,
         a.date_of_birth,
         a.registration_number,
         a.category::TEXT,
         a.current_coach_id,
         a.registered_society_id,
         a.created_at,
         a.updated_at,
         a.supabase_id,
         a.is_active
  FROM   public.athletes AS a
  WHERE  a.current_coach_id = p_coach_id
    AND  (p_active_only = false OR a.is_active = true)
  ORDER  BY a.first_name, a.last_name;
END;
$$
-- 3️⃣ Concedi i permessi di esecuzione al ruolo applicativo
GRANT EXECUTE ON FUNCTION public.get_coach_athletes_rpc(UUID, BOOLEAN) TO authenticated