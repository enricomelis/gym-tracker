"use client";

import { useState, useTransition, useEffect } from "react";
import { updateMacrocyclePreset } from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { NewMacrocyclePreset } from "@/lib/types";

interface MacrocyclePresetEditFormProps {
  preset: NewMacrocyclePreset;
  onSave?: () => Promise<void> | void;
  onCancel?: () => void;
}

export default function MacrocyclePresetEditForm({
  preset,
  onSave,
  onCancel,
}: MacrocyclePresetEditFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(preset.name);
  const [lengthInWeeks, setLengthInWeeks] = useState(preset.length_in_weeks);

  // Handle ESC key to cancel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onCancel) {
          onCancel();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  // Auto-select text on focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    if (lengthInWeeks < 1) {
      toast({ title: "Durata minima 1 settimana", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await updateMacrocyclePreset(preset.id, {
        name: name.trim(),
        length_in_weeks: lengthInWeeks,
      });

      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Preset macrociclo aggiornato con successo.",
          duration: 1500,
        });
        if (onSave) await onSave();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Preset Macrociclo</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Inserisci nome preset"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Durata in Settimane</label>
        <Input
          type="number"
          min="1"
          value={lengthInWeeks}
          onChange={(e) => setLengthInWeeks(parseInt(e.target.value) || 1)}
          disabled={isPending}
          placeholder="Inserisci durata"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Annulla
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending || !name.trim() || lengthInWeeks < 1}
        >
          {isPending ? "Aggiornamento..." : "Aggiorna Preset"}
        </Button>
      </div>
    </div>
  );
}
