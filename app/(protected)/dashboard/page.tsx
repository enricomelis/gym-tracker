import { getServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachDashboard from "@/components/coach-dashboard";
import AthleteDashboard from "@/components/athlete-dashboard";
import { getUserRole } from "@/lib/role";

export default async function DashboardPage() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const role = await getUserRole(supabase, user.id);

  if (role === "coach") {
    return <CoachDashboard />;
  }

  if (role === "athlete") {
    return <AthleteDashboard />;
  }

  return (
    <div>
      Il tuo utente non ha un ruolo assegnato (né tecnico, né atleta). Contatta
      l&apos;amministratore.
    </div>
  );
}
