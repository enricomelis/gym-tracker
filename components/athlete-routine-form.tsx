"use client";

import { addAthleteRoutine } from "@/lib/actions/athletes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import { type Apparatus, APPARATUS_TYPES } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AthleteRoutineFormProps = {
  athlete_id: string;
  routine_name?: string;
  routine_volume?: number;
  routine_notes?: string;
  apparatus?: Apparatus | "";
  onSuccess?: () => void;
};

export default function AthleteRoutineForm({
  athlete_id,
  routine_name = "",
  routine_volume = 0,
  routine_notes = "",
  apparatus = "",
  onSuccess,
}: AthleteRoutineFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState(routine_name);
  const [volume, setVolume] = useState<number | "">(routine_volume);
  const [notes, setNotes] = useState(routine_notes);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApparatus, setSelectedApparatus] = useState<Apparatus | "">(
    apparatus,
  );
  const [submitted, setSubmitted] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    const result = await addAthleteRoutine(
      athlete_id,
      name,
      typeof volume === "string" ? parseInt(volume) || 0 : volume,
      notes,
      selectedApparatus as Apparatus,
    );
    setIsPending(false);
    if (result && "error" in result) {
      setError(result.error || null);
      toast({
        title: "Errore",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Esercizio aggiunto con successo.",
        duration: 1000,
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <>
      {!submitted && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="athlete_id" value={athlete_id} />
          <div className="space-y-2">
            <Label htmlFor="apparatus">Attrezzo</Label>
            <Select
              value={selectedApparatus}
              onValueChange={(val) => setSelectedApparatus(val as Apparatus)}
              required
            >
              <SelectTrigger id="apparatus">
                <SelectValue placeholder="Seleziona attrezzo" />
              </SelectTrigger>
              <SelectContent>
                {APPARATUS_TYPES.map((app) => (
                  <SelectItem key={app} value={app}>
                    {app}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="routine_name">Nome esercizio</Label>
            <Input
              id="routine_name"
              name="routine_name"
              placeholder="Nome esercizio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={handleFocus}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routine_volume">Volume</Label>
            <Input
              id="routine_volume"
              name="routine_volume"
              type="number"
              min={1}
              value={volume}
              onChange={(e) => {
                const val = e.target.value;
                setVolume(val === "" ? "" : parseInt(val) || 0);
              }}
              onFocus={handleFocus}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routine_notes">Note</Label>
            <Input
              id="routine_notes"
              name="routine_notes"
              placeholder="Note (opzionale)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Aggiunta..." : "Aggiungi Esercizio"}
          </Button>
        </form>
      )}
    </>
  );
}
