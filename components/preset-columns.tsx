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
import { Plus } from "lucide-react";
import type {
  NewApparatusPreset,
  NewMicrocyclePreset,
  MicrocyclePresetWithDetails,
  NewTrainingSessionPreset,
  NewMicrocyclesSessionsPreset,
  NewMacrocyclePreset,
  NewMacrocyclesMicrocyclesPreset,
} from "@/lib/types";
import ApparatusPresetForm from "@/components/apparatus-preset-form";
import SessionPresetForm from "@/components/session-preset-form";
import MicrocyclePresetForm from "@/components/microcycle-preset-form";
import MacrocyclePresetForm from "@/components/macrocycle-preset-form";
import MacrocyclesMicrocyclesPresetForm from "@/components/macrocycles-microcycles-preset-form";
import PresetCard from "@/components/preset-card";
import ApparatusPresetEditForm from "@/components/apparatus-preset-edit-form";
import SessionPresetEditForm from "@/components/session-preset-edit-form";
import MicrocyclePresetEditForm from "@/components/microcycle-preset-edit-form";
import MacrocyclePresetEditForm from "@/components/macrocycle-preset-edit-form";
import {
  deleteApparatusPreset,
  deleteSessionPreset,
  deleteMicrocyclePreset,
  deleteMicrocyclesSessionsPreset,
  deleteMacrocyclePreset,
  deleteMacrocyclesMicrocyclesPreset,
} from "@/lib/actions/presets";

interface PresetColumnsProps {
  apparatusPresets: NewApparatusPreset[];
  sessionPresets: NewTrainingSessionPreset[];
  microcyclePresets: MicrocyclePresetWithDetails[];
  microcyclesSessionsPresets: NewMicrocyclesSessionsPreset[];
  macrocyclePresets: NewMacrocyclePreset[];
  macrocyclesMicrocyclesPresets: NewMacrocyclesMicrocyclesPreset[];
}

