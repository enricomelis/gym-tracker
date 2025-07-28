"use client";

import { useState, useTransition, useEffect } from "react";
import { updateSessionPreset } from "@/lib/actions/presets";
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
import { Plus } from "lucide-react";
import type { NewTrainingSessionPreset, NewApparatusPreset } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ApparatusPresetForm from "@/components/apparatus-preset-form";
import { formatApparatusName } from "@/lib/utils/preset-naming";

interface SessionPresetEditFormProps {
  preset: NewTrainingSessionPreset;
  availableApparatusPresets: NewApparatusPreset[];
  onSave?: () => Promise<void> | void;
  onCancel?: () => void;
}

export default function SessionPresetEditForm({
  preset,
  availableApparatusPresets,
  onSave,
  onCancel,
}: SessionPresetEditFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(preset.name);
  const [selectedPresets, setSelectedPresets] = useState<
    Record<string, string>
  >({
    fx_preset_id: preset.fx_preset_id || "none",
    ph_preset_id: preset.ph_preset_id || "none",
    sr_preset_id: preset.sr_preset_id || "none",
    vt_preset_id: preset.vt_preset_id || "none",
    pb_preset_id: preset.pb_preset_id || "none",
    hb_preset_id: preset.hb_preset_id || "none",
  });
  const [presets, setPresets] = useState<NewApparatusPreset[]>(
    availableApparatusPresets,
  );
  const [showDialog, setShowDialog] = useState<null | string>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

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
      const result = await updateSessionPreset(preset.id, presetData);

      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Preset allenamento aggiornato con successo.",
          duration: 1500,
        });
        if (onSave) await onSave();
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
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Preset Allenamento</label>
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
        const uniqueSelectedPresetIds = Array.from(new Set(selectedPresetIds));

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
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue
                        placeholder="Seleziona preset"
                        className="truncate"
                      />
                    </SelectTrigger>
                    <SelectContent className="max-w-[300px]">
                      <SelectItem value="none">Nessuno</SelectItem>
                      {presets.map((preset) => (
                        <SelectItem
                          key={preset.id}
                          value={preset.id}
                          className="truncate"
                        >
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
                  const selectedPreset = presets.find((p) => p.id === value);
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
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Annulla
        </Button>
        <Button onClick={handleSave} disabled={isPending || !name.trim()}>
          {isPending ? "Aggiornamento..." : "Aggiorna Preset"}
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
  );
}
