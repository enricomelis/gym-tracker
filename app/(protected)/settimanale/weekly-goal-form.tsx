"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import React from "react";

import type { WeeklyGoal } from "@/lib/actions/planning";
import { upsertWeeklyGoals, deleteWeeklyGoals } from "@/lib/actions/planning";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

type Competition = {
  id: string;
  location: string;
  date: string;
};

const apparatusList: Array<WeeklyGoal["apparatus"]> = [
  "FX",
  "PH",
  "SR",
  "VT",
  "PB",
  "HB",
];

const macrocycleOptions: Array<WeeklyGoal["macro"]> = ["Mixed", "Competition"];
const microcycleOptions: Array<WeeklyGoal["micro"]> = [
  "Increasing Load",
  "Decreasing Load",
  "Model",
  "Competition Week",
];

// Extend WeeklyGoal to allow empty-string placeholders for numeric fields during editing
type EditableWeeklyGoal = Omit<WeeklyGoal, "id" | "athlete_id"> & {
  exercise_volume: number | "";
  dismount_volume: number | "";
  base_volume?: number | "" | null;
  target_penalty: number | "";
};

export default function WeeklyGoalForm({
  athleteId,
  year,
  weekNumber,
  initialGoals,
  competitions,
  onSave,
}: {
  athleteId: string;
  year: number;
  weekNumber: number;
  initialGoals: WeeklyGoal[];
  competitions: Competition[];
  onSave: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [weeklyGoals, setWeeklyGoals] = useState<EditableWeeklyGoal[]>([]);

  useEffect(() => {
    const goalsMap = new Map(initialGoals.map((g) => [g.apparatus, g]));
    const firstGoal = initialGoals[0];
    const weeklyMacro = firstGoal?.macro ?? "Mixed";
    const weeklyMicro = firstGoal?.micro ?? "Increasing Load";
    const weeklyCamp = firstGoal?.camp ?? null;
    const weeklyCompetitionId = firstGoal?.competition_id ?? null;

    const newGoals = apparatusList.map((apparatus) => {
      const existingGoal = goalsMap.get(apparatus);
      const obj: EditableWeeklyGoal = {
        week_number: weekNumber,
        year: year,
        apparatus: apparatus,
        macro: weeklyMacro,
        micro: weeklyMicro,
        camp: weeklyCamp,
        competition_id: weeklyCompetitionId,
        exercise_volume: existingGoal?.exercise_volume ?? 0,
        dismount_volume: existingGoal?.dismount_volume ?? 0,
        target_penalty: existingGoal?.target_penalty ?? 0,
        base_volume: existingGoal?.base_volume ?? null,
      };
      return obj;
    });
    setWeeklyGoals(newGoals);
  }, [initialGoals, weekNumber, year]);

  const handleApparatusGoalChange = (
    apparatus: WeeklyGoal["apparatus"],
    field: keyof Omit<WeeklyGoal, "id" | "athlete_id">,
    value: string | number | null,
  ) => {
    setWeeklyGoals((prevGoals) =>
      prevGoals.map((goal) =>
        goal.apparatus === apparatus ? { ...goal, [field]: value } : goal,
      ),
    );
  };

  const handleWeeklySettingChange = (
    field: "macro" | "micro" | "camp" | "competition_id",
    value: string | null,
  ) => {
    setWeeklyGoals((prevGoals) =>
      prevGoals.map((goal) => ({ ...goal, [field]: value })),
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const goalsToSave = weeklyGoals
        .filter(
          (g) =>
            (g.exercise_volume ?? 0) > 0 ||
            (g.dismount_volume ?? 0) > 0 ||
            (g.base_volume ?? 0) > 0 ||
            (g.target_penalty ?? 0) > 0,
        )
        .map((g) => ({
          ...g,
          athlete_id: athleteId,
        }));

      // No need to show toast if nothing is saved.
      // The parent component will handle the UI state.
      if (goalsToSave.length === 0) {
        await onSave();
        return;
      }

      const result = await upsertWeeklyGoals(goalsToSave);

      if (result.error) {
        toast({
          title: "Errore",
          description: `Salvataggio fallito: ${result.error}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Programmazione settimanale salvata con successo.",
          duration: 1000,
        });
        await onSave();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWeeklyGoals(athleteId, year, weekNumber);

      if (result.error) {
        toast({
          title: "Errore",
          description: `Cancellazione fallita: ${result.error}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Programmazione settimanale rimossa con successo.",
          duration: 1000,
        });
        await onSave();
      }
    });
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <div className="max-h-[70vh] space-y-4 overflow-y-auto md:max-h-none md:overflow-visible">
      {/* Weekly Settings */}
      <div className="grid grid-cols-1 gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Macrociclo</label>
          <Select
            value={weeklyGoals[0]?.macro ?? "Mixed"}
            onValueChange={(value) =>
              handleWeeklySettingChange("macro", value as WeeklyGoal["macro"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {macrocycleOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Microciclo</label>
          <Select
            value={weeklyGoals[0]?.micro ?? "Increasing Load"}
            onValueChange={(value) =>
              handleWeeklySettingChange("micro", value as WeeklyGoal["micro"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {microcycleOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Competizione</label>
          <Select
            value={weeklyGoals[0]?.competition_id ?? "none"}
            onValueChange={(value) =>
              handleWeeklySettingChange(
                "competition_id",
                value === "none" ? null : value,
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona Gara" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nessuna</SelectItem>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {`${comp.location} - ${format(new Date(comp.date), "dd/MM/yyyy")}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Raduno</label>
          <Input
            value={weeklyGoals[0]?.camp ?? ""}
            onChange={(e) => handleWeeklySettingChange("camp", e.target.value)}
          />
        </div>
      </div>

      {/* Mobile: blocchi in colonna */}
      <div className="space-y-6 md:hidden">
        {weeklyGoals.map((goal) => (
          <div
            key={goal.apparatus}
            className="space-y-3 rounded border bg-card p-4 shadow-sm"
          >
            <div className="mb-2 text-base font-semibold">{goal.apparatus}</div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Volume Esercizi
              </label>
              <Input
                type="number"
                value={
                  typeof goal.exercise_volume === "string"
                    ? ""
                    : goal.exercise_volume
                }
                onFocus={handleFocus}
                onChange={(e) => {
                  const val = e.target.value;
                  handleApparatusGoalChange(
                    goal.apparatus,
                    "exercise_volume",
                    val === "" ? "" : parseInt(val) || 0,
                  );
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {goal.apparatus === "VT" ? "Volume Basi" : "Volume Uscite"}
              </label>
              <Input
                type="number"
                value={
                  goal.apparatus === "VT"
                    ? typeof goal.base_volume === "string"
                      ? ""
                      : (goal.base_volume ?? 0)
                    : typeof goal.dismount_volume === "string"
                      ? ""
                      : goal.dismount_volume
                }
                onFocus={handleFocus}
                onChange={(e) =>
                  handleApparatusGoalChange(
                    goal.apparatus,
                    goal.apparatus === "VT" ? "base_volume" : "dismount_volume",
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
                  typeof goal.target_penalty === "string"
                    ? ""
                    : goal.target_penalty
                }
                onFocus={handleFocus}
                onChange={(e) =>
                  handleApparatusGoalChange(
                    goal.apparatus,
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

      {/* Desktop: tabella */}
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
            {weeklyGoals.map((goal) => (
              <TableRow key={goal.apparatus}>
                <TableCell className="font-medium">{goal.apparatus}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={
                      typeof goal.exercise_volume === "string"
                        ? ""
                        : goal.exercise_volume
                    }
                    onFocus={handleFocus}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleApparatusGoalChange(
                        goal.apparatus,
                        "exercise_volume",
                        val === "" ? "" : parseInt(val) || 0,
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  {goal.apparatus === "VT" ? (
                    <Input
                      type="number"
                      value={
                        typeof goal.base_volume === "string"
                          ? ""
                          : (goal.base_volume ?? 0)
                      }
                      onFocus={handleFocus}
                      onChange={(e) =>
                        handleApparatusGoalChange(
                          goal.apparatus,
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
                        typeof goal.dismount_volume === "string"
                          ? ""
                          : goal.dismount_volume
                      }
                      onFocus={handleFocus}
                      onChange={(e) =>
                        handleApparatusGoalChange(
                          goal.apparatus,
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
                      typeof goal.target_penalty === "string"
                        ? ""
                        : goal.target_penalty
                    }
                    onFocus={handleFocus}
                    onChange={(e) =>
                      handleApparatusGoalChange(
                        goal.apparatus,
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
      <div className="flex justify-end gap-2 pt-4">
        {initialGoals.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isPending}>
                Rimuovi
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione non può essere annullata. Rimuoverà in modo
                  permanente la programmazione per questa settimana.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Sì, rimuovi programmazione
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button onClick={handleSave} disabled={isPending}>
          {isPending
            ? "Salvataggio..."
            : initialGoals.length > 0
              ? "Salva Modifiche"
              : "Crea Programmazione"}
        </Button>
      </div>
    </div>
  );
}
