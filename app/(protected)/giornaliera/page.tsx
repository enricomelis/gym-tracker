import { getAthletesForCoach } from "@/lib/actions/athletes";
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

  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (coachError || !coach) {
    return <div>Coach non trovato.</div>;
  }

  const athletes = await getAthletesForCoach(coach.id);

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
