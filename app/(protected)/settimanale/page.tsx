import { getServerClient } from "@/lib/supabase/server";
import { getAthletesForCoach, getCompetitions } from "@/lib/actions/athletes";
import WeeklyPlanner from "./weekly-planner";
import WeeklyPlannerSwitcher from "./weekly-planner-switcher";
import { getUserRole } from "@/lib/role";

export default async function SettimanalePage() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Utente non trovato.</div>;
  }

  const role = await getUserRole(supabase, user.id);

  if (role === "coach") {
    // Fetch coach id
    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select("id")
      .eq("supabase_id", user.id)
      .single();

    if (coachError || !coach) {
      return <div>Errore nel caricamento del profilo tecnico.</div>;
    }

    // Coach: mostra tutti i suoi atleti
    const [athletes, competitions] = await Promise.all([
      getAthletesForCoach(coach.id),
      getCompetitions(),
    ]);

    return (
      <div className="p-4 md:p-6">
        <h1 className="mb-4 text-2xl font-bold">Programmazione Settimanale</h1>
        <WeeklyPlannerSwitcher
          athletes={athletes}
          competitions={competitions}
        />
      </div>
    );
  }

  if (role === "athlete") {
    const [athleteRes, competitions] = await Promise.all([
      supabase
        .from("athletes")
        .select(
          "id, current_coach_id, first_name, last_name, date_of_birth, registration_number, category, registered_society_id, created_at, updated_at, supabase_id",
        )
        .eq("supabase_id", user.id)
        .single(),
      getCompetitions(),
    ]);

    const athlete = athleteRes.data;
    const athleteError = athleteRes.error;

    if (!athlete || athleteError) {
      return <div>Errore nel caricamento del profilo atleta.</div>;
    }

    // Atleta: mostra solo la sua programmazione
    return (
      <div className="p-4 md:p-6">
        <h1 className="mb-4 text-2xl font-bold">
          La tua Programmazione Settimanale
        </h1>
        <WeeklyPlanner
          athletes={[athlete]}
          competitions={competitions}
          year={new Date().getFullYear()}
        />
      </div>
    );
  }

  // Nessun ruolo valido
  return <div>Ruolo non riconosciuto. Contatta l&#39;amministratore.</div>;
}
