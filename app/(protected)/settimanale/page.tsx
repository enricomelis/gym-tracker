import { getServerClient } from "@/lib/supabase/server";
import { getCompetitions } from "@/lib/actions/athletes";
import WeeklyPlanner from "./weekly-planner";
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
    // Coach: mostra tutti i suoi atleti usando RPC aggiornata
    const { data: coachId, error: coachError } = await supabase.rpc(
      "get_coach_id_rpc",
      { user_id: user.id },
    );

    if (coachError || !coachId) {
      return <div>Errore nel caricamento del profilo tecnico.</div>;
    }

    const [athletesRes, competitions] = await Promise.all([
      supabase.rpc("get_coach_athletes_rpc", {
        p_coach_id: coachId as string,
        p_active_only: true,
      }),
      getCompetitions(),
    ]);

    const athletes = athletesRes.data;
    if (athletesRes.error || !athletes) {
      return <div>Errore nel caricamento del profilo tecnico.</div>;
    }
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

  if (role === "athlete") {
    const [athleteRes, competitions] = await Promise.all([
      supabase.rpc("get_athlete_profile_rpc", { user_id: user.id }),
      getCompetitions(),
    ]);

    const athlete = athleteRes.data?.[0];
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
        <WeeklyPlanner athletes={[athlete]} competitions={competitions} />
      </div>
    );
  }

  // Nessun ruolo valido
  return <div>Ruolo non riconosciuto. Contatta l&#39;amministratore.</div>;
}
