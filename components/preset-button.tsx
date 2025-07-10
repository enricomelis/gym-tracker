"use client";

import { Button } from "@/components/ui/button";
import WeeklyGoalPresetForm from "@/components/weekly-goal-preset-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

type PresetType = "settimanale" | "giornaliera";

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
          <Button variant="secondary">Nuovo Preset</Button>
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

  // Placeholder for daily preset in future
  return (
    <Button onClick={() => {}} variant="secondary">
      Nuovo Preset Giornaliero
    </Button>
  );
}
