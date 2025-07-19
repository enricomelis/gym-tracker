import { getServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/role";
import PresetColumnClient from "./preset-column-client";
import { getApparatusPresets } from "@/lib/actions/presets";
import { PresetType } from "@/lib/types";

export default async function PresetsPage() {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Utente non trovato.</div>;
  }

  const role = await getUserRole(supabase, user.id);

  const presetTypesArray: PresetType[] = [
    "attrezzo",
    "allenamento",
    "giornaliero",
    "microciclo",
    "macrociclo",
  ];

  if (role === "coach") {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold">Gestione Preset</h1>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5"></div>
      </div>
    );
  }

  return <div>PresetsPage</div>;
}
