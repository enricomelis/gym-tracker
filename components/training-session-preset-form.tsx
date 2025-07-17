"use client";

import { useEffect, useState, useTransition } from "react";
import {
  createTrainingSessionPreset,
  getDailyRoutinePresets,
} from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import type { TrainingSessionPreset, DailyRoutinePreset } from "@/lib/types";

const apparatusList = ["FX", "PH", "SR", "VT", "PB", "HB"] as const;
const weekDays = [
  { value: 1, label: "Lunedì" },
  { value: 2, label: "Martedì" },
  { value: 3, label: "Mercoledì" },
  { value: 4, label: "Giovedì" },
  { value: 5, label: "Venerdì" },
  { value: 6, label: "Sabato" },
  { value: 7, label: "Domenica" },
];

type EditablePreset = {
  name: string;
  week_day: number | null;
  fx_preset_id: string | null;
  ph_preset_id: string | null;
  sr_preset_id: string | null;
  vt_preset_id: string | null;
  pb_preset_id: string | null;
  hb_preset_id: string | null;
};

const initialPreset: EditablePreset = {
  name: "",
  week_day: null,
  fx_preset_id: null,
  ph_preset_id: null,
  sr_preset_id: null,
  vt_preset_id: null,
  pb_preset_id: null,
  hb_preset_id: null,
};

export default function TrainingSessionPresetForm({
  onSave,
}: {
  onSave?: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [preset, setPreset] = useState<EditablePreset>(initialPreset);
  const [dailyRoutinePresets, setDailyRoutinePresets] = useState<
    DailyRoutinePreset[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch daily routine presets on mount
  useEffect(() => {
    async function fetchPresets() {
      setLoading(true);
      const presets = await getDailyRoutinePresets();
      setDailyRoutinePresets(presets || []);
      setLoading(false);
    }
    fetchPresets();
  }, []);

  const handleChange = (
    field: keyof EditablePreset,
    value: string | number | null,
  ) => {
    setPreset((prev) => ({ ...prev, [field]: value }));
  };

  const getPresetsForApparatus = (apparatus: string) => {
    return dailyRoutinePresets.filter(
      (preset) => preset.apparatus === apparatus || preset.apparatus === "All",
    );
  };

  const handleSave = () => {
    if (!preset.name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    // At least one apparatus preset must be selected
    const hasApparatusPreset = [
      preset.fx_preset_id,
      preset.ph_preset_id,
      preset.sr_preset_id,
      preset.vt_preset_id,
      preset.pb_preset_id,
      preset.hb_preset_id,
    ].some((id) => id !== null);

    if (!hasApparatusPreset) {
      toast({
        title: "Devi selezionare almeno un preset per attrezzo",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const payload: Omit<TrainingSessionPreset, "id" | "created_by">[] = [
        {
          name: preset.name.trim(),
          week_day: preset.week_day,
          fx_preset_id: preset.fx_preset_id,
          ph_preset_id: preset.ph_preset_id,
          sr_preset_id: preset.sr_preset_id,
          vt_preset_id: preset.vt_preset_id,
          pb_preset_id: preset.pb_preset_id,
          hb_preset_id: preset.hb_preset_id,
        },
      ];

      const result = await createTrainingSessionPreset(payload);
      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Preset sessione di allenamento salvato.",
          duration: 1000,
        });
        setPreset(initialPreset);
        if (onSave) await onSave();
      }
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Nome Preset</label>
          <Input
            value={preset.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onFocus={handleFocus}
            disabled={isPending || loading}
            placeholder="Inserisci nome preset..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Giorno Settimana (opzionale)
          </label>
          <Select
            value={preset.week_day?.toString() || "none"}
            onValueChange={(val) =>
              handleChange("week_day", val === "none" ? null : Number(val))
            }
            disabled={isPending || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona giorno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nessuno</SelectItem>
              {weekDays.map((day) => (
                <SelectItem key={day.value} value={day.value.toString()}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending || loading || !preset.name.trim()}
          >
            {isPending ? "Salvataggio..." : "Salva Preset"}
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-medium">Preset per Attrezzo</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Attrezzo</TableHead>
              <TableHead>Preset Giornaliero</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apparatusList.map((apparatus) => (
              <TableRow key={apparatus}>
                <TableCell className="font-medium">{apparatus}</TableCell>
                <TableCell>
                  <Select
                    value={
                      (preset[
                        `${apparatus.toLowerCase()}_preset_id` as keyof EditablePreset
                      ] as string) || "none"
                    }
                    onValueChange={(val) =>
                      handleChange(
                        `${apparatus.toLowerCase()}_preset_id` as keyof EditablePreset,
                        val === "none" ? null : val,
                      )
                    }
                    disabled={isPending || loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona preset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuno</SelectItem>
                      {getPresetsForApparatus(apparatus).map((dailyPreset) => (
                        <SelectItem key={dailyPreset.id} value={dailyPreset.id}>
                          {dailyPreset.name} ({dailyPreset.type}, Q:
                          {dailyPreset.quantity}, S:{dailyPreset.target_sets})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
