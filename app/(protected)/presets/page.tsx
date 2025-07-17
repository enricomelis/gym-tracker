import { getServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/role";
import PresetColumnClient from "./preset-column-client";
import {
  getDailyRoutinePresets,
  getTrainingSessionPresets,
  getWeeklyGoalPresets,
  getMicrocyclePresets,
  getMacrocyclePresets,
} from "@/lib/actions/presets";

export default async function PresetsPage() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Utente non trovato.</div>;
  }

  const role = await getUserRole(supabase, user.id);

  if (role === "coach") {
    // Carica tutti i preset dal database
    const [
      dailyRoutinePresets,
      trainingSessionPresets,
      weeklyGoalPresets,
      microcyclePresets,
      macrocyclePresets,
    ] = await Promise.all([
      getDailyRoutinePresets(),
      getTrainingSessionPresets(),
      getWeeklyGoalPresets(),
      getMicrocyclePresets(),
      getMacrocyclePresets(),
    ]);

    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold">Gestione Preset</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <PresetColumnClient
            type="giornaliera"
            title="Preset Giornalieri"
            presets={dailyRoutinePresets}
          />
          {/* <PresetColumnClient
            type="allenamento"
            title="Preset Allenamento"
            presets={trainingSessionPresets}
          /> */}
          <PresetColumnClient
            type="settimanale"
            title="Preset Settimanali"
            presets={weeklyGoalPresets}
          />
          <PresetColumnClient
            type="microciclo"
            title="Preset Microcicli"
            presets={microcyclePresets}
          />
          {/* <PresetColumnClient
            type="macrociclo"
            title="Preset Macrocicli"
            presets={macrocyclePresets}
          /> */}
        </div>
      </div>
    );
  }

  return <div>PresetsPage</div>;
}
