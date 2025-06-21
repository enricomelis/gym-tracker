import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachDashboard from "@/components/coach-dashboard";
import AthleteDashboard from "@/components/athlete-dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [coachRes, athleteRes] = await Promise.all([
    supabase
      .from("coaches")
      .select("id", { count: "exact", head: true })
      .eq("supabase_id", user.id),
    supabase
      .from("athletes")
      .select("id", { count: "exact", head: true })
      .eq("supabase_id", user.id),
  ]);

  if (coachRes.error) {
    console.error("Error fetching coach profile:", coachRes.error);
    return <div>Errore nel caricamento del profilo tecnico.</div>;
  }

  if (athleteRes.error) {
    console.error("Error fetching athlete profile:", athleteRes.error);
    return <div>Errore nel caricamento del profilo atleta.</div>;
  }

  if (coachRes.count !== null && coachRes.count > 0) {
    return <CoachDashboard />;
  }

  if (athleteRes.count !== null && athleteRes.count > 0) {
    return <AthleteDashboard />;
  }

  return (
    <div>
      Il tuo utente non ha un ruolo assegnato (né tecnico, né atleta). Contatta
      l&apos;amministratore.
    </div>
  );
}
