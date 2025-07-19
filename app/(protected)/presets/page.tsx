import { getServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/role";
import PresetColumnClient from "./preset-column-client";
import { getUnifiedPresets } from "@/lib/actions/presets";

export default async function PresetsPage() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Utente non trovato.</div>;
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== "coach") {
    return <div>Solo i tecnici possono gestire i preset.</div>;
  }

  // Use the optimized unified function to get all presets at once
  const presetsResult = await getUnifiedPresets();

  if ("error" in presetsResult) {
    return <div>Errore nel caricamento dei preset: {presetsResult.error}</div>;
  }

  const {
    apparatusPresets,
    sessionPresets,
    weekdayPresets,
    weekdaysSessionsPresets,
  } = presetsResult;

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Gestione Preset</h1>

      {/* Debug info - remove in production */}
      <div className="mt-8 rounded-lg bg-muted p-4">
        <h3 className="mb-2 font-semibold">Debug Info:</h3>
        <div className="text-sm">
          <p>Apparatus Presets: {apparatusPresets.length}</p>
          <p>Session Presets: {sessionPresets.length}</p>
          <p>Weekday Presets: {weekdayPresets.length}</p>
          <p>Weekdays Sessions Presets: {weekdaysSessionsPresets.length}</p>
        </div>
      </div>
    </div>
  );
}
