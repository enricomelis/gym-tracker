"use client";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

const EXECUTION_COEFFICIENTS = ["A+", "A", "B+", "B", "C+", "C"];

// Define type for TrainingSetFormData
export type TrainingSetFormData = {
  set_number: number;
  volume_done: number;
  execution_coefficient: string;
  execution_penalty: number;
  falls: number;
  elements_done_number: number;
  intensity: number;
  id?: string;
};

export default function TrainingSetForm({
  open,
  onClose,
  onSubmit,
  nextSetNumber,
  initialData,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TrainingSetFormData) => void;
  nextSetNumber: number;
  initialData?: TrainingSetFormData;
  onDelete?: () => void;
}) {
  const { register, handleSubmit, reset, setValue, watch, getValues } = useForm(
    {
      defaultValues: initialData || {
        set_number: nextSetNumber,
        volume_done: 1,
        execution_coefficient: "A",
        execution_penalty: 0,
        falls: 0,
        elements_done_number: 1,
        intensity: 0,
      },
    },
  );

  // Update set_number if nextSetNumber changes
  React.useEffect(() => {
    if (!initialData) setValue("set_number", nextSetNumber);
  }, [nextSetNumber, setValue, initialData]);

  // Se initialData cambia (apertura form su una salita), aggiorna i valori
  React.useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key as keyof TrainingSetFormData, value);
      });
    }
  }, [initialData, setValue]);

  // Mapping from coefficient to penalty value
  const COEFFICIENT_TO_PENALTY: Record<string, number> = {
    "A+": 1.4,
    A: 1.6,
    "B+": 1.8,
    B: 2.0,
    "C+": 2.2,
    C: 2.5,
  };

  const onFormSubmit = (data: TrainingSetFormData) => {
    const dataWithIntensity = {
      ...data,
      intensity: Number.isFinite(intensity) ? Number(intensity.toFixed(2)) : 0,
    };
    // Se in modifica e i dati non sono cambiati, chiudi solo il form
    if (initialData) {
      const orig = { ...initialData, intensity: Number(initialData.intensity) };
      const curr = { ...dataWithIntensity };
      // Rimuovi eventuali id/campi non editabili dal confronto
      delete orig.id;
      delete curr.id;
      if (JSON.stringify(orig) === JSON.stringify(curr)) {
        onClose();
        reset();
        return;
      }
    }
    onSubmit(dataWithIntensity);
    reset();
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  // Calcolo intensità in tempo reale
  const volume = Number(watch("volume_done")) || 0;
  const executionCoefficient = watch("execution_coefficient");
  const sets = 1;
  const penalty = COEFFICIENT_TO_PENALTY[executionCoefficient] ?? 0;
  const CoE = (10 - penalty) / 10;
  const intensity = sets > 0 ? (volume * CoE) / sets : 0;

  // Chiudi il form con ESC se in modifica e non ci sono cambiamenti
  React.useEffect(() => {
    if (!open || !initialData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Confronta i dati attuali con initialData
        const curr = getValues();
        const orig = { ...initialData };
        delete orig.id;
        delete curr.id;
        if (JSON.stringify(orig) === JSON.stringify(curr)) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, initialData, getValues, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuova Salita</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Numero Salita</label>
            <Input
              type="number"
              {...register("set_number", { valueAsNumber: true })}
              min={1}
              onFocus={handleFocus}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Volume</label>
            <Input
              type="number"
              {...register("volume_done", { valueAsNumber: true })}
              min={1}
              onFocus={handleFocus}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Esecuzione</label>
            <Select
              {...register("execution_coefficient")}
              value={watch("execution_coefficient")}
              onValueChange={(v) => setValue("execution_coefficient", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Esecuzione" />
              </SelectTrigger>
              <SelectContent>
                {EXECUTION_COEFFICIENTS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Cadute</label>
            <Input
              type="number"
              {...register("falls", { valueAsNumber: true })}
              min={0}
              onFocus={handleFocus}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Elementi eseguiti</label>
            <Input
              type="number"
              {...register("elements_done_number", { valueAsNumber: true })}
              min={1}
              onFocus={handleFocus}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Intensità</label>
            <Input
              type="number"
              step="0.01"
              value={Number.isFinite(intensity) ? intensity.toFixed(2) : "0.00"}
              disabled
              readOnly
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {initialData && onDelete && (
              <Button type="button" variant="destructive" onClick={onDelete}>
                Elimina
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit">Salva</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
