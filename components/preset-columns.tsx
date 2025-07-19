"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type {
  NewApparatusPreset,
  NewMicrocyclePreset,
  NewTrainingSessionPreset,
  NewWeekdayPreset,
  NewWeekdaysSessionsPreset,
  NewMicrocyclesWeekdaysPreset,
  NewMacrocyclePreset,
  NewMacrocyclesMicrocyclesPreset,
} from "@/lib/types";
import ApparatusPresetForm from "@/components/apparatus-preset-form";
import SessionPresetForm from "@/components/session-preset-form";
import WeekdayPresetForm from "@/components/weekday-preset-form";
import WeekdaysSessionsPresetForm from "@/components/weekdays-sessions-preset-form";
import MicrocyclePresetForm from "@/components/microcycle-preset-form";
import MicrocyclesWeekdaysPresetForm from "@/components/microcycles-weekdays-preset-form";
import MacrocyclePresetForm from "@/components/macrocycle-preset-form";
import MacrocyclesMicrocyclesPresetForm from "@/components/macrocycles-microcycles-preset-form";

interface PresetColumnsProps {
  apparatusPresets: NewApparatusPreset[];
  sessionPresets: NewTrainingSessionPreset[];
  weekdayPresets: NewWeekdayPreset[];
  weekdaysSessionsPresets: NewWeekdaysSessionsPreset[];
  microcyclePresets: NewMicrocyclePreset[];
  microcyclesWeekdaysPresets: NewMicrocyclesWeekdaysPreset[];
  macrocyclePresets: NewMacrocyclePreset[];
  macrocyclesMicrocyclesPresets: NewMacrocyclesMicrocyclesPreset[];
}

type PresetType =
  | "apparatus"
  | "session"
  | "weekday"
  | "weekdaysessions"
  | "microcycle"
  | "microcyclesweekdays"
  | "macrocycle"
  | "macrocyclesmicrocycles";

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

