// Temporarily disabled during refactoring
// Original implementation preserved below for reference

/*
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
          "id, current_coach_id, first_name, last_name, birth_date, registration_number, category, registered_society_id, created_at, updated_at, supabase_id",
        )
        .eq("supabase_id", user.id)
        .single(),
      getCompetitions(),
    ]);

    if (athleteRes.error || !athleteRes.data) {
      return <div>Errore nel caricamento del profilo atleta.</div>;
    }

    const athlete = athleteRes.data;

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
*/

export default function SettimanalePage() {
  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-muted-foreground">
          Programmazione Settimanale
        </h1>
        <p className="text-lg text-muted-foreground">
          Questa funzionalità è temporaneamente disabilitata durante il
          refactoring.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tornerà presto con una nuova interfaccia migliorata.
        </p>
      </div>
    </div>
  );
}
