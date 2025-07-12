"use client";

import { deleteAthlete, changeAthleteCoach } from "@/lib/actions/athletes";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getBrowserClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import AthleteRoutineForm from "@/components/athlete-routine-form";
import { type AthleteRoutine, APPARATUS_TYPES } from "@/lib/types";

type Coach = {
  id: string;
  first_name: string;
  last_name: string;
};

type Athlete = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  registration_number: number;
  category: string;
  current_coach_id: string;
};

export default function AthleteDetails({ athlete }: { athlete: Athlete }) {
  const { toast } = useToast();
  const [coaches, setCoaches] = React.useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isUpdatingCoach, setIsUpdatingCoach] = React.useState(false);
  const [pendingCoachId, setPendingCoachId] = React.useState<string | null>(
    null,
  );
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showSelector, setShowSelector] = React.useState(false);
  const [showAddExercise, setShowAddExercise] = React.useState(false);
  const [editingRoutine, setEditingRoutine] =
    React.useState<AthleteRoutine | null>(null);

  const [athleteRoutines, setAthleteRoutines] = React.useState<
    AthleteRoutine[]
  >([]);

  const fetchAthleteRoutines = React.useCallback(async () => {
    const supabase = getBrowserClient();
    const { data, error } = await supabase
      .from("athlete_routines")
      .select("*")
      .eq("athlete_id", athlete.id);
    if (!error && data) {
      setAthleteRoutines(data);
    }
  }, [athlete.id]);

  React.useEffect(() => {
    fetchAthleteRoutines();
  }, [fetchAthleteRoutines]);

  React.useEffect(() => {
    async function fetchCoaches() {
      const supabase = getBrowserClient();
      const { data, error } = await supabase
        .from("coaches")
        .select("id, first_name, last_name");
      if (!error && data) {
        const mapped = data.map((c: Coach) => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
        }));
        setCoaches(mapped);
      }
    }
    fetchCoaches();
  }, []);

  async function handleDeactivate() {
    const result = await deleteAthlete(athlete.id);
    if (result?.error) {
      toast({
        title: "Errore",
        description: `C'è stato un errore nella disattivazione dell'atleta: ${result.error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Atleta disattivato con successo.",
        duration: 1000,
      });
    }
  }

  function handleCoachSelect(newCoachId: string) {
    if (newCoachId === athlete.current_coach_id) return;
    setPendingCoachId(newCoachId);
    setShowConfirm(true);
  }

  async function confirmCoachChange() {
    if (!pendingCoachId) return;
    setIsUpdatingCoach(true);
    const res = await changeAthleteCoach(athlete.id, pendingCoachId);
    setIsUpdatingCoach(false);
    setShowConfirm(false);
    setPendingCoachId(null);
    if (res?.error) {
      toast({
        title: "Errore",
        description: `Impossibile cambiare tecnico: ${res.error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Tecnico aggiornato.",
        duration: 1000,
      });
    }
  }

  return (
    <div className="space-y-4">
      <p>
        <strong>Data di nascita:</strong> {formatDate(athlete.date_of_birth)}
      </p>
      <p>
        <strong>Tessera:</strong> {athlete.registration_number}
      </p>
      <p>
        <strong>Categoria:</strong> {athlete.category}
      </p>

      <h2 className="text-lg font-semibold">Esercizi</h2>
      <div className="space-y-2">
        {athleteRoutines
          .slice()
          .sort(
            (a, b) =>
              APPARATUS_TYPES.indexOf(a.apparatus) -
              APPARATUS_TYPES.indexOf(b.apparatus),
          )
          .map((routine) => (
            <button
              key={routine.id}
              type="button"
              className="w-full rounded border px-2 py-1 text-left hover:bg-muted focus:bg-muted focus:outline-none"
              onClick={() => {
                setEditingRoutine(routine);
                setShowAddExercise(true);
              }}
            >
              <strong>{routine.apparatus}: </strong>
              {routine.routine_name} | {routine.routine_volume} |{" "}
              {routine.routine_notes
                ? `(${routine.routine_notes})`
                : "Nessuna nota"}
            </button>
          ))}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            Disattiva Atleta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L&apos;atleta verrà
              disattivato e non sarà più visibile fino a riattivazione.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate}>
              Disattiva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!showSelector ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowSelector(true)}
        >
          Cambia Tecnico
        </Button>
      ) : (
        <div className="space-y-2">
          <span className="text-sm font-semibold">Seleziona nuovo tecnico</span>
          <Select
            onValueChange={handleCoachSelect}
            defaultValue={athlete.current_coach_id}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona Tecnico" />
            </SelectTrigger>
            <SelectContent>
              {coaches.map((c) => (
                <SelectItem
                  key={c.id}
                  value={c.id}
                  disabled={c.id === athlete.current_coach_id}
                >
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isUpdatingCoach && <p className="text-xs">Aggiornamento...</p>}
          <Button
            variant="ghost"
            size="sm"
            className="mt-1"
            onClick={() => setShowSelector(false)}
          >
            Annulla
          </Button>
        </div>
      )}

      <AlertDialog
        open={showAddExercise}
        onOpenChange={(open) => {
          setShowAddExercise(open);
          if (!open) setEditingRoutine(null);
        }}
      >
        <AlertDialogTrigger asChild>
          <Button className="w-full">Aggiungi Esercizio</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingRoutine ? "Modifica Esercizio" : "Aggiungi Esercizio"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AthleteRoutineForm
            athlete_id={athlete.id}
            id={editingRoutine?.id}
            routine_name={editingRoutine?.routine_name ?? ""}
            routine_volume={editingRoutine?.routine_volume ?? 0}
            routine_notes={editingRoutine?.routine_notes ?? ""}
            apparatus={editingRoutine?.apparatus ?? ""}
            onSuccess={async () => {
              setShowAddExercise(false);
              setEditingRoutine(null);
              await fetchAthleteRoutines();
            }}
          />
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma cambio tecnico</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler assegnare questo atleta a un nuovo tecnico?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCoachChange}
              disabled={isUpdatingCoach}
            >
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
