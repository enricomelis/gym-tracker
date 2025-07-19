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

  const handlePresetChange = (apparatus: string, presetId: string) => {
    setSelectedPresets((prev) => ({
      ...prev,
      [`${apparatus.toLowerCase()}_preset_id`]: presetId,
    }));
  };

  const getPresetsForApparatus = (apparatus: string) => {
    return availableApparatusPresets.filter(
      (preset) => preset.apparatus === apparatus,
    );
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

  const apparatusTypes = ["FX", "PH", "SR", "VT", "PB", "HB"];

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
        {apparatusTypes.map((apparatus) => {
          const presets = getPresetsForApparatus(apparatus);
          const selectedValue =
            selectedPresets[`${apparatus.toLowerCase()}_preset_id`];

          return (
            <div key={apparatus}>
              <label className="text-xs text-muted-foreground">
                {formatApparatusName(apparatus)}
              </label>
              <Select
                value={selectedValue}
                onValueChange={(value) => handlePresetChange(apparatus, value)}
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
          );
        })}
      </div>

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
