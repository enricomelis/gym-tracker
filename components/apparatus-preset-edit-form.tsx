"use client";

import { useState, useTransition, useEffect } from "react";
import { updateApparatusPreset } from "@/lib/actions/presets";
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
import {
  APPARATUS_TYPES,
  EXECUTION_COEFF_TYPES,
  type Apparatus,
  type ExecutionCoeff,
  type NewApparatusPreset,
} from "@/lib/types";

interface ApparatusPresetEditFormProps {
  preset: NewApparatusPreset;
  onSave?: () => Promise<void> | void;
  onCancel?: () => void;
}

export default function ApparatusPresetEditForm({
  preset,
  onSave,
  onCancel,
}: ApparatusPresetEditFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(preset.name);
  const [apparatus, setApparatus] = useState<string>(preset.apparatus);
  const [quantity, setQuantity] = useState(preset.quantity);
  const [executionGrade, setExecutionGrade] = useState<string>(
    preset.execution_grade,
  );

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

    if (!apparatus) {
      toast({ title: "Attrezzo obbligatorio", variant: "destructive" });
      return;
    }

    if (!executionGrade) {
      toast({
        title: "Grado di esecuzione obbligatorio",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await updateApparatusPreset(preset.id, {
        name: name.trim(),
        apparatus: apparatus as Apparatus,
        quantity,
        execution_grade: executionGrade as ExecutionCoeff,
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
          description: "Preset attrezzo aggiornato con successo.",
          duration: 1500,
        });
        if (onSave) await onSave();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Preset</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Inserisci nome preset"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Attrezzo</label>
        <Select
          value={apparatus}
          onValueChange={setApparatus}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona attrezzo" />
          </SelectTrigger>
          <SelectContent>
            {APPARATUS_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "FX" && "Corpo Libero"}
                {type === "PH" && "Cavallo"}
                {type === "SR" && "Anelli"}
                {type === "VT" && "Volteggio"}
                {type === "PB" && "Parallele"}
                {type === "HB" && "Sbarra"}
                {type === "All" && "Tutti gli attrezzi"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Quantità</label>
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          disabled={isPending}
          placeholder="Inserisci quantità"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Grado di Esecuzione</label>
        <Select
          value={executionGrade}
          onValueChange={setExecutionGrade}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona grado" />
          </SelectTrigger>
          <SelectContent>
            {EXECUTION_COEFF_TYPES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Annulla
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending || !name.trim() || !apparatus || !executionGrade}
        >
          {isPending ? "Aggiornamento..." : "Aggiorna Preset"}
        </Button>
      </div>
    </div>
  );
}
