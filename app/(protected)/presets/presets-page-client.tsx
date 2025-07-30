"use client";

import PresetColumns from "@/components/preset-columns";
import { useAuthData } from "@/lib/context/auth-context";
import type {
  NewApparatusPreset,
  MicrocyclePresetWithDetails,
  NewTrainingSessionPreset,
  NewMacrocyclePreset,
  NewMacrocyclesMicrocyclesPreset,
  NewMicrocyclesSessionsPreset,
} from "@/lib/types";

interface PresetsPageClientProps {
  presetsData: {
    apparatusPresets: NewApparatusPreset[];
    sessionPresets: NewTrainingSessionPreset[];
    microcyclePresets: MicrocyclePresetWithDetails[];
    microcyclesSessionsPresets: NewMicrocyclesSessionsPreset[];
    macrocyclePresets: NewMacrocyclePreset[];
    macrocyclesMicrocyclesPresets: NewMacrocyclesMicrocyclesPreset[];
  };
}

export default function PresetsPageClient({
  presetsData,
}: PresetsPageClientProps) {
  const { role, loading } = useAuthData();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (role !== "coach") {
    return <div>Solo i tecnici possono gestire i preset.</div>;
  }

  const {
    apparatusPresets,
    sessionPresets,
    microcyclePresets,
    microcyclesSessionsPresets,
    macrocyclePresets,
    macrocyclesMicrocyclesPresets,
  } = presetsData;

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Gestione Preset</h1>

      <PresetColumns
        apparatusPresets={apparatusPresets}
        sessionPresets={sessionPresets}
        microcyclePresets={microcyclePresets}
        microcyclesSessionsPresets={microcyclesSessionsPresets}
        macrocyclePresets={macrocyclePresets}
        macrocyclesMicrocyclesPresets={macrocyclesMicrocyclesPresets}
      />
    </div>
  );
}
