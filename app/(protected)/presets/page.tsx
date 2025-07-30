import { getUnifiedPresets } from "@/lib/actions/presets";
import PresetsPageClient from "./presets-page-client";

export default async function PresetsPage() {
  const presetsResult = await getUnifiedPresets();

  if ("error" in presetsResult) {
    return <div>Errore nel caricamento dei preset: {presetsResult.error}</div>;
  }

  return <PresetsPageClient presetsData={presetsResult} />;
}
