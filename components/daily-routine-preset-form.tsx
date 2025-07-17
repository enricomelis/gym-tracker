"use client";

import { useState, useTransition } from "react";
import { createDailyRoutinePreset } from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
import type { DailyRoutinePreset } from "@/lib/types";

const apparatusList: Array<DailyRoutinePreset["apparatus"]> = [
  "All",
  "FX",
  "PH",
  "SR",
  "VT",
  "PB",
  "HB",
];

const normalApparatusTypes: Array<DailyRoutinePreset["type"]> = [
  "I+",
  "I",
  "P",
  "C",
  "U",
  "Std",
];

const vaultingTypes: Array<DailyRoutinePreset["type"]> = ["G", "S", "B", "D"];

const getTypeOptionsForApparatus = (
  apparatus: DailyRoutinePreset["apparatus"],
) => {
  return apparatus === "VT" ? vaultingTypes : normalApparatusTypes;
};

const executionOptions: Array<DailyRoutinePreset["target_execution"]> = [
  "A+",
  "A",
  "B+",
  "B",
  "C+",
  "C",
];

type EditablePreset = Omit<
  DailyRoutinePreset,
  "id" | "created_by" | "quantity" | "target_sets"
> & {
  quantity: number | "";
  target_sets: number | "";
};

export default function DailyRoutinePresetForm({
  onSave,
}: {
  onSave?: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [presetName, setPresetName] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [allApparatusPreset, setAllApparatusPreset] = useState<EditablePreset>({
    name: "",
    apparatus: "All",
    type: "I+",
    quantity: "",
    target_sets: "",
    target_execution: "A+",
  });
  const [presets, setPresets] = useState<EditablePreset[]>(
    apparatusList
      .filter((a) => a !== "All")
      .map((apparatus) => ({
        name: "",
        apparatus,
        type: apparatus === "VT" ? "G" : "I+",
        quantity: "",
        target_sets: "",
        target_execution: "A+",
      })),
  );

  const handleChange = (
    index: number,
    field: keyof EditablePreset,
    value: string | number,
  ) => {
    setPresets((prev) =>
      prev.map((preset, i) =>
        i === index ? { ...preset, [field]: value } : preset,
      ),
    );
  };

  const handleAllApparatusChange = (
    field: keyof EditablePreset,
    value: string | number,
  ) => {
    setAllApparatusPreset((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!presetName.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    let payload: Omit<DailyRoutinePreset, "id" | "created_by">[];

    if (applyToAll) {
      // Applicazione a tutti gli attrezzi
      if (
        !allApparatusPreset.type ||
        !allApparatusPreset.quantity ||
        !allApparatusPreset.target_sets ||
        !allApparatusPreset.target_execution ||
        typeof allApparatusPreset.quantity !== "number" ||
        typeof allApparatusPreset.target_sets !== "number"
      ) {
        toast({
          title: "Compila tutti i campi del preset",
          variant: "destructive",
        });
        return;
      }

      payload = [
        {
          name: presetName.trim(),
          apparatus: "All",
          type: allApparatusPreset.type,
          quantity: allApparatusPreset.quantity as number,
          target_sets: allApparatusPreset.target_sets as number,
          target_execution: allApparatusPreset.target_execution,
        },
      ];
    } else {
      // Applicazione a attrezzi specifici
      const validPresets = presets.filter(
        (p) =>
          p.type &&
          p.quantity &&
          p.target_sets &&
          p.target_execution &&
          typeof p.quantity === "number" &&
          typeof p.target_sets === "number",
      );

      if (validPresets.length === 0) {
        toast({
          title: "Devi compilare almeno un attrezzo",
          variant: "destructive",
        });
        return;
      }

      payload = validPresets.map((p) => ({
        name: presetName.trim(),
        apparatus: p.apparatus,
        type: p.type,
        quantity: p.quantity as number,
        target_sets: p.target_sets as number,
        target_execution: p.target_execution,
      }));
    }

    startTransition(async () => {
      const result = await createDailyRoutinePreset(payload);
      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Preset routine giornaliera salvato.",
          duration: 1500,
        });
        setPresetName("");
        setApplyToAll(false);
        setAllApparatusPreset({
          name: "",
          apparatus: "All",
          type: "I+",
          quantity: "",
          target_sets: "",
          target_execution: "A+",
        });
        setPresets(
          apparatusList
            .filter((a) => a !== "All")
            .map((apparatus) => ({
              name: "",
              apparatus,
              type: apparatus === "VT" ? "G" : "I+",
              quantity: "",
              target_sets: "",
              target_execution: "A+",
            })),
        );
        if (onSave) await onSave();
      }
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-2">
          <label className="text-sm font-medium">Nome Preset</label>
          <Input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onFocus={handleFocus}
            disabled={isPending}
            placeholder="Inserisci nome preset..."
          />
        </div>
        <div className="flex items-end justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending || !presetName.trim()}
          >
            {isPending ? "Salvataggio..." : "Salva Preset"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Applicazione Preset</label>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="apply-all"
              name="apply-type"
              checked={applyToAll}
              onChange={() => setApplyToAll(true)}
              disabled={isPending}
              className="h-4 w-4"
            />
            <Label htmlFor="apply-all" className="text-sm font-normal">
              Applica a tutti gli attrezzi
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="apply-specific"
              name="apply-type"
              checked={!applyToAll}
              onChange={() => setApplyToAll(false)}
              disabled={isPending}
              className="h-4 w-4"
            />
            <Label htmlFor="apply-specific" className="text-sm font-normal">
              Applica ad attrezzi specifici
            </Label>
          </div>
        </div>
      </div>

      {applyToAll ? (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Configurazione Preset Generale
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={allApparatusPreset.type}
                onValueChange={(val) =>
                  handleAllApparatusChange(
                    "type",
                    val as DailyRoutinePreset["type"],
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {normalApparatusTypes.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Quantità</label>
              <Input
                type="number"
                value={allApparatusPreset.quantity}
                onChange={(e) =>
                  handleAllApparatusChange(
                    "quantity",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                onFocus={handleFocus}
                disabled={isPending}
                min="1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Numero di salite</label>
              <Input
                type="number"
                value={allApparatusPreset.target_sets}
                onChange={(e) =>
                  handleAllApparatusChange(
                    "target_sets",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                onFocus={handleFocus}
                disabled={isPending}
                min="1"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Esecuzione</label>
              <Select
                value={allApparatusPreset.target_execution}
                onValueChange={(val) =>
                  handleAllApparatusChange(
                    "target_execution",
                    val as DailyRoutinePreset["target_execution"],
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {executionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="mb-4 text-lg font-medium">
            Configurazione per Attrezzo
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attrezzo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantità</TableHead>
                <TableHead>Numero di salite</TableHead>
                <TableHead>Esecuzione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presets.map((preset, index) => (
                <TableRow key={preset.apparatus}>
                  <TableCell className="font-medium">
                    {preset.apparatus}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={preset.type}
                      onValueChange={(val) =>
                        handleChange(
                          index,
                          "type",
                          val as DailyRoutinePreset["type"],
                        )
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getTypeOptionsForApparatus(preset.apparatus).map(
                          (option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={preset.quantity}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "quantity",
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      onFocus={handleFocus}
                      disabled={isPending}
                      min="1"
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={preset.target_sets}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "target_sets",
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      onFocus={handleFocus}
                      disabled={isPending}
                      min="1"
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={preset.target_execution}
                      onValueChange={(val) =>
                        handleChange(
                          index,
                          "target_execution",
                          val as DailyRoutinePreset["target_execution"],
                        )
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {executionOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
      )}
    </div>
  );
}