export default function PresetColumns({
  apparatusPresets,
  sessionPresets,
  weekdayPresets,
  weekdaysSessionsPresets,
  microcyclePresets,
  microcyclesWeekdaysPresets,
  macrocyclePresets,
  macrocyclesMicrocyclesPresets,
}: PresetColumnsProps) {
  const [activeForm, setActiveForm] = useState<PresetType | null>(null);

  const handleFormSave = () => {
    setActiveForm(null);
    // Force a page refresh to get updated data
    window.location.reload();
  };

  const formatApparatusName = (apparatus: string) => {
    const names: Record<string, string> = {
      FX: "Corpo Libero",
      PH: "Cavallo",
      SR: "Anelli",
      VT: "Volteggio",
      PB: "Parallele",
      HB: "Sbarra",
    };
    return names[apparatus] || apparatus;
  };

  const formatExecutionGrade = (grade: string) => {
    return grade;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {/* Apparatus Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Attrezzi</CardTitle>
          <CardDescription>
            Configurazioni per singoli attrezzi con quantità ed esecuzione
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(activeForm === "apparatus" ? null : "apparatus")
            }
            variant={activeForm === "apparatus" ? "secondary" : "outline"}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Preset Attrezzo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "apparatus" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <ApparatusPresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {apparatusPresets.map((preset) => (
              <div key={preset.id} className="rounded-lg border bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">{preset.name}</h4>
                  <Badge variant="outline">
                    {formatApparatusName(preset.apparatus)}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>Quantità: {preset.quantity}</div>
                  <div>
                    Esecuzione: {formatExecutionGrade(preset.execution_grade)}
                  </div>
                </div>
              </div>
            ))}
            {apparatusPresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessun preset attrezzo salvato
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Allenamenti</CardTitle>
          <CardDescription>
            Configurazioni complete di allenamento con tutti gli attrezzi
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(activeForm === "session" ? null : "session")
            }
            variant={activeForm === "session" ? "secondary" : "outline"}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Preset Allenamento
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "session" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <SessionPresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
                availableApparatusPresets={apparatusPresets}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {sessionPresets.map((preset) => (
              <div key={preset.id} className="rounded-lg border bg-card p-3">
                <h4 className="mb-2 text-sm font-medium">{preset.name}</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {[
                    { key: "fx_preset_id", label: "FX" },
                    { key: "ph_preset_id", label: "PH" },
                    { key: "sr_preset_id", label: "SR" },
                    { key: "vt_preset_id", label: "VT" },
                    { key: "pb_preset_id", label: "PB" },
                    { key: "hb_preset_id", label: "HB" },
                  ]
                    .map(({ key, label }) => {
                      const presetId = preset[key as keyof typeof preset] as
                        | string
                        | null;
                      if (!presetId) return null;
                      const apparatusPreset = apparatusPresets.find(
                        (ap) => ap.id === presetId,
                      );
                      return (
                        <div key={key}>
                          {label}: {apparatusPreset?.name || "N/A"}
                        </div>
                      );
                    })
                    .filter(Boolean)}
                </div>
              </div>
            ))}
            {sessionPresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessun preset allenamento salvato
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekday Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Giorni</CardTitle>
          <CardDescription>
            Configurazioni per i giorni della settimana
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(activeForm === "weekday" ? null : "weekday")
            }
            variant={activeForm === "weekday" ? "secondary" : "outline"}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Preset Giorno
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "weekday" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <WeekdayPresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {weekdayPresets.map((preset) => (
              <div key={preset.id} className="rounded-lg border bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">{preset.name}</h4>
                  <Badge variant="outline">
                    {WEEKDAYS[preset.weekday_number]}
                  </Badge>
                </div>
              </div>
            ))}
            {weekdayPresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessun preset giorno salvato
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekdays Sessions Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Giorni-Allenamenti</CardTitle>
          <CardDescription>
            Associazioni tra giorni e allenamenti con numero sessioni
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(
                activeForm === "weekdaysessions" ? null : "weekdaysessions",
              )
            }
            variant={activeForm === "weekdaysessions" ? "secondary" : "outline"}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Associazione
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "weekdaysessions" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <WeekdaysSessionsPresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
                availableWeekdays={weekdayPresets}
                availableSessions={sessionPresets}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {weekdaysSessionsPresets.map((preset) => (
              <div key={preset.id} className="rounded-lg border bg-card p-3">
                <h4 className="mb-2 text-sm font-medium">{preset.name}</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    Giorno:{" "}
                    {weekdayPresets.find((w) => w.id === preset.weekday_id)
                      ?.name || "N/A"}
                  </div>
                  <div>
                    Allenamento:{" "}
                    {sessionPresets.find((s) => s.id === preset.session_id)
                      ?.name || "N/A"}
                  </div>
                  <div>Sessione N°: {preset.session_number}</div>
                </div>
              </div>
            ))}
            {weekdaysSessionsPresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessuna associazione salvata
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Microcycle Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Microcicli</CardTitle>
          <CardDescription>
            Configurazioni per i microcicli di allenamento
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(activeForm === "microcycle" ? null : "microcycle")
            }
            variant={activeForm === "microcycle" ? "secondary" : "outline"}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Preset Microciclo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "microcycle" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <MicrocyclePresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {microcyclePresets.map((preset) => (
              <div key={preset.id} className="rounded-lg border bg-card p-3">
                <h4 className="text-sm font-medium">{preset.name}</h4>
              </div>
            ))}
            {microcyclePresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessun preset microciclo salvato
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Microcycles Weekdays Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Microcicli-Giorni</CardTitle>
          <CardDescription>
            Associazioni tra microcicli e giorni con numero giorno
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(
                activeForm === "microcyclesweekdays"
                  ? null
                  : "microcyclesweekdays",
              )
            }
            variant={
              activeForm === "microcyclesweekdays" ? "secondary" : "outline"
            }
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Associazione
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "microcyclesweekdays" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <MicrocyclesWeekdaysPresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
                availableMicrocycles={microcyclePresets}
                availableWeekdays={weekdayPresets}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {microcyclesWeekdaysPresets.map((preset) => (
              <div key={preset.id} className="rounded-lg border bg-card p-3">
                <h4 className="mb-2 text-sm font-medium">{preset.name}</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    Microciclo:{" "}
                    {microcyclePresets.find(
                      (m) => m.id === preset.microcycle_id,
                    )?.name || "N/A"}
                  </div>
                  <div>
                    Giorno:{" "}
                    {weekdayPresets.find((w) => w.id === preset.weekday_id)
                      ?.name || "N/A"}
                  </div>
                  <div>Giorno N°: {preset.day_number}</div>
                </div>
              </div>
            ))}
            {microcyclesWeekdaysPresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessuna associazione salvata
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Macrocycle Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Macrocicli</CardTitle>
          <CardDescription>
            Configurazioni per i macrocicli di allenamento con durata
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(activeForm === "macrocycle" ? null : "macrocycle")
            }
            variant={activeForm === "macrocycle" ? "secondary" : "outline"}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Preset Macrociclo
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "macrocycle" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <MacrocyclePresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {macrocyclePresets.map((preset) => (
              <div key={preset.id} className="rounded-lg border bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-medium">{preset.name}</h4>
                  <Badge variant="outline">
                    {preset.length_in_weeks} sett.
                  </Badge>
                </div>
              </div>
            ))}
            {macrocyclePresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessun preset macrociclo salvato
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Macrocycles Microcycles Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Macrocicli-Microcicli</CardTitle>
          <CardDescription>
            Associazioni tra macrocicli e microcicli con numero settimana
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(
                activeForm === "macrocyclesmicrocycles"
                  ? null
                  : "macrocyclesmicrocycles",
              )
            }
            variant={
              activeForm === "macrocyclesmicrocycles" ? "secondary" : "outline"
            }
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Associazione
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "macrocyclesmicrocycles" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <MacrocyclesMicrocyclesPresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
                availableMacrocycles={macrocyclePresets}
                availableMicrocycles={microcyclePresets}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {macrocyclesMicrocyclesPresets.map((preset) => (
              <div key={preset.id} className="rounded-lg border bg-card p-3">
                <h4 className="mb-2 text-sm font-medium">{preset.name}</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    Macrociclo:{" "}
                    {macrocyclePresets.find(
                      (m) => m.id === preset.macrocycle_id,
                    )?.name || "N/A"}
                  </div>
                  <div>
                    Microciclo:{" "}
                    {microcyclePresets.find(
                      (m) => m.id === preset.microcycle_id,
                    )?.name || "N/A"}
                  </div>
                  <div>Settimana N°: {preset.week_number}</div>
                </div>
              </div>
            ))}
            {macrocyclesMicrocyclesPresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessuna associazione salvata
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
