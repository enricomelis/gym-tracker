"use client";

import { useState, useTransition, useEffect } from "react";
import { createSessionPreset } from "@/lib/actions/presets";
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
import type { NewApparatusPreset } from "@/lib/types";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ApparatusPresetForm from "@/components/apparatus-preset-form";

interface SessionPresetFormProps {
  onSave?: () => Promise<void> | void;
  availableApparatusPresets: NewApparatusPreset[];
  onCancel?: () => void;
}

export default function SessionPresetForm({
  onSave,
  availableApparatusPresets,
  onCancel,
}: SessionPresetFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  // --- Apparatus-from-session: use the generic hook ---
  const apparatusTypes = ["FX", "PH", "SR", "VT", "PB", "HB"];
  const selectionKeys = apparatusTypes.map(
    (a) => `${a.toLowerCase()}_preset_id`,
  );
  const getDiscriminator = (key: string) => key.split("_")[0].toUpperCase();
  const [presets, setPresets] = useState<NewApparatusPreset[]>(
    availableApparatusPresets,
  );
  const [selectedPresets, setSelectedPresets] = useState<
    Record<string, string>
  >(Object.fromEntries(selectionKeys.map((k) => [k, "none"])));
  const [showDialog, setShowDialog] = useState<null | string>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

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

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    // Convert "none" values to null for the API
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
      } else {
        toast({
          title: "Successo",
          description: "Preset allenamento salvato.",
          duration: 1500,
        });
        setName("");
        setSelectedPresets({
          fx_preset_id: "none",
          ph_preset_id: "none",
          sr_preset_id: "none",
          vt_preset_id: "none",
          pb_preset_id: "none",
          hb_preset_id: "none",
        });
        if (onSave) await onSave();
      }
    });
  };

  const getPresetsForApparatus = (apparatus: string) => {
    return presets.filter((preset) => preset.apparatus === apparatus);
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

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Preset Allenamento</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Inserisci nome preset"
        />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Preset per Attrezzo</h4>
        {selectionKeys.map((key) => {
          const apparatus = getDiscriminator(key);
          const presets = getPresetsForApparatus(apparatus);
          const selectedValue = selectedPresets[key];
          return (
            <div key={key} className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">
                  {formatApparatusName(apparatus)}
                </label>
                <Select
                  value={selectedValue}
                  onValueChange={(value) => handlePresetChange(key, value)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nessun preset (opzionale)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessun preset</SelectItem>
                    {presets.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name} (Q: {preset.quantity}, E:{" "}
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
          );
        })}
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
            />
          </DialogContent>
        </Dialog>
      )}

      <Button
        onClick={handleSave}
        disabled={isPending || !name.trim()}
        className="w-full"
      >
        {isPending ? "Salvataggio..." : "Salva Preset Allenamento"}
      </Button>
    </div>
  );
}