type PresetType =
  | "apparatus"
  | "session"
  | "microcycle"
  | "microcyclessessions"
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
  microcyclePresets,
  microcyclesSessionsPresets,
  macrocyclePresets,
  macrocyclesMicrocyclesPresets,
}: PresetColumnsProps) {
  const [activeForm, setActiveForm] = useState<PresetType | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const handleFormSave = () => {
    setActiveForm(null);
    // Force a page refresh to get updated data
    window.location.reload();
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const formatApparatusName = (apparatus: string) => {
    const names: Record<string, string> = {
      FX: "Corpo Libero",
      PH: "Cavallo",
      SR: "Anelli",
      VT: "Volteggio",
      PB: "Parallele",
      HB: "Sbarra",
      All: "Tutti",
    };
    return names[apparatus] || apparatus;
  };

  const formatExecutionGrade = (grade: string) => {
    return grade;
  };

  const getApparatusCount = (session: NewTrainingSessionPreset) => {
    const apparatuses = [
      session.fx_preset_id,
      session.ph_preset_id,
      session.sr_preset_id,
      session.vt_preset_id,
      session.pb_preset_id,
      session.hb_preset_id,
    ];
    return apparatuses.filter(Boolean).length;
  };

  const getApparatusList = (session: NewTrainingSessionPreset) => {
    const apparatuses = [
      { presetId: session.fx_preset_id, code: "FX" },
      { presetId: session.ph_preset_id, code: "PH" },
      { presetId: session.sr_preset_id, code: "SR" },
      { presetId: session.vt_preset_id, code: "VT" },
      { presetId: session.pb_preset_id, code: "PB" },
      { presetId: session.hb_preset_id, code: "HB" },
    ];

    return apparatuses
      .filter(({ presetId }) => presetId !== null)
      .map(({ code }) => code);
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
              <PresetCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                badge={formatApparatusName(preset.apparatus)}
                description={`Quantità: ${preset.quantity} | Esecuzione: ${formatExecutionGrade(preset.execution_grade)}`}
                isExpanded={expandedCards.has(preset.id)}
                onToggleExpand={() => toggleCardExpansion(preset.id)}
                onDelete={async () => {
                  const result = await deleteApparatusPreset(preset.id);
                  if ("error" in result) {
                    throw new Error(result.error);
                  }
                  window.location.reload();
                }}
                editForm={
                  <ApparatusPresetEditForm
                    preset={preset}
                    onSave={handleFormSave}
                    onCancel={() => {}} // Will be handled by dialog
                  />
                }
              />
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
            {sessionPresets.map((preset) => {
              const apparatusCount = getApparatusCount(preset);
              const apparatusList = getApparatusList(preset);

              return (
                <PresetCard
                  key={preset.id}
                  id={preset.id}
                  name={preset.name}
                  badge={`${apparatusCount} attrezzi`}
                  description={
                    apparatusList.length > 0
                      ? `Attrezzi: ${apparatusList.join(", ")}`
                      : "Nessun attrezzo configurato"
                  }
                  isExpanded={expandedCards.has(preset.id)}
                  onToggleExpand={() => toggleCardExpansion(preset.id)}
                  onDelete={async () => {
                    const result = await deleteSessionPreset(preset.id);
                    if ("error" in result) {
                      throw new Error(result.error);
                    }
                    window.location.reload();
                  }}
                  editForm={
                    <SessionPresetEditForm
                      preset={preset}
                      availableApparatusPresets={apparatusPresets}
                      onSave={handleFormSave}
                      onCancel={() => {}} // Will be handled by dialog
                    />
                  }
                  details={
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
                          const presetId = preset[
                            key as keyof typeof preset
                          ] as string | null;
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
                  }
                />
              );
            })}
            {sessionPresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessun preset allenamento salvato
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
                availableSessionPresets={sessionPresets}
                availableApparatusPresets={apparatusPresets}
              />
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {microcyclePresets.map((preset) => {
              const totalDays = new Set(
                preset.presets_microcycles_sessions.map((s) => s.day_number),
              ).size;
              const totalSessions = preset.presets_microcycles_sessions.length;

              return (
                <PresetCard
                  key={preset.id}
                  id={preset.id}
                  name={preset.name}
                  description={`${totalDays} giorni, ${totalSessions} allenamenti`}
                  isExpanded={expandedCards.has(preset.id)}
                  onToggleExpand={() => toggleCardExpansion(preset.id)}
                  onDelete={async () => {
                    const result = await deleteMicrocyclePreset(preset.id);
                    if ("error" in result) {
                      throw new Error(result.error);
                    }
                    window.location.reload();
                  }}
                  editForm={
                    <MicrocyclePresetEditForm
                      preset={preset}
                      availableSessionPresets={sessionPresets}
                      availableApparatusPresets={apparatusPresets}
                      onSave={handleFormSave}
                      onCancel={() => {}} // Will be handled by dialog
                    />
                  }
                  details={
                    <div className="space-y-2">
                      {Object.entries(
                        preset.presets_microcycles_sessions.reduce(
                          (acc, session) => {
                            const dayNumber = session.day_number;
                            if (!acc[dayNumber]) {
                              acc[dayNumber] = [];
                            }
                            acc[dayNumber].push(session);
                            return acc;
                          },
                          {} as Record<
                            number,
                            typeof preset.presets_microcycles_sessions
                          >,
                        ),
                      )
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([dayNumber, sessions]) => {
                          const dayLabel =
                            WEEKDAYS[parseInt(dayNumber)] || `G${dayNumber}`;
                          const sessionCount = sessions.length;

                          return (
                            <div key={dayNumber} className="text-xs">
                              <div className="font-medium text-muted-foreground">
                                {dayLabel} ({sessionCount} allenamento
                                {sessionCount > 1 ? "i" : ""})
                              </div>
                              {sessions
                                .sort(
                                  (a, b) => a.session_order - b.session_order,
                                )
                                .map((session) => {
                                  const trainingSession =
                                    session.presets_training_sessions;
                                  if (!trainingSession) return null;

                                  // Count apparatuses based on available data
                                  const apparatuses = [
                                    trainingSession.fx_preset,
                                    trainingSession.ph_preset,
                                    trainingSession.sr_preset,
                                    trainingSession.vt_preset,
                                    trainingSession.pb_preset,
                                    trainingSession.hb_preset,
                                  ];
                                  const apparatusCount =
                                    apparatuses.filter(Boolean).length;
                                  const apparatusList = apparatuses
                                    .map((preset, index) => {
                                      if (!preset) return null;
                                      const codes = [
                                        "FX",
                                        "PH",
                                        "SR",
                                        "VT",
                                        "PB",
                                        "HB",
                                      ];
                                      return codes[index];
                                    })
                                    .filter(Boolean) as string[];

                                  return (
                                    <div
                                      key={session.id}
                                      className="ml-2 text-xs text-muted-foreground"
                                    >
                                      • {trainingSession.name} ({apparatusCount}{" "}
                                      attrezzi: {apparatusList.join(", ")})
                                    </div>
                                  );
                                })}
                            </div>
                          );
                        })}
                    </div>
                  }
                />
              );
            })}
            {microcyclePresets.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nessun preset microciclo salvato
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Microcycles Sessions Presets Column */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Microcicli-Allenamenti (da Rimuovere)</CardTitle>
          <CardDescription>
            Associazioni tra microcicli e Allenamenti con numero giorno
          </CardDescription>
          <Button
            onClick={() =>
              setActiveForm(
                activeForm === "microcyclessessions"
                  ? null
                  : "microcyclessessions",
              )
            }
            variant={
              activeForm === "microcyclessessions" ? "secondary" : "outline"
            }
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Associazione
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeForm === "microcyclessessions" && (
            <div className="rounded-lg border bg-muted/50 p-4">
              {/* <MicrocyclesWeekdaysPresetForm
                onSave={handleFormSave}
                onCancel={() => setActiveForm(null)}
                availableMicrocycles={microcyclePresets}
                availableWeekdays={[]}
              /> */}
            </div>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {microcyclesSessionsPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                badge={`Giorno ${preset.day_number}`}
                description={`Microciclo: ${microcyclePresets.find((m) => m.id === preset.microcycle_id)?.name || "N/A"}`}
                isExpanded={expandedCards.has(preset.id)}
                onToggleExpand={() => toggleCardExpansion(preset.id)}
                onDelete={async () => {
                  const result = await deleteMicrocyclesSessionsPreset(
                    preset.id,
                  );
                  if ("error" in result) {
                    throw new Error(result.error);
                  }
                  window.location.reload();
                }}
              />
            ))}
            {microcyclesSessionsPresets.length === 0 && (
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
              <PresetCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                badge={`${preset.length_in_weeks} sett.`}
                isExpanded={expandedCards.has(preset.id)}
                onToggleExpand={() => toggleCardExpansion(preset.id)}
                onDelete={async () => {
                  const result = await deleteMacrocyclePreset(preset.id);
                  if ("error" in result) {
                    throw new Error(result.error);
                  }
                  window.location.reload();
                }}
                editForm={
                  <MacrocyclePresetEditForm
                    preset={preset}
                    onSave={handleFormSave}
                    onCancel={() => {}} // Will be handled by dialog
                  />
                }
              />
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
          <CardTitle>Preset Macrocicli-Microcicli (da Rimuovere)</CardTitle>
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
              <PresetCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                badge={`Settimana ${preset.week_number}`}
                description={`Macrociclo: ${macrocyclePresets.find((m) => m.id === preset.macrocycle_id)?.name || "N/A"} | Microciclo: ${microcyclePresets.find((m) => m.id === preset.microcycle_id)?.name || "N/A"}`}
                isExpanded={expandedCards.has(preset.id)}
                onToggleExpand={() => toggleCardExpansion(preset.id)}
                onDelete={async () => {
                  const result = await deleteMacrocyclesMicrocyclesPreset(
                    preset.id,
                  );
                  if ("error" in result) {
                    throw new Error(result.error);
                  }
                  window.location.reload();
                }}
              />
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
