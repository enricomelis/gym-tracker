"use client";

import { useRouter } from "next/navigation";
import PresetButton from "@/components/preset-button";
import type {
  DailyRoutinePreset,
  TrainingSessionPreset,
  WeeklyGoalPreset,
  MicrocyclePreset,
} from "@/lib/types";

type PresetType = "giornaliera" | "allenamento" | "settimanale" | "microciclo";

interface PresetColumnClientProps {
  type: PresetType;
  title: string;
  presets:
    | DailyRoutinePreset[]
    | TrainingSessionPreset[]
    | WeeklyGoalPreset[]
    | MicrocyclePreset[];
}

// Raggruppa preset per nome
const groupPresetsByName = (
  presets: (
    | DailyRoutinePreset
    | TrainingSessionPreset
    | WeeklyGoalPreset
    | MicrocyclePreset
  )[],
) => {
  const groups = new Map<string, typeof presets>();
  presets.forEach((preset) => {
    const existing = groups.get(preset.name) || [];
    existing.push(preset);
    groups.set(preset.name, existing);
  });
  return groups;
};

const formatGroupedPresetInfo = (
  group: (
    | DailyRoutinePreset
    | TrainingSessionPreset
    | WeeklyGoalPreset
    | MicrocyclePreset
  )[],
  type: PresetType,
): { primary: string; secondary: string; details: string } => {
  const name = group[0].name;

  switch (type) {
    case "giornaliera": {
      const dailyGroup = group as DailyRoutinePreset[];
      const apparatus = dailyGroup.map((p) => p.apparatus).sort();

      // Controlla se tutti hanno gli stessi parametri
      const firstPreset = dailyGroup[0];
      const sameParams = dailyGroup.every(
        (p) =>
          p.type === firstPreset.type &&
          p.quantity === firstPreset.quantity &&
          p.target_sets === firstPreset.target_sets &&
          p.target_execution === firstPreset.target_execution,
      );

      if (sameParams) {
        return {
          primary: name,
          secondary: `${apparatus.join(", ")}`,
          details: `${firstPreset.type} • Q:${firstPreset.quantity} • S:${firstPreset.target_sets} • ${firstPreset.target_execution}`,
        };
      } else {
        return {
          primary: name,
          secondary: `${apparatus.length} attrezzi`,
          details: apparatus
            .map((app) => {
              const preset = dailyGroup.find((p) => p.apparatus === app)!;
              return `${app}: ${preset.type} Q:${preset.quantity} S:${preset.target_sets}`;
            })
            .join(" • "),
        };
      }
    }

    case "allenamento": {
      // Gli allenamenti di solito sono unici per nome, ma gestiamo comunque il raggruppamento
      const p = group[0] as TrainingSessionPreset;
      const dayLabel =
        p.week_day !== null
          ? `${["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"][p.week_day]}`
          : "Generico";
      const apparatusCount = [
        p.fx_preset_id,
        p.ph_preset_id,
        p.sr_preset_id,
        p.vt_preset_id,
        p.pb_preset_id,
        p.hb_preset_id,
      ].filter(Boolean).length;

      return {
        primary: name,
        secondary: `${dayLabel} • ${apparatusCount} attrezzi`,
        details: "",
      };
    }

    case "settimanale": {
      const weeklyGroup = group as WeeklyGoalPreset[];
      const apparatus = weeklyGroup.map((p) => p.apparatus).sort();

      // Controlla se tutti hanno gli stessi parametri macro/micro
      const firstPreset = weeklyGroup[0];
      const sameParams = weeklyGroup.every(
        (p) => p.macro === firstPreset.macro && p.micro === firstPreset.micro,
      );

      if (sameParams) {
        const totalVol = weeklyGroup.reduce(
          (sum, p) => sum + p.exercise_volume,
          0,
        );
        const totalDismount = weeklyGroup.reduce(
          (sum, p) => sum + p.dismount_volume,
          0,
        );

        return {
          primary: name,
          secondary: `${apparatus.join(", ")}`,
          details: `${firstPreset.macro} • ${firstPreset.micro} • Vol:${totalVol} • Uscita:${totalDismount}`,
        };
      } else {
        return {
          primary: name,
          secondary: `${apparatus.length} attrezzi`,
          details: apparatus
            .map((app) => {
              const preset = weeklyGroup.find((p) => p.apparatus === app)!;
              return `${app}: ${preset.macro} Vol:${preset.exercise_volume}`;
            })
            .join(" • "),
        };
      }
    }

    case "microciclo": {
      // Microcicli sono tipicamente unici per nome
      const p = group[0] as MicrocyclePreset;
      const trainingCount = [
        p.allenamento_1,
        p.allenamento_2,
        p.allenamento_3,
        p.allenamento_4,
        p.allenamento_5,
        p.allenamento_6,
        p.allenamento_7,
      ].filter(Boolean).length;

      return {
        primary: name,
        secondary: `${trainingCount}/7 allenamenti`,
        details: "",
      };
    }
  }
};

export default function PresetColumnClient({
  type,
  title,
  presets,
}: PresetColumnClientProps) {
  const router = useRouter();

  const handleSave = () => {
    router.refresh();
  };

  // Raggruppa i preset per nome
  const groupedPresets = groupPresetsByName(presets);
  const totalItems = presets.length;
  const groupCount = groupedPresets.size;

  return (
    <div className="space-y-4">
      <PresetButton presetType={type} onSave={handleSave} />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {title} ({groupCount} preset, {totalItems} elementi)
        </h3>
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {groupCount > 0 ? (
            Array.from(groupedPresets.entries()).map(([groupName, group]) => {
              const { primary, secondary, details } = formatGroupedPresetInfo(
                group,
                type,
              );
              return (
                <div
                  key={groupName}
                  className="rounded-lg border bg-card p-3 text-card-foreground shadow-sm"
                >
                  <div className="text-sm font-medium">{primary}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {secondary}
                  </div>
                  {details && (
                    <div className="mt-1 border-t border-muted pt-1 text-xs text-muted-foreground/80">
                      {details}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-sm italic text-muted-foreground">
              Nessun preset creato
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
