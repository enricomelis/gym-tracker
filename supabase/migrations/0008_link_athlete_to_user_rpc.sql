-- Funzione RPC per collegare un atleta a un utente Supabase tramite numero di tessera
create or replace function public.link_athlete_to_user(
  registration_number integer,
  user_id uuid
)
returns void as $$
begin
  update public.athletes
  set supabase_id = user_id
  where public.athletes.registration_number = link_athlete_to_user.registration_number
    and supabase_id is null;

  if not found then
    raise exception 'Profilo non trovato o già collegato';
  end if;
end;
$$ language plpgsql security definer; 