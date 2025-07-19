"use client";

import { useState, useTransition } from "react";
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
}

export default function SessionPresetForm({
  onSave,
  availableApparatusPresets,
}: SessionPresetFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [selectedPresets, setSelectedPresets] = useState<
    Record<string, string>
  >({
    fx_preset_id: "",
    ph_preset_id: "",
    sr_preset_id: "",
    vt_preset_id: "",
    pb_preset_id: "",
    hb_preset_id: "",
  });

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    // Convert empty strings to null for the API
    const presetData = {
      name: name.trim(),
      fx_preset_id: selectedPresets.fx_preset_id || null,
      ph_preset_id: selectedPresets.ph_preset_id || null,
      sr_preset_id: selectedPresets.sr_preset_id || null,
      vt_preset_id: selectedPresets.vt_preset_id || null,
      pb_preset_id: selectedPresets.pb_preset_id || null,
      hb_preset_id: selectedPresets.hb_preset_id || null,
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
          fx_preset_id: "",
          ph_preset_id: "",
          sr_preset_id: "",
          vt_preset_id: "",
          pb_preset_id: "",
          hb_preset_id: "",
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
                  <SelectItem value="">Nessun preset</SelectItem>
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
