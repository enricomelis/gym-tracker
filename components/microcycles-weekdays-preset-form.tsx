"use client";

import { useState, useTransition, useEffect } from "react";
import { createMicrocyclesWeekdaysPreset } from "@/lib/actions/presets";
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
import type { NewMicrocyclePreset, NewWeekdayPreset } from "@/lib/types";

interface MicrocyclesWeekdaysPresetFormProps {
  onSave?: () => Promise<void> | void;
  availableMicrocycles: NewMicrocyclePreset[];
  availableWeekdays: NewWeekdayPreset[];
  onCancel?: () => void;
}

const WEEKDAYS = [
  "Generico",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

export default function MicrocyclesWeekdaysPresetForm({
  onSave,
  availableMicrocycles,
  availableWeekdays,
  onCancel,
}: MicrocyclesWeekdaysPresetFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [microcycleId, setMicrocycleId] = useState("");
  const [weekdayId, setWeekdayId] = useState("");
  const [dayNumber, setDayNumber] = useState(1);

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

    if (!microcycleId) {
      toast({ title: "Microciclo obbligatorio", variant: "destructive" });
      return;
    }

    if (!weekdayId) {
      toast({ title: "Giorno obbligatorio", variant: "destructive" });
      return;
    }

    if (dayNumber < 1) {
      toast({
        title: "Numero giorno deve essere almeno 1",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createMicrocyclesWeekdaysPreset([
        {
          name: name.trim(),
          microcycle_id: microcycleId,
          weekday_id: weekdayId,
          day_number: dayNumber,
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
          description: "Associazione microciclo-giorni salvata.",
          duration: 1500,
        });
        setName("");
        setMicrocycleId("");
        setWeekdayId("");
        setDayNumber(1);
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
        <label className="text-sm font-medium">Preset Giorno</label>
        <Select
          value={weekdayId}
          onValueChange={setWeekdayId}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona preset giorno" />
          </SelectTrigger>
          <SelectContent>
            {availableWeekdays.map((weekday) => (
              <SelectItem key={weekday.id} value={weekday.id}>
                {weekday.name} ({WEEKDAYS[weekday.weekday_number]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Numero Giorno</label>
        <Input
          type="number"
          min="1"
          value={dayNumber}
          onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Numero giorno"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending || !name.trim() || !microcycleId || !weekdayId}
        className="w-full"
      >
        {isPending ? "Salvataggio..." : "Salva Associazione"}
      </Button>
    </div>
  );
}
