"use client";

import { useState, useTransition, useEffect } from "react";
import {
  updateMicrocyclePreset,
  createSessionPreset,
} from "@/lib/actions/presets";
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
import { Plus, Trash2 } from "lucide-react";
import type {
  NewTrainingSessionPreset,
  NewApparatusPreset,
  MicrocyclePresetWithDetails,
} from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ApparatusPresetForm from "@/components/apparatus-preset-form";
import {
  generatePresetName,
  formatApparatusName,
  getWeekdayLabel,
} from "@/lib/utils/preset-naming";

type MicrocycleSession = {
  id: string;
  day_number: number;
  training_session_id: string | null;
};

const weekDays = [
  { value: 1, label: "Lunedì" },
  { value: 2, label: "Martedì" },
  { value: 3, label: "Mercoledì" },
  { value: 4, label: "Giovedì" },
  { value: 5, label: "Venerdì" },
  { value: 6, label: "Sabato" },
  { value: 7, label: "Domenica" },
];

// Custom Session Creation Dialog Component
function SessionCreationDialog({
  open,
  onOpenChange,
  onSessionCreated,
  availableApparatusPresets,
  onApparatusPresetCreated,
  microcycleName,
  dayNumber,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionCreated: (session: NewTrainingSessionPreset) => void;
  availableApparatusPresets: NewApparatusPreset[];
  onApparatusPresetCreated: (newPreset: NewApparatusPreset) => void;
  microcycleName: string;
  dayNumber: number;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<
    Record<string, string>
  >({
    fx_preset_id: "none",
    ph_preset_id: "none",
    sr_preset_id: "none",
    vt_preset_id: "none",
    pb_preset_id: "none",
    hb_preset_id: "none",
  });
  const [presets, setPresets] = useState<NewApparatusPreset[]>(
    availableApparatusPresets,
  );
  const [showDialog, setShowDialog] = useState<null | string>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  // Generate automatic name when dialog opens or microcycleName/dayNumber changes
  useEffect(() => {
    if (open && microcycleName && dayNumber) {
      const dayName = getWeekdayLabel(dayNumber);
      const autoName = generatePresetName.session(microcycleName, dayName);
      setName(autoName);
    }
  }, [open, microcycleName, dayNumber]);

  const handleAddPreset = (key: string) => {
    setShowDialog(key);
    setPendingKey(key);
  };

  const handlePresetCreated = (newPreset: NewApparatusPreset | undefined) => {
    if (newPreset && pendingKey) {
      setPresets((prev) => [...prev, newPreset]);
      setSelectedPresets((prev) => ({
        ...prev,
        [pendingKey]: newPreset.id,
      }));
      onApparatusPresetCreated(newPreset);
    }
    setShowDialog(null);
  };

  const handlePresetChange = (key: string, presetId: string) => {
    setSelectedPresets((prev) => ({
      ...prev,
      [key]: presetId,
    }));
  };

  const handleApplyToAllApparatus = (presetId: string) => {
    setSelectedPresets((prev) => ({
      fx_preset_id: presetId,
      ph_preset_id: presetId,
      sr_preset_id: presetId,
      vt_preset_id: presetId,
      pb_preset_id: presetId,
      hb_preset_id: presetId,
    }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    const presetData = {
      name: name.trim(),
      fx_preset_id:
        selectedPresets.fx_preset_id === "none"
          ? null
          : selectedPresets.fx_preset_id,
      ph_preset_id:
        selectedPresets.ph_preset_id === "none"
          ? null
          : selectedPresets.ph_preset_id,
      sr_preset_id:
        selectedPresets.sr_preset_id === "none"
          ? null
          : selectedPresets.sr_preset_id,
      vt_preset_id:
        selectedPresets.vt_preset_id === "none"
          ? null
          : selectedPresets.vt_preset_id,
      pb_preset_id:
        selectedPresets.pb_preset_id === "none"
          ? null
          : selectedPresets.pb_preset_id,
      hb_preset_id:
        selectedPresets.hb_preset_id === "none"
          ? null
          : selectedPresets.hb_preset_id,
    };

    startTransition(async () => {
      const result = await createSessionPreset([presetData]);

      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else if (result && "success" in result && result.data) {
        const newSession = result.data[0] as NewTrainingSessionPreset;
        onSessionCreated(newSession);
        toast({
          title: "Successo",
          description: "Preset allenamento creato.",
          duration: 1500,
        });
        // Reset form
        setName("");
        setSelectedPresets({
          fx_preset_id: "none",
          ph_preset_id: "none",
          sr_preset_id: "none",
          vt_preset_id: "none",
          pb_preset_id: "none",
          hb_preset_id: "none",
        });
        onOpenChange(false);
      }
    });
  };

  const getPresetsForApparatus = (apparatus: string) => {
    const filteredPresets = presets.filter(
      (preset) => preset.apparatus === apparatus || preset.apparatus === "All",
    );
    // Remove duplicates based on id to avoid React key conflicts
    const uniquePresets = Array.from(
      new Map(filteredPresets.map((preset) => [preset.id, preset])).values(),
    );
    return uniquePresets;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Preset Allenamento</DialogTitle>
          <DialogDescription>
            Crea un nuovo preset di allenamento per questo giorno del
            microciclo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">
              Nome Preset Allenamento
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              placeholder="Inserisci nome preset"
            />
          </div>

          {/* Apply to all apparatus section - show only when "All" preset is newly selected */}
          {(() => {
            // Get all selected preset IDs
            const selectedPresetIds = Object.values(selectedPresets).filter(
              (value) => value !== "none",
            );
            const uniqueSelectedPresetIds = Array.from(
              new Set(selectedPresetIds),
            );

            // Find "All" presets that are newly selected (not already applied to all)
            const allPresets = uniqueSelectedPresetIds
              .map((presetId) => presets.find((p) => p.id === presetId))
              .filter(
                (preset): preset is NewApparatusPreset =>
                  preset?.apparatus === "All",
              );

            // Check if any "All" preset is not already applied to all apparatus
            const newlySelectedAllPresets = allPresets.filter((allPreset) => {
              const isAppliedToAll = Object.values(selectedPresets).every(
                (value) => value === allPreset.id || value === "none",
              );
              return !isAppliedToAll;
            });

            if (newlySelectedAllPresets.length > 0) {
              return (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Azioni Rapide</h4>
                  <div className="flex flex-wrap gap-2">
                    {newlySelectedAllPresets.map((preset) => (
                      <Button
                        key={preset.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyToAllApparatus(preset.id)}
                        disabled={isPending}
                        className="text-xs"
                      >
                        Applica "{preset.name}" a tutti gli attrezzi
                      </Button>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Preset per Attrezzo</h4>
            {Object.entries(selectedPresets).map(([key, value]) => {
              const apparatus = key.split("_")[0].toUpperCase();
              const presets = getPresetsForApparatus(apparatus);

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {formatApparatusName(apparatus)}
                      </label>
                      <Select
                        value={value}
                        onValueChange={(newValue) =>
                          handlePresetChange(key, newValue)
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona preset" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nessuno</SelectItem>
                          {presets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                              {preset.name} (Q: {preset.quantity}, G:{" "}
                              {preset.execution_grade})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="mb-1"
                      title={`Aggiungi nuovo preset per ${formatApparatusName(apparatus)}`}
                      onClick={() => handleAddPreset(key)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Show apply to all button when a preset "All" is selected */}
                  {value !== "none" &&
                    (() => {
                      const selectedPreset = presets.find(
                        (p) => p.id === value,
                      );
                      if (selectedPreset?.apparatus === "All") {
                        return (
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplyToAllApparatus(value)}
                              disabled={isPending}
                              className="text-xs"
                            >
                              Applica a tutti gli attrezzi
                            </Button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Annulla
            </Button>
            <Button onClick={handleSave} disabled={isPending || !name.trim()}>
              {isPending ? "Creazione..." : "Crea Preset"}
            </Button>
          </div>

          {/* Apparatus creation dialog */}
          {showDialog && (
            <Dialog
              open={!!showDialog}
              onOpenChange={(open) => {
                if (!open) setShowDialog(null);
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crea un nuovo Preset Attrezzo</DialogTitle>
                  <DialogDescription>
                    Il nuovo preset verrà selezionato automaticamente per
                    l&apos;allenamento corrente.
                  </DialogDescription>
                </DialogHeader>
                <ApparatusPresetForm
                  onSave={async (newPreset) => {
                    handlePresetCreated(newPreset);
                    if (newPreset) {
                      toast({
                        title: "Preset attrezzo aggiunto e selezionato!",
                        duration: 1200,
                      });
                    }
                  }}
                  onCancel={() => setShowDialog(null)}
                  sessionName={name}
                  apparatusType={
                    pendingKey ? pendingKey.split("_")[0].toUpperCase() : ""
                  }
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface MicrocyclePresetEditFormProps {
  preset: MicrocyclePresetWithDetails;
  availableSessionPresets: NewTrainingSessionPreset[];
  availableApparatusPresets: NewApparatusPreset[];
  onSave?: () => Promise<void> | void;
  onCancel?: () => void;
}

export default function MicrocyclePresetEditForm({
  preset,
  availableSessionPresets,
  availableApparatusPresets,
  onSave,
  onCancel,
}: MicrocyclePresetEditFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(preset.name);
  const [sessions, setSessions] = useState<MicrocycleSession[]>(
    preset.presets_microcycles_sessions.map((session) => ({
      id: session.id,
      day_number: session.day_number,
      training_session_id: session.presets_training_sessions?.id || null,
    })),
  );
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [pendingDayNumber, setPendingDayNumber] = useState<number>(1);
  const [sessionPresets, setSessionPresets] = useState<
    NewTrainingSessionPreset[]
  >(availableSessionPresets);
  const [apparatusPresets, setApparatusPresets] = useState<
    NewApparatusPreset[]
  >(availableApparatusPresets);

  // Handle ESC key to cancel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (onCancel) {
          onCancel();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  // Auto-select text on focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleAddSession = () => {
    const newSession: MicrocycleSession = {
      id: `session-${Date.now()}`,
      day_number: 1,
      training_session_id: null,
    };

    setSessions((prev) => [...prev, newSession]);
  };

  const handleRemoveSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
  };

  const handleSessionChange = (
    sessionId: string,
    field: "day_number" | "training_session_id",
    value: number | string | null,
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, [field]: value } : session,
      ),
    );
  };

  const handleCreateNewSession = (sessionId: string, dayNumber: number) => {
    setPendingSessionId(sessionId);
    setPendingDayNumber(dayNumber);
    setShowSessionDialog(true);
  };

  const handleSessionCreated = (newSession: NewTrainingSessionPreset) => {
    if (pendingSessionId) {
      setSessionPresets((prev) => [...prev, newSession]);
      handleSessionChange(
        pendingSessionId,
        "training_session_id",
        newSession.id,
      );
    }
    setPendingSessionId(null);
  };

  const handleApparatusPresetCreated = (newPreset: NewApparatusPreset) => {
    setApparatusPresets((prev) => [...prev, newPreset]);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    if (sessions.length === 0) {
      toast({
        title: "Allenamenti obbligatori",
        description: "Aggiungi almeno un allenamento al microciclo.",
        variant: "destructive",
      });
      return;
    }

    // Filter out sessions without training_session_id
    const validSessions = sessions.filter(
      (session) => session.training_session_id !== null,
    );

    if (validSessions.length === 0) {
      toast({
        title: "Allenamenti obbligatori",
        description:
          "Almeno un allenamento deve avere un preset di allenamento selezionato.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await updateMicrocyclePreset(preset.id, {
        name: name.trim(),
        sessions: validSessions.map((session) => ({
          day_number: session.day_number,
          training_session_id: session.training_session_id,
        })),
      });

      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Preset microciclo aggiornato con successo.",
          duration: 1500,
        });
        if (onSave) await onSave();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Preset Microciclo</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Inserisci nome preset"
        />
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleAddSession}
          >
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Giorno
          </Button>
        </div>

        {sessions.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nessun allenamento aggiunto. Clicca "Aggiungi Giorno" per
              iniziare.
            </p>
          </div>
        )}

        {sessions.map((session) => (
          <div key={session.id} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Giorno
                  </label>
                  <Select
                    value={session.day_number.toString()}
                    onValueChange={(value) =>
                      handleSessionChange(
                        session.id,
                        "day_number",
                        parseInt(value),
                      )
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem
                          key={day.value}
                          value={day.value.toString()}
                        >
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveSession(session.id)}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Preset Allenamento
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCreateNewSession(session.id, session.day_number)
                  }
                  disabled={isPending}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Nuovo
                </Button>
              </div>
              <Select
                value={session.training_session_id || "none"}
                onValueChange={(value) =>
                  handleSessionChange(
                    session.id,
                    "training_session_id",
                    value === "none" ? null : value,
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona preset allenamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun preset</SelectItem>
                  {sessionPresets.map((sessionPreset) => (
                    <SelectItem key={sessionPreset.id} value={sessionPreset.id}>
                      {sessionPreset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Annulla
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending || !name.trim() || sessions.length === 0}
        >
          {isPending ? "Aggiornamento..." : "Aggiorna Preset Microciclo"}
        </Button>
      </div>

      {/* Session Creation Dialog */}
      <SessionCreationDialog
        open={showSessionDialog}
        onOpenChange={setShowSessionDialog}
        onSessionCreated={handleSessionCreated}
        availableApparatusPresets={apparatusPresets}
        onApparatusPresetCreated={handleApparatusPresetCreated}
        microcycleName={name}
        dayNumber={pendingDayNumber}
      />
    </div>
  );
}
