-- Funzione RPC per collegare un atleta a un utente Supabase tramite numero di tessera
CREATE OR REPLACE FUNCTION public.link_athlete_to_user(
    registration_number integer,
    user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_catalog AS
$$
BEGIN
    UPDATE public.athletes
    SET supabase_id = user_id
    WHERE public.athletes.registration_number = registration_number
      AND supabase_id IS NULL;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profilo non trovato o già collegato';
    END IF;
END;
$$;