"use client";

import CoachDashboard from "@/components/coach-dashboard";
import AthleteDashboard from "@/components/athlete-dashboard";
import { useAuthData } from "@/lib/context/auth-context";

export default function DashboardPage() {
  const { role, loading } = useAuthData();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p>Caricamento dashboard...</p>
      </div>
    );
  }

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
