"use client";
import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  initApparatusSession,
  updateApparatusSession,
  addTrainingSet,
  deleteTrainingSet,
} from "@/lib/actions/apparatus";
import TrainingSetForm from "@/components/training-set-form";
import React from "react";
import { getWeeklyGoalForApparatus } from "@/lib/actions/weekly-planning";
import type { ApparatusSession, TrainingSet } from "@/lib/types";

export default function ApparatusCard({
  apparatus,
  session: initialSession,
  sets: initialSets,
  trainingSessionId,
  athleteId,
  weekNumber,
  year,
}: {
  apparatus: string;
  session: ApparatusSession | null;
  sets: TrainingSet[];
  trainingSessionId: string;
  athleteId: string;
  weekNumber: number;
  year: number;
}) {
  const [session, setSession] = useState<ApparatusSession | null>(
    initialSession,
  );
  const [sets, setSets] = useState<TrainingSet[]>(initialSets);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSetForm, setShowSetForm] = useState(false);
  const [editingSet, setEditingSet] = useState<TrainingSet | null>(null);

  // Editable session values
  const [baseVolume, setBaseVolume] = useState<string>(
    session ? String(session.base_volume ?? "") : "",
  );
  const [totalTime, setTotalTime] = useState<string>(
    session ? String(session.total_time ?? "") : "",
  );
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Fetch della programmazione settimanale per l'attrezzo
  const [hasWeeklyProgramming, setHasWeeklyProgramming] = useState<
    boolean | null
  >(null);
  useEffect(() => {
    async function fetchGoal() {
      const goal = await getWeeklyGoalForApparatus(
        athleteId,
        apparatus,
        weekNumber,
        year,
      );
      setHasWeeklyProgramming(!!goal);
    }
    fetchGoal();
  }, [athleteId, apparatus, weekNumber, year]);

  // Exit edit mode on Escape key and revert unsaved changes
  useEffect(() => {
    if (!editMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Revert to original session values
        setBaseVolume(session ? String(session.base_volume ?? "") : "");
        setTotalTime(session ? String(session.total_time ?? "") : "");
        setEditMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editMode, session]);

  // In editMode calcola la densità live come (baseVolume + somma volume salite) / totalTime, altrimenti mostra quella da db
  const totalSetVolume = sets.reduce(
    (sum, s) => sum + (Number(s.volume_done) || 0),
    0,
  );
  const baseVolumeNum = Number(baseVolume) || 0;
  const totalTimeNum = Number(totalTime) || 0;
  const density = editMode
    ? totalTimeNum > 0
      ? (baseVolumeNum + totalSetVolume) / totalTimeNum
      : 0
    : (session?.density ?? 0);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  async function handleInitSession(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await initApparatusSession(formData);
      if (res && res.session) {
        setSession(res.session);
        setBaseVolume(
          res.session.base_volume !== null
            ? String(res.session.base_volume)
            : "",
        );
        setTotalTime(
          res.session.total_time !== null ? String(res.session.total_time) : "",
        );
        setSets([]);
      } else if (res && res.error) {
        setError(res.error);
      } else {
        setError("Errore sconosciuto nella creazione della sessione.");
      }
    });
  }

  async function updateCalculatedSessionFields(
    newSets = sets,
    newBaseVolume = baseVolume,
    newTotalTime = totalTime,
  ) {
    const intensity_sets_count = newSets.length;
    const totalSetVolume = newSets.reduce(
      (sum, s) => sum + (Number(s.volume_done) || 0),
      0,
    );
    const newBaseVolumeNum = Number(newBaseVolume) || 0;
    const newTotalTimeNum = Number(newTotalTime) || 0;
    const total_volume = newBaseVolumeNum + totalSetVolume;
    const intensities = newSets.map((s) => Number(s.intensity) || 0);
    const average_intensity =
      intensities.length > 0
        ? intensities.reduce((a, b) => a + b, 0) / intensities.length
        : 0;
    const max_intensity = intensities.length > 0 ? Math.max(...intensities) : 0;
    const density = newTotalTimeNum > 0 ? total_volume / newTotalTimeNum : 0;
    if (!session) return;
    const res = await updateApparatusSession({
      id: session.id,
      base_volume: newBaseVolumeNum,
      total_time: newTotalTimeNum,
      density,
      intensity_sets_count,
      total_volume,
      average_intensity,
      max_intensity,
    });
    if (res && res.session) setSession(res.session);
  }

  async function handleSaveSession() {
    if (!session) return;
    // Se non ci sono cambiamenti, non inviare update
    if (
      Number(baseVolume) === session.base_volume &&
      Number(totalTime) === session.total_time
    ) {
      setEditMode(false);
      return;
    }
    setIsSavingSession(true);
    await updateCalculatedSessionFields(sets, baseVolume, totalTime);
    setEditMode(false);
    setIsSavingSession(false);
  }

  async function handleAddSet(data: TrainingSet) {
    if (!session) return;
    const res = await addTrainingSet({
      ...data,
      apparatus_session_id: String(session.id),
    });
    if (res && res.set) {
      setSets((prev) => {
        const newSets = [...prev, res.set];
        // We can't call startTransition while rendering/updating, so return first
        // The transition will run right after state is queued.
        queueMicrotask(() => {
          startTransition(() => {
            updateCalculatedSessionFields(newSets);
          });
        });
        return newSets;
      });
    }
    setShowSetForm(false);
  }

  async function handleDeleteSet() {
    if (!editingSet || !editingSet.id) return;
    const res = await deleteTrainingSet(editingSet.id);
    if (res && res.success) {
      setSets((prev) => {
        const newSets = prev.filter((s) => s.id !== editingSet.id);
        queueMicrotask(() => {
          startTransition(() => {
            updateCalculatedSessionFields(newSets);
          });
        });
        return newSets;
      });
      setEditingSet(null);
      setShowSetForm(false);
    } else {
      setError(res?.error || "Errore nella cancellazione della salita.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{apparatus}</CardTitle>
      </CardHeader>
      <CardContent>
        {!session && hasWeeklyProgramming !== null ? (
          <>
            {!hasWeeklyProgramming ? (
              <Card className="mx-auto mb-4 w-full max-w-sm break-words border-2 border-yellow-400 bg-yellow-50 p-3">
                <div className="flex w-full flex-col items-center gap-2">
                  <AlertTriangle className="mb-2 h-5 w-5 text-yellow-500" />
                  <div className="w-full text-center">
                    <div className="mb-1 break-words text-base font-semibold text-yellow-900">
                      Nessuna programmazione settimanale trovata per questo
                      attrezzo
                    </div>
                    <div className="mb-2 break-words text-sm text-yellow-800">
                      Per inserire allenamenti su questo attrezzo, crea prima
                      una programmazione settimanale o giornaliera.
                    </div>
                    <div className="flex w-full flex-col items-center gap-2">
                      <Button
                        asChild
                        variant="secondary"
                        className="mx-auto block w-full max-w-xs"
                      >
                        <a
                          href="/settimanale"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-words"
                        >
                          Vai alla programmazione settimanale
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="secondary"
                        className="mx-auto block w-full max-w-xs"
                      >
                        <a
                          href="/giornaliera"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-words"
                        >
                          Vai alla programmazione giornaliera
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="mb-2 text-xs text-muted-foreground">
                Nessuna sessione per questo attrezzo
              </div>
            )}
            {error && <div className="mb-2 text-xs text-red-600">{error}</div>}
            {hasWeeklyProgramming && (
              <form action={handleInitSession}>
                <input
                  type="hidden"
                  name="trainingSessionId"
                  value={trainingSessionId}
                />
                <input type="hidden" name="athleteId" value={athleteId} />
                <input type="hidden" name="apparatus" value={apparatus} />
                <Button
                  size="sm"
                  className="w-full py-1 text-xs"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Inizializzo..." : "Inizializza sessione"}
                </Button>
              </form>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">Volume base:</span>
                  {editMode ? (
                    <Input
                      type="number"
                      className="w-24 border-b-2 border-primary text-lg focus:border-primary focus:outline-none"
                      value={baseVolume}
                      min={0}
                      onChange={(e) => setBaseVolume(e.target.value)}
                      disabled={isSavingSession}
                      onFocus={handleFocus}
                    />
                  ) : (
                    <span
                      className="select-text text-base"
                      onFocus={handleFocus}
                    >
                      {baseVolume === "" ? "-" : baseVolume}
                      {" UdE"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">Tempo totale:</span>
                  {editMode ? (
                    <Input
                      type="number"
                      className="w-24 border-b-2 border-primary text-lg focus:border-primary focus:outline-none"
                      value={totalTime}
                      min={1}
                      onChange={(e) => setTotalTime(e.target.value)}
                      disabled={isSavingSession}
                      onFocus={handleFocus}
                    />
                  ) : (
                    <span
                      className="select-text text-base"
                      onFocus={handleFocus}
                    >
                      {totalTime === "" ? "-" : totalTime}
                      {" min"}
                    </span>
                  )}
                  <span className="ml-4 text-sm text-muted-foreground">
                    Densità: {density > 0 ? density.toFixed(2) : "-"}
                  </span>
                </div>
              </div>
              <div className="flex h-full flex-col items-end justify-center">
                {editMode ? (
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={handleSaveSession}
                    disabled={isSavingSession}
                  >
                    {isSavingSession ? "Salvataggio..." : "Salva sessione"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="mt-2"
                    variant="outline"
                    onClick={() => setEditMode(true)}
                  >
                    Modifica sessione
                  </Button>
                )}
              </div>
            </div>
            <div className="mb-2">
              <div className="mb-1 text-sm font-semibold">Salite svolte:</div>
              {sets.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  Nessuna salita inserita
                </div>
              ) : (
                <ul className="space-y-1">
                  {sets.map((set: TrainingSet) => (
                    <li
                      key={set.id}
                      className="flex cursor-pointer items-center justify-between rounded bg-muted px-2 py-1 hover:bg-accent"
                      onClick={() => setEditingSet(set)}
                    >
                      <span>
                        #{set.set_number} | Vol: {set.volume_done}; Esec:{" "}
                        {set.execution_coefficient}; Int: {set.intensity}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={() => setShowSetForm(true)}
            >
              Aggiungi salita
            </Button>
            <TrainingSetForm
              open={showSetForm || !!editingSet}
              onClose={() => {
                setShowSetForm(false);
                setEditingSet(null);
              }}
              onSubmit={
                editingSet
                  ? () => {}
                  : (data) => {
                      void handleAddSet(data);
                    }
              }
              nextSetNumber={sets.length + 1}
              initialData={editingSet ?? undefined}
              onDelete={editingSet ? handleDeleteSet : undefined}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
