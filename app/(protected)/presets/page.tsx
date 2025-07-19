import { getServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/role";
import { getUnifiedPresets } from "@/lib/actions/presets";
import PresetColumns from "@/components/preset-columns";

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
    microcyclePresets,
    microcyclesWeekdaysPresets,
  } = presetsResult;

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Gestione Preset</h1>

      <PresetColumns
        apparatusPresets={apparatusPresets}
        sessionPresets={sessionPresets}
        weekdayPresets={weekdayPresets}
        weekdaysSessionsPresets={weekdaysSessionsPresets}
        microcyclePresets={microcyclePresets}
        microcyclesWeekdaysPresets={microcyclesWeekdaysPresets}
      />
    </div>
  );
}
