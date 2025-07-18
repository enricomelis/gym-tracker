"use client";

import {
  deleteAthlete,
  changeAthleteCoach,
  getRoutinesForAthlete,
  getRoutines,
  connectRoutineToAthlete,
  disconnectRoutineFromAthlete,
} from "@/lib/actions/athletes";
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
import {
  type Routine,
  APPARATUS_TYPES,
  DB_TO_UI_EXERCISE_TYPE,
} from "@/lib/types";
import AthleteRoutineForm from "@/components/athlete-routine-form";

type Coach = {
  id: string;
  first_name: string;
  last_name: string;
};

type Athlete = {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  registration_number: number;
  category: string;
  current_coach_id: string;
};

type AthleteRoutineWithDetails = {
  id: string;
  athlete_id: string;
  routine_id: string;
  created_by: string;
  routine: Routine;
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
  const [showAddRoutine, setShowAddRoutine] = React.useState(false);
  const [availableRoutines, setAvailableRoutines] = React.useState<Routine[]>(
    [],
  );
  const [athleteRoutines, setAthleteRoutines] = React.useState<
    AthleteRoutineWithDetails[]
  >([]);

  const fetchAthleteRoutines = React.useCallback(async () => {
    const routines = await getRoutinesForAthlete(athlete.id);
    // Fetch routine details for each athlete routine
    const allRoutines = await getRoutines();
    const routinesMap = new Map(allRoutines.map((r) => [r.id, r]));

    const athleteRoutinesWithDetails = routines
      .map((ar) => ({
        ...ar,
        routine: routinesMap.get(ar.routine_id)!,
      }))
      .filter((ar) => ar.routine); // Filter out any routines that don't exist

    setAthleteRoutines(athleteRoutinesWithDetails);
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

  React.useEffect(() => {
    async function fetchAvailableRoutines() {
      const routines = await getRoutines();
      setAvailableRoutines(routines);
    }
    fetchAvailableRoutines();
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

  async function handleConnectRoutine(routineId: string) {
    const result = await connectRoutineToAthlete(athlete.id, routineId);
    if (result?.error) {
      toast({
        title: "Errore",
        description: `Impossibile collegare l&apos;esercizio: ${result.error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Esercizio collegato con successo.",
        duration: 1000,
      });
      await fetchAthleteRoutines();
    }
  }

  async function handleDisconnectRoutine(routineId: string) {
    const result = await disconnectRoutineFromAthlete(athlete.id, routineId);
    if (result?.error) {
      toast({
        title: "Errore",
        description: `Impossibile rimuovere l&apos;esercizio: ${result.error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Esercizio rimossa con successo.",
        duration: 1000,
      });
      await fetchAthleteRoutines();
    }
  }

  return (
    <div className="space-y-4">
      <p>
        <strong>Data di nascita:</strong>{" "}
        {athlete.birth_date
          ? formatDate(athlete.birth_date)
          : "Non specificata"}
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
              APPARATUS_TYPES.indexOf(a.routine.apparatus) -
              APPARATUS_TYPES.indexOf(b.routine.apparatus),
          )
          .map((athleteRoutine) => (
            <div key={athleteRoutine.id} className="rounded border px-3 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <strong>{athleteRoutine.routine.apparatus}: </strong>
                  {athleteRoutine.routine.name} | Volume:{" "}
                  {athleteRoutine.routine.volume} | Tipo:{" "}
                  {
                    DB_TO_UI_EXERCISE_TYPE[
                      athleteRoutine.routine
                        .type as keyof typeof DB_TO_UI_EXERCISE_TYPE
                    ]
                  }
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleDisconnectRoutine(athleteRoutine.routine_id)
                  }
                >
                  Rimuovi
                </Button>
              </div>
              {athleteRoutine.routine.notes && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Note: {athleteRoutine.routine.notes}
                </p>
              )}
            </div>
          ))}

        {athleteRoutines.length === 0 && (
          <p className="text-muted-foreground">Nessuna routine assegnata.</p>
        )}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full">Aggiungi Esercizio</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aggiungi Esercizio</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Seleziona un esercizio da assegnare a questo atleta:
            </p>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {availableRoutines
                .filter(
                  (routine) =>
                    !athleteRoutines.some((ar) => ar.routine_id === routine.id),
                )
                .map((routine) => (
                  <div
                    key={routine.id}
                    className="flex items-center justify-between rounded border p-2 hover:bg-muted"
                  >
                    <div>
                      <strong>{routine.apparatus}: </strong>
                      {routine.name} | Volume: {routine.volume} | Tipo:{" "}
                      {
                        DB_TO_UI_EXERCISE_TYPE[
                          routine.type as keyof typeof DB_TO_UI_EXERCISE_TYPE
                        ]
                      }
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleConnectRoutine(routine.id)}
                    >
                      Assegna
                    </Button>
                  </div>
                ))}
              {availableRoutines.filter(
                (routine) =>
                  !athleteRoutines.some((ar) => ar.routine_id === routine.id),
              ).length === 0 && (
                <p className="py-4 text-center text-muted-foreground">
                  Non ci sono esercizi disponibili.
                </p>
              )}
            </div>
            <div className="border-t pt-4">
              <p className="mb-2 text-sm text-muted-foreground">
                Non trovi l&apos;esercizio che cerchi?
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowAddRoutine(true);
                }}
              >
                Crea Nuovo Esercizio
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showAddRoutine} onOpenChange={setShowAddRoutine}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Crea Nuovo Esercizio</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4">
            <AthleteRoutineForm
              athlete_id={athlete.id}
              onSuccess={async () => {
                setShowAddRoutine(false);
                await fetchAthleteRoutines();
              }}
            />
          </div>
        </AlertDialogContent>
      </AlertDialog>

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
