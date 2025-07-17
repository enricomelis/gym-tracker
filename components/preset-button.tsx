"use client";

import { Button } from "@/components/ui/button";
import WeeklyGoalPresetForm from "@/components/weekly-goal-preset-form";
import DailyRoutinePresetForm from "@/components/daily-routine-preset-form";
import TrainingSessionPresetForm from "@/components/training-session-preset-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MicrocyclePresetForm from "@/components/microcycle-preset-form";
import { useState } from "react";

type PresetType = "settimanale" | "giornaliera" | "allenamento" | "microciclo";

export default function PresetButton({
  presetType,
}: {
  presetType: PresetType;
}) {
  const [open, setOpen] = useState(false);

  if (presetType === "settimanale") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">Nuovo Preset Settimanale (Volume)</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crea Preset Settimanale</DialogTitle>
          </DialogHeader>
          <WeeklyGoalPresetForm onSave={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  if (presetType === "giornaliera") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">Nuovo Preset Giornaliero</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crea Preset Giornaliero</DialogTitle>
          </DialogHeader>
          <DailyRoutinePresetForm onSave={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  if (presetType === "allenamento") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">Nuovo Preset Allenamento</Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Crea Preset Sessione di Allenamento</DialogTitle>
          </DialogHeader>
          <TrainingSessionPresetForm onSave={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  if (presetType === "microciclo") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">
            Nuovo Preset Settimanale (Microciclo)
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crea Preset Microciclo</DialogTitle>
          </DialogHeader>
          <MicrocyclePresetForm onSave={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  // Fallback
  return null;
}
