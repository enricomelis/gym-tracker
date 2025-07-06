import { getServerClient } from "@/lib/supabase/server";
import DailyPlanner from "./daily-planner";
import { getUserRole } from "@/lib/role";

export default async function GiornalieraPage() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Utente non trovato.</div>;
  }

  const role = await getUserRole(supabase, user.id);

  if (role === "coach") {
    const { data: athletes, error: athletesError } = await supabase.rpc(
      "get_coach_athletes_rpc",
      { user_id: user.id, include_inactive: false },
    );

    if (athletesError || !athletes) {
      return <div>Errore nel caricamento degli atleti.</div>;
    }
    return (
      <div className="p-4 md:p-6">
        <h1 className="mb-4 text-2xl font-bold">Programmazione Giornaliera</h1>
        {athletes.length > 0 ? (
          <DailyPlanner athletes={athletes} />
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
    const { data: athleteProfile, error: athleteError } = await supabase.rpc(
      "get_athlete_profile_rpc",
      { user_id: user.id }
    );

    const athlete = athleteProfile?.[0];
    if (!athlete || athleteError) {
      return <div>Errore nel caricamento atleta.</div>;
    }

    return (
      <div className="p-4 md:p-6">
        <h1 className="mb-4 text-2xl font-bold">
          La tua Programmazione Giornaliera
        </h1>
        <DailyPlanner athletes={[athlete]} />
      </div>
    );
  }

  return <div>Ruolo non riconosciuto. Contatta l&#39;amministratore.</div>;
}
