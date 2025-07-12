"use client";

import { addAthleteRoutine } from "@/lib/actions/athletes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";

export default function AthleteRoutineForm({
  athlete_id,
  routine_name = "",
  routine_volume = 0,
  routine_notes = "",
}: {
  athlete_id: string;
  routine_name?: string;
  routine_volume?: number;
  routine_notes?: string;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(routine_name);
  const [volume, setVolume] = useState<number | "">(routine_volume);
  const [notes, setNotes] = useState(routine_notes);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        duration: 1500,
      });
      setName("");
      setVolume(0);
      setNotes("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="athlete_id" value={athlete_id} />
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
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Aggiunta..." : "Aggiungi Esercizio"}
      </Button>
    </form>
  );
}
