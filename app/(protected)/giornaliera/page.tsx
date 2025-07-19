// Temporarily disabled during refactoring
// Original implementation preserved below for reference

/*
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
    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select("id")
      .eq("supabase_id", user.id)
      .single();

    if (coachError || !coach) {
      return <div>Errore nel caricamento degli atleti.</div>;
    }

    const { data: athletes, error: athletesError } = await supabase
      .from("athletes")
      .select(
        "id, first_name, last_name, birth_date, registration_number, category, current_coach_id, registered_society_id, created_at, updated_at, supabase_id",
      )
      .eq("current_coach_id", coach.id);
    if (athletesError) {
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
    const { data: athlete, error: athleteError } = await supabase
      .from("athletes")
      .select(
        "id, first_name, last_name, birth_date, registration_number, category, current_coach_id, registered_society_id, created_at, updated_at, supabase_id",
      )
      .eq("supabase_id", user.id)
      .single();

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
*/

export default function GiornalieraPage() {
  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold text-muted-foreground">
          Programmazione Giornaliera
        </h1>
        <p className="text-lg text-muted-foreground">
          Questa funzionalità è temporaneamente disabilitata durante il refactoring.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tornerà presto con una nuova interfaccia migliorata.
        </p>
      </div>
    </div>
  );
}
