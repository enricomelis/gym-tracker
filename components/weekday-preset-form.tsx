"use client";

import { useState, useTransition } from "react";
import { createWeekdayPreset } from "@/lib/actions/presets";
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

const WEEKDAYS = [
  { value: 0, label: "Generico" },
  { value: 1, label: "Lunedì" },
  { value: 2, label: "Martedì" },
  { value: 3, label: "Mercoledì" },
  { value: 4, label: "Giovedì" },
  { value: 5, label: "Venerdì" },
  { value: 6, label: "Sabato" },
  { value: 7, label: "Domenica" },
];

export default function WeekdayPresetForm({
  onSave,
}: {
  onSave?: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [weekdayNumber, setWeekdayNumber] = useState<number | null>(null);

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    if (weekdayNumber === null) {
      toast({
        title: "Giorno della settimana obbligatorio",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createWeekdayPreset([
        {
          name: name.trim(),
          weekday_number: weekdayNumber,
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
          description: "Preset giorno salvato.",
          duration: 1500,
        });
        setName("");
        setWeekdayNumber(null);
        if (onSave) await onSave();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Preset Giorno</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          placeholder="Inserisci nome preset"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Giorno della Settimana</label>
        <Select
          value={weekdayNumber?.toString() || ""}
          onValueChange={(value) => setWeekdayNumber(parseInt(value))}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona giorno" />
          </SelectTrigger>
          <SelectContent>
            {WEEKDAYS.map((day) => (
              <SelectItem key={day.value} value={day.value.toString()}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending || !name.trim() || weekdayNumber === null}
        className="w-full"
      >
        {isPending ? "Salvataggio..." : "Salva Preset Giorno"}
      </Button>
    </div>
  );
}
