"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createMicrocyclePreset,
  getDailyRoutinePresets,
} from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MicrocyclePreset, DailyRoutinePreset } from "@/lib/types";

// Types for options
interface DailyRoutinePresetOption {
  id: string;
  name: string;
}

type EditableMicrocyclePreset = {
  name: string;
  allenamento_1: string;
  allenamento_2: string;
  allenamento_3: string;
  allenamento_4: string;
  allenamento_5: string;
  allenamento_6: string;
  allenamento_7: string;
  macrocycle_id: string | null;
};

const initialPreset: EditableMicrocyclePreset = {
  name: "",
  allenamento_1: "",
  allenamento_2: "",
  allenamento_3: "",
  allenamento_4: "",
  allenamento_5: "",
  allenamento_6: "",
  allenamento_7: "",
  macrocycle_id: null,
};

export default function MicrocyclePresetForm({
  onSave,
}: {
  onSave?: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [preset, setPreset] = useState<EditableMicrocyclePreset>(initialPreset);
  const [dailyRoutineOptions, setDailyRoutineOptions] = useState<
    DailyRoutinePresetOption[]
  >([]);
  const [loading, setLoading] = useState(true);
  // Giorno su cui l'utente ha effettuato l'ultima modifica al select
  const [activeDay, setActiveDay] = useState<number | null>(null);

  // Fetch options on mount
  useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      const [dailyRoutines] = await Promise.all([getDailyRoutinePresets()]);
      setDailyRoutineOptions(
        (dailyRoutines || []).map((s: DailyRoutinePreset) => ({
          id: s.id,
          name: s.name,
        })),
      );
      setLoading(false);
    }
    fetchOptions();
  }, []);

  const handleChange = (
    field: keyof EditableMicrocyclePreset,
    value: string | null,
  ) => {
    // For macrocycle_id, treat 'none' as null. For allenamento fields, treat 'none' as "".
    if (field === "macrocycle_id") {
      setPreset((prev) => ({
        ...prev,
        macrocycle_id: value === "none" ? null : value,
      }));
    } else if (field.startsWith("allenamento_")) {
      setPreset((prev) => ({
        ...prev,
        [field]: value === "none" ? "" : (value ?? ""),
      }));
    } else {
      setPreset((prev) => ({ ...prev, [field]: value ?? "" }));
    }
  };

  const handleSave = () => {
    if (!preset.name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }
    // At least one allenamento must be set
    const hasAllenamento = [
      preset.allenamento_1,
      preset.allenamento_2,
      preset.allenamento_3,
      preset.allenamento_4,
      preset.allenamento_5,
      preset.allenamento_6,
      preset.allenamento_7,
    ].some((v) => v && v.trim() !== "");
    if (!hasAllenamento) {
      toast({
        title: "Devi selezionare almeno un allenamento",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      const payload: Omit<
        MicrocyclePreset,
        "id" | "created_by" | "created_at" | "updated_at"
      >[] = [
        {
          name: preset.name.trim(),
          allenamento_1: preset.allenamento_1,
          allenamento_2: preset.allenamento_2,
          allenamento_3: preset.allenamento_3,
          allenamento_4: preset.allenamento_4,
          allenamento_5: preset.allenamento_5,
          allenamento_6: preset.allenamento_6,
          allenamento_7: preset.allenamento_7,
          macrocycle_id: preset.macrocycle_id || null,
        },
      ];
      const result = await createMicrocyclePreset(payload);
      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Preset microciclo salvato.",
          duration: 1500,
        });
        setPreset(initialPreset);
        if (onSave) await onSave();
      }
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  /** Copia il valore dell'allenamento selezionato per un giorno su tutti i giorni 1-5 */
  const applyToWeek = (fromDay: number) => {
    const selectedVal =
      (preset[
        `allenamento_${fromDay}` as keyof EditableMicrocyclePreset
      ] as string) || "";
    if (!selectedVal) return;
    setPreset((prev) => {
      const updated: EditableMicrocyclePreset = { ...prev };
      for (let d = 1; d <= 5; d++) {
        updated[`allenamento_${d}` as keyof EditableMicrocyclePreset] =
          selectedVal;
      }
      return updated;
    });
    // Nasconde il bottone dopo l'applicazione
    setActiveDay(null);
  };

  const clearAll = () => {
    setPreset((prev) => ({
      ...prev,
      allenamento_1: "",
      allenamento_2: "",
      allenamento_3: "",
      allenamento_4: "",
      allenamento_5: "",
      allenamento_6: "",
      allenamento_7: "",
    }));
    setActiveDay(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-8">
          <label className="text-sm font-medium">Nome Preset</label>
          <Input
            value={preset.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onFocus={handleFocus}
            disabled={isPending || loading}
          />
        </div>
        <div className="flex w-full flex-col gap-2 md:col-span-2 md:flex-row md:items-end md:justify-end md:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            disabled={isPending || loading}
          >
            Rimuovi allenamenti
          </Button>
          <Button
            className="md:col-span-2"
            onClick={handleSave}
            disabled={isPending || loading || !preset.name.trim()}
          >
            {isPending ? "Salvataggio..." : "Salva Preset"}
          </Button>
        </div>
      </div>
      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Macrociclo (opzionale)</label>
          <Select
            value={preset.macrocycle_id || "none"}
            onValueChange={(val) => handleChange("macrocycle_id", val)}
            disabled={isPending || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona macrociclo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nessuno</SelectItem>
              {macrocycleOptions.map((opt: MacrocyclePresetOption) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div> */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div
            key={day}
            className="flex flex-col gap-2 md:flex-row md:items-center"
          >
            <label className="w-32 text-sm font-medium">
              Allenamento {day}
            </label>
            <Select
              value={
                preset[
                  `allenamento_${day}` as keyof EditableMicrocyclePreset
                ] || "none"
              }
              onValueChange={(val) => {
                setActiveDay(day);
                handleChange(
                  `allenamento_${day}` as keyof EditableMicrocyclePreset,
                  val,
                );
              }}
              disabled={isPending || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona allenamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuno</SelectItem>
                {dailyRoutineOptions.map((opt: DailyRoutinePresetOption) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {day <= 5 &&
              activeDay === day &&
              preset[`allenamento_${day}` as keyof EditableMicrocyclePreset] &&
              preset[`allenamento_${day}` as keyof EditableMicrocyclePreset] !==
                "none" && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2 md:mt-0"
                  onClick={() => applyToWeek(day)}
                  disabled={isPending || loading}
                >
                  Applica a tutta la settimana
                </Button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}
