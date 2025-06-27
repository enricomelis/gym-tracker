import { createClient } from "@/lib/supabase/server";
import { getAthletesForCoach, getCompetitions } from "@/lib/actions/athletes";
import WeeklyPlanner from "./weekly-planner";

export default async function SettimanalePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Utente non trovato.</div>;
  }

  // Prova a vedere se è un coach
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (coach && !coachError) {
    // Coach: mostra tutti i suoi atleti
    const athletes = await getAthletesForCoach(coach.id);
    const competitions = await getCompetitions();
    return (
      <div className="p-4 md:p-6">
        <h1 className="mb-4 text-2xl font-bold">Programmazione Settimanale</h1>
        {athletes.length > 0 ? (
          <WeeklyPlanner athletes={athletes} competitions={competitions} />
        ) : (
          <p>
            Non hai ancora aggiunto nessun atleta. Aggiungine uno dalla pagina{" "}
            <a href="/atleti" className="underline">
              Atleti
            </a>
            .
          </p>
        )}
      </div>
    );
  }

  // Se non è coach, prova come atleta
  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select(
      "id, current_coach_id, first_name, last_name, date_of_birth, registration_number, category, registered_society_id, created_at, updated_at, supabase_id",
    )
    .eq("supabase_id", user.id)
    .single();

  if (athlete && !athleteError) {
    // Atleta: mostra solo la sua programmazione
    const competitions = await getCompetitions();
    return (
      <div className="p-4 md:p-6">
        <h1 className="mb-4 text-2xl font-bold">
          La tua Programmazione Settimanale
        </h1>
        <WeeklyPlanner athletes={[athlete]} competitions={competitions} />
      </div>
    );
  }

  // Nessun ruolo valido
  return <div>Ruolo non riconosciuto. Contatta l'amministratore.</div>;
}
