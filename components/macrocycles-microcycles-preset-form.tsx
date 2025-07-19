"use client";

import { useState, useTransition, useEffect } from "react";
import { createMacrocyclesMicrocyclesPreset } from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { NewMacrocyclePreset, NewMicrocyclePreset } from "@/lib/types";

interface MacrocyclesMicrocyclesPresetFormProps {
  onSave?: () => Promise<void> | void;
  availableMacrocycles: NewMacrocyclePreset[];
  availableMicrocycles: NewMicrocyclePreset[];
  onCancel?: () => void;
}

export default function MacrocyclesMicrocyclesPresetForm({
  onSave,
  availableMacrocycles,
  availableMicrocycles,
  onCancel,
}: MacrocyclesMicrocyclesPresetFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [macrocycleId, setMacrocycleId] = useState("");
  const [microcycleId, setMicrocycleId] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);

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

    if (!macrocycleId) {
      toast({ title: "Macrociclo obbligatorio", variant: "destructive" });
      return;
    }

    if (!microcycleId) {
      toast({ title: "Microciclo obbligatorio", variant: "destructive" });
      return;
    }

    if (weekNumber < 1) {
      toast({
        title: "Numero settimana deve essere almeno 1",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createMacrocyclesMicrocyclesPreset([
        {
          name: name.trim(),
          macrocycle_id: macrocycleId,
          microcycle_id: microcycleId,
          week_number: weekNumber,
        },
      ]);

      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Associazione macrociclo-microcicli salvata.",
          duration: 1500,
        });
        setName("");
        setMacrocycleId("");
        setMicrocycleId("");
        setWeekNumber(1);
        if (onSave) await onSave();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Associazione</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Inserisci nome associazione"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Preset Macrociclo</label>
        <Select
          value={macrocycleId}
          onValueChange={setMacrocycleId}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona preset macrociclo" />
          </SelectTrigger>
          <SelectContent>
            {availableMacrocycles.map((macrocycle) => (
              <SelectItem key={macrocycle.id} value={macrocycle.id}>
                {macrocycle.name} ({macrocycle.length_in_weeks} settimane)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Preset Microciclo</label>
        <Select
          value={microcycleId}
          onValueChange={setMicrocycleId}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona preset microciclo" />
          </SelectTrigger>
          <SelectContent>
            {availableMicrocycles.map((microcycle) => (
              <SelectItem key={microcycle.id} value={microcycle.id}>
                {microcycle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Numero Settimana</label>
        <Input
          type="number"
          min="1"
          value={weekNumber}
          onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Numero settimana"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending || !name.trim() || !macrocycleId || !microcycleId}
        className="w-full"
      >
        {isPending ? "Salvataggio..." : "Salva Associazione"}
      </Button>
    </div>
  );
}
