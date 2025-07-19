"use client";

import { useState, useTransition } from "react";
import { createWeekdaysSessionsPreset } from "@/lib/actions/presets";
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
import type { NewWeekdayPreset, NewTrainingSessionPreset } from "@/lib/types";

interface WeekdaysSessionsPresetFormProps {
  onSave?: () => Promise<void> | void;
  availableWeekdays: NewWeekdayPreset[];
  availableSessions: NewTrainingSessionPreset[];
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

export default function WeekdaysSessionsPresetForm({
  onSave,
  availableWeekdays,
  availableSessions,
}: WeekdaysSessionsPresetFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [weekdayId, setWeekdayId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionNumber, setSessionNumber] = useState(1);

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    if (!weekdayId) {
      toast({ title: "Giorno obbligatorio", variant: "destructive" });
      return;
    }

    if (!sessionId) {
      toast({ title: "Allenamento obbligatorio", variant: "destructive" });
      return;
    }

    if (sessionNumber < 1) {
      toast({
        title: "Numero sessione deve essere almeno 1",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createWeekdaysSessionsPreset([
        {
          name: name.trim(),
          weekday_id: weekdayId,
          session_id: sessionId,
          session_number: sessionNumber,
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
          description: "Associazione giorni-allenamenti salvata.",
          duration: 1500,
        });
        setName("");
        setWeekdayId("");
        setSessionId("");
        setSessionNumber(1);
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
          disabled={isPending}
          placeholder="Inserisci nome associazione"
        />
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
        <label className="text-sm font-medium">Preset Allenamento</label>
        <Select
          value={sessionId}
          onValueChange={setSessionId}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona preset allenamento" />
          </SelectTrigger>
          <SelectContent>
            {availableSessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Numero Sessione</label>
        <Input
          type="number"
          min="1"
          value={sessionNumber}
          onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
          disabled={isPending}
          placeholder="Numero sessione"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending || !name.trim() || !weekdayId || !sessionId}
        className="w-full"
      >
        {isPending ? "Salvataggio..." : "Salva Associazione"}
      </Button>
    </div>
  );
}
