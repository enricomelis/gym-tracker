"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getDailyRoutinePresets,
  getMicrocyclePresets,
} from "@/lib/actions/presets";
import {
  upsertMicrocyclePlan,
  deleteMicrocyclePlan,
  getMicrocycleForWeek,
  WeeklyMicrocycle,
} from "@/lib/actions/microcycle-planning";
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
import React from "react";

interface Props {
  weekNumber: number;
  year: number;
  onSave: () => Promise<void>;
}

export default function MicrocycleWeekForm({
  weekNumber,
  year,
  onSave,
}: Props) {
  const { toast } = useToast();
  const [dailyOptions, setDailyOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [allPresets, setAllPresets] = useState<
    import("@/lib/types").MicrocyclePreset[]
  >([]);
  const [isPending, startTransition] = useTransition();

  type EditablePlan = {
    name: string;
    allenamento_1: string;
    allenamento_2: string;
    allenamento_3: string;
    allenamento_4: string;
    allenamento_5: string;
    allenamento_6: string;
    allenamento_7: string;
  };

  const emptyPlan: EditablePlan = {
    name: `Week ${weekNumber} ${year}`,
    allenamento_1: "",
    allenamento_2: "",
    allenamento_3: "",
    allenamento_4: "",
    allenamento_5: "",
    allenamento_6: "",
    allenamento_7: "",
  };

  const [plan, setPlan] = useState<EditablePlan>(emptyPlan);

  useEffect(() => {
    async function fetchInitial() {
      const [opts, existing, presets] = await Promise.all([
        getDailyRoutinePresets(),
        getMicrocycleForWeek(weekNumber, year),
        getMicrocyclePresets(),
      ]);
      setDailyOptions(opts.map((o) => ({ id: o.id, name: o.name })));
      setAllPresets(presets);
      if (existing) {
        setPlan({
          name: existing.name || emptyPlan.name,
          allenamento_1: existing.allenamento_1 || "",
          allenamento_2: existing.allenamento_2 || "",
          allenamento_3: existing.allenamento_3 || "",
          allenamento_4: existing.allenamento_4 || "",
          allenamento_5: existing.allenamento_5 || "",
          allenamento_6: existing.allenamento_6 || "",
          allenamento_7: existing.allenamento_7 || "",
        });
      }
    }
    fetchInitial();
  }, [weekNumber, year]);

  /* ---------------------- PRESET APPLICATOR --------------------- */
  const presetNames = Array.from(new Set(allPresets.map((p) => p.name)));

  const applyPreset = (name: string) => {
    if (!name) return;
    const preset = allPresets.find((p) => p.name === name);
    if (!preset) return;
    setPlan({
      name: preset.name,
      allenamento_1: preset.allenamento_1 || "",
      allenamento_2: preset.allenamento_2 || "",
      allenamento_3: preset.allenamento_3 || "",
      allenamento_4: preset.allenamento_4 || "",
      allenamento_5: preset.allenamento_5 || "",
      allenamento_6: preset.allenamento_6 || "",
      allenamento_7: preset.allenamento_7 || "",
    });
  };

  const handleChange = (field: keyof EditablePlan, value: string | null) => {
    setPlan((prev) => ({
      ...prev,
      [field]: value === "none" ? "" : (value ?? ""),
    }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const payload: WeeklyMicrocycle = {
        name: plan.name.trim() || `Week ${weekNumber} ${year}`,
        week_number: weekNumber,
        year,
        allenamento_1: plan.allenamento_1 || null,
        allenamento_2: plan.allenamento_2 || null,
        allenamento_3: plan.allenamento_3 || null,
        allenamento_4: plan.allenamento_4 || null,
        allenamento_5: plan.allenamento_5 || null,
        allenamento_6: plan.allenamento_6 || null,
        allenamento_7: plan.allenamento_7 || null,
        macrocycle_id: null,
      } as WeeklyMicrocycle;

      const res = await upsertMicrocyclePlan(payload);
      if ("error" in res) {
        toast({
          title: "Errore",
          description: res.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Allenamenti salvati",
          duration: 1500,
        });
        await onSave();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteMicrocyclePlan(weekNumber, year);
      if ("error" in res) {
        toast({
          title: "Errore",
          description: res.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Allenamenti rimossi",
          duration: 1500,
        });
        await onSave();
      }
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome</label>
        <Input
          value={plan.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onFocus={handleFocus}
          disabled={isPending}
        />
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-64">
          <label className="text-sm font-medium">Applica Preset</label>
          <Select
            onValueChange={applyPreset}
            disabled={isPending || presetNames.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona Preset" />
            </SelectTrigger>
            <SelectContent>
              {presetNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div
            key={day}
            className="flex flex-col gap-2 md:flex-row md:items-center"
          >
            <label className="w-32 text-sm font-medium">{`Giorno ${day}`}</label>
            <Select
              value={plan[`allenamento_${day}` as keyof EditablePlan] || "none"}
              onValueChange={(val) =>
                handleChange(`allenamento_${day}` as keyof EditablePlan, val)
              }
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona allenamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nessuno</SelectItem>
                {dailyOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          Rimuovi Settimana
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Salvataggio..." : "Salva"}
        </Button>
      </div>
    </div>
  );
}
