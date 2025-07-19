"use client";

import { useEffect, useState, useTransition } from "react";
import { createWeeklyGoalPreset } from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { WeeklyGoalPreset } from "@/lib/types";

// Apparatus list and enums reused from WeeklyGoalPreset type
const apparatusList: Array<WeeklyGoalPreset["apparatus"]> = [
  "FX",
  "PH",
  "SR",
  "VT",
  "PB",
  "HB",
];

const macrocycleOptions: Array<WeeklyGoalPreset["macro"]> = [
  "Mixed",
  "Competition",
];
const microcycleOptions: Array<WeeklyGoalPreset["micro"]> = [
  "Increasing Load",
  "Decreasing Load",
  "Model",
  "Competition Week",
];

// Editable state allows string placeholders for numeric fields
type EditablePreset = Omit<
  WeeklyGoalPreset,
  | "id"
  | "created_by"
  | "exercise_volume"
  | "dismount_volume"
  | "base_volume"
  | "target_penalty"
> & {
  exercise_volume: number | "";
  dismount_volume: number | "";
  base_volume?: number | "" | null;
  target_penalty: number | "";
};

export default function WeeklyGoalPresetForm({
  onSave,
}: {
  onSave?: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [presetName, setPresetName] = useState("");
  const [presetGoals, setPresetGoals] = useState<EditablePreset[]>(() =>
    apparatusList.map((app) => ({
      name: "",
      apparatus: app,
      macro: "Mixed",
      micro: "Increasing Load",
      exercise_volume: 0,
      dismount_volume: 0,
      target_penalty: 0,
      base_volume: app === "VT" ? 0 : null,
    })),
  );

  // Keep name synced across all rows
  useEffect(() => {
    setPresetGoals((prev) => prev.map((g) => ({ ...g, name: presetName })));
  }, [presetName]);

  const handleSettingChange = (
    field: "macro" | "micro",
    value: WeeklyGoalPreset["macro"] | WeeklyGoalPreset["micro"],
  ) => {
    setPresetGoals((prev) => prev.map((g) => ({ ...g, [field]: value })));
  };

  const handleApparatusChange = (
    apparatus: WeeklyGoalPreset["apparatus"],
    field: keyof Omit<
      WeeklyGoalPreset,
      "id" | "created_by" | "name" | "apparatus" | "macro" | "micro"
    >,
    value: string | number | null,
  ) => {
    setPresetGoals((prev) =>
      prev.map((g) =>
        g.apparatus === apparatus ? { ...g, [field]: value } : g,
      ),
    );
  };

  const handleSave = () => {
    if (!presetName.trim()) {
      toast({
        title: "Nome Preset obbligatorio",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const goalsToSave = presetGoals
        .filter((g) => {
          const ex = Number(g.exercise_volume) || 0;
          const dis = Number(g.dismount_volume) || 0;
          const base = g.apparatus === "VT" ? Number(g.base_volume) || 0 : 0;
          const pen = Number(g.target_penalty) || 0;
          return ex > 0 || dis > 0 || base > 0 || pen > 0;
        })
        .map((g) => ({
          ...g,
          // Ensure numeric fields are numbers
          exercise_volume: Number(g.exercise_volume) || 0,
          dismount_volume: Number(g.dismount_volume) || 0,
          base_volume: g.apparatus === "VT" ? Number(g.base_volume) || 0 : null,
          target_penalty: Number(g.target_penalty) || 0,
        }));

      if (goalsToSave.length === 0) {
        toast({
          title: "Nessun dato inserito",
          description: "Inserisci almeno un valore di volume o penalità",
          variant: "destructive",
        });
        return;
      }

      const result = await createWeeklyGoalPreset(goalsToSave);
      if ("error" in result) {
        toast({
          title: "Errore",
          description: `Salvataggio fallito: ${result.error}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Preset salvato correttamente.",
          duration: 1500,
        });
        if (onSave) await onSave();
        // Reset form
        setPresetName("");
        setPresetGoals((prev) =>
          prev.map((g) => ({
            ...g,
            name: "",
            exercise_volume: 0,
            dismount_volume: 0,
            base_volume: g.apparatus === "VT" ? 0 : null,
            target_penalty: 0,
          })),
        );
      }
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-2">
          <label className="text-sm font-medium">Nome Preset</label>
          <Input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
        </div>
        <div className="flex items-end justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending || !presetName.trim()}
          >
            {isPending ? "Salvataggio..." : "Salva Preset"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Macrociclo</label>
          <Select
            value={presetGoals[0].macro}
            onValueChange={(val) =>
              handleSettingChange("macro", val as WeeklyGoalPreset["macro"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {macrocycleOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Microciclo</label>
          <Select
            value={presetGoals[0].micro}
            onValueChange={(val) =>
              handleSettingChange("micro", val as WeeklyGoalPreset["micro"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {microcycleOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table for desktop */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attrezzo</TableHead>
              <TableHead>Volume Esercizi</TableHead>
              <TableHead>Volume Uscite / Base (VT)</TableHead>
              <TableHead>Penalità Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presetGoals.map((g) => (
              <TableRow key={g.apparatus}>
                <TableCell className="font-medium">{g.apparatus}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={
                      typeof g.exercise_volume === "string"
                        ? ""
                        : g.exercise_volume
                    }
                    onFocus={handleFocus}
                    onChange={(e) =>
                      handleApparatusChange(
                        g.apparatus,
                        "exercise_volume",
                        e.target.value === ""
                          ? ""
                          : parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </TableCell>
                <TableCell>
                  {g.apparatus === "VT" ? (
                    <Input
                      type="number"
                      value={
                        typeof g.base_volume === "string"
                          ? ""
                          : (g.base_volume ?? 0)
                      }
                      onFocus={handleFocus}
                      onChange={(e) =>
                        handleApparatusChange(
                          g.apparatus,
                          "base_volume",
                          e.target.value === ""
                            ? ""
                            : parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="Vol. Basi"
                    />
                  ) : (
                    <Input
                      type="number"
                      value={
                        typeof g.dismount_volume === "string"
                          ? ""
                          : g.dismount_volume
                      }
                      onFocus={handleFocus}
                      onChange={(e) =>
                        handleApparatusChange(
                          g.apparatus,
                          "dismount_volume",
                          e.target.value === ""
                            ? ""
                            : parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="Vol. Uscite"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.1"
                    value={
                      typeof g.target_penalty === "string"
                        ? ""
                        : g.target_penalty
                    }
                    onFocus={handleFocus}
                    onChange={(e) =>
                      handleApparatusChange(
                        g.apparatus,
                        "target_penalty",
                        e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile layout */}
      <div className="space-y-6 md:hidden">
        {presetGoals.map((g) => (
          <div
            key={g.apparatus}
            className="space-y-3 rounded border p-4 shadow-sm"
          >
            <div className="mb-2 text-base font-semibold">{g.apparatus}</div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Volume Esercizi
              </label>
              <Input
                type="number"
                value={
                  typeof g.exercise_volume === "string" ? "" : g.exercise_volume
                }
                onFocus={handleFocus}
                onChange={(e) =>
                  handleApparatusChange(
                    g.apparatus,
                    "exercise_volume",
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                  )
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {g.apparatus === "VT" ? "Volume Basi" : "Volume Uscite"}
              </label>
              <Input
                type="number"
                value={
                  g.apparatus === "VT"
                    ? typeof g.base_volume === "string"
                      ? ""
                      : (g.base_volume ?? 0)
                    : typeof g.dismount_volume === "string"
                      ? ""
                      : g.dismount_volume
                }
                onFocus={handleFocus}
                onChange={(e) =>
                  handleApparatusChange(
                    g.apparatus,
                    g.apparatus === "VT" ? "base_volume" : "dismount_volume",
                    e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                  )
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Penalità Target
              </label>
              <Input
                type="number"
                step="0.1"
                value={
                  typeof g.target_penalty === "string" ? "" : g.target_penalty
                }
                onFocus={handleFocus}
                onChange={(e) =>
                  handleApparatusChange(
                    g.apparatus,
                    "target_penalty",
                    e.target.value === ""
                      ? ""
                      : parseFloat(e.target.value) || 0,
                  )
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
