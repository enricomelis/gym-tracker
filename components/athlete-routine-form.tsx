"use client";

import { createRoutine, connectRoutineToAthlete } from "@/lib/actions/athletes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import React, { useState } from "react";
import {
  type Apparatus,
  APPARATUS_TYPES,
  ExerciseType,
  EXERCISE_TYPES_VAULT,
  EXERCISE_TYPES_NOT_VAULT,
  UI_TO_DB_EXERCISE_TYPE,
} from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBrowserClient } from "@/lib/supabase/client";

type AthleteRoutineFormProps = {
  athlete_id: string;
  routine_name?: string;
  routine_volume?: number;
  routine_notes?: string;
  routine_type?: ExerciseType;
  apparatus?: Apparatus | "";
  onSuccess?: () => void;
};

export default function AthleteRoutineForm({
  athlete_id,
  routine_name = "",
  routine_volume = 0,
  routine_notes = "",
  routine_type = "I",
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
  const [selectedType, setSelectedType] = useState<ExerciseType | "">(
    routine_type,
  );

  // Determina i tipi validi in base all'apparato selezionato
  const typeOptions =
    selectedApparatus === "VT"
      ? EXERCISE_TYPES_VAULT
      : EXERCISE_TYPES_NOT_VAULT;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      // Get current user to get coach ID
      const supabase = getBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utente non autenticato");
      }

      // Get coach ID
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("supabase_id", user.id)
        .single();

      if (!coach) {
        throw new Error("Coach non trovato");
      }

      // Create the routine
      const routineResult = await createRoutine({
        name,
        volume: typeof volume === "string" ? parseInt(volume) || 0 : volume,
        notes: notes || undefined,
        apparatus: selectedApparatus as Apparatus,
        type: UI_TO_DB_EXERCISE_TYPE[selectedType as ExerciseType],
        created_by: coach.id,
      });

      if (routineResult.error) {
        throw new Error(routineResult.error);
      }

      if (!routineResult.routineId) {
        throw new Error("Errore nel recupero della routine creata");
      }

      // Connect the routine to the athlete
      const connectResult = await connectRoutineToAthlete(
        athlete_id,
        routineResult.routineId,
      );

      if (connectResult.error) {
        throw new Error(connectResult.error);
      }

      toast({
        title: "Successo",
        description: "Esercizio creato e assegnato con successo.",
        duration: 1000,
      });

      if (onSuccess) onSuccess();
      // Don't set submitted to true, let the parent handle modal closing
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Errore sconosciuto";
      setError(errorMessage);
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="athlete_id" value={athlete_id} />
      <div className="space-y-2">
        <Label htmlFor="apparatus">Attrezzo</Label>
        <Select
          value={selectedApparatus}
          onValueChange={(val) => {
            setSelectedApparatus(val as Apparatus);
            setSelectedType(val === "VT" ? "G" : "I");
          }}
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
        <Label htmlFor="routine_type">Tipo routine</Label>
        <Select
          value={selectedType}
          onValueChange={(val) => setSelectedType(val as ExerciseType)}
          required
          disabled={!selectedApparatus}
        >
          <SelectTrigger id="routine_type">
            <SelectValue placeholder="Seleziona tipo" />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
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
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creazione..." : "Crea e Assegna Esercizio"}
      </Button>
    </form>
  );
}
