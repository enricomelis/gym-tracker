"use client";

import { useState, useTransition, useEffect } from "react";
import { createApparatusPreset } from "@/lib/actions/presets";
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
import {
  generatePresetName,
  formatApparatusName,
} from "@/lib/utils/preset-naming";

export default function ApparatusPresetForm({
  onSave,
  onCancel,
  sessionName,
  apparatusType,
}: {
  onSave?: (newPreset?: NewApparatusPreset) => Promise<void> | void;
  onCancel?: () => void;
  sessionName?: string;
  apparatusType?: string;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [apparatus, setApparatus] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [executionGrade, setExecutionGrade] = useState<string>("");

  // Generate automatic name when sessionName and apparatusType are provided
  useEffect(() => {
    if (sessionName && apparatusType) {
      const apparatusName = formatApparatusName(apparatusType);
      const autoName = generatePresetName.apparatus(sessionName, apparatusName);
      setName(autoName);
      setApparatus(apparatusType);
    }
  }, [sessionName, apparatusType]);

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

    if (quantity < 1) {
      toast({ title: "Quantità deve essere almeno 1", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await createApparatusPreset([
        {
          name: name.trim(),
          apparatus: apparatus as Apparatus,
          quantity,
          execution_grade: executionGrade as ExecutionCoeff,
        },
      ]);

      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else if (result && result.data && result.data[0]) {
        toast({
          title: "Successo",
          description: "Preset attrezzo salvato.",
          duration: 1500,
        });
        setName("");
        setApparatus("");
        setQuantity(1);
        setExecutionGrade("");
        if (onSave) await onSave(result.data[0]);
      } else {
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
            {APPARATUS_TYPES.map((app) => (
              <SelectItem key={app} value={app}>
                {formatApparatusName(app)}
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
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Quantità"
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
            <SelectValue placeholder="Seleziona grado esecuzione" />
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

      <Button
        onClick={handleSave}
        disabled={isPending || !name.trim() || !apparatus || !executionGrade}
        className="w-full"
      >
        {isPending ? "Salvataggio..." : "Salva Preset Attrezzo"}
      </Button>
    </div>
  );
}
