import { createClient } from "@/lib/supabase/server";
import DailyPlanner from "./daily-planner";

export default async function GiornalieraPage() {
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
    const { data: athletes, error: athletesError } = await supabase
      .from("athletes")
      .select(
        "id, first_name, last_name, date_of_birth, registration_number, category, current_coach_id, registered_society_id, created_at, updated_at, supabase_id",
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

  // Se non è coach, prova come atleta
  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select(
      "id, first_name, last_name, date_of_birth, registration_number, category, current_coach_id, registered_society_id, created_at, updated_at, supabase_id",
    )
    .eq("supabase_id", user.id)
    .single();

  if (athlete && !athleteError) {
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
