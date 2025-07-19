"use client";

import { useState, useTransition } from "react";
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
import { APPARATUS_TYPES, EXECUTION_COEFF_TYPES } from "@/lib/types";

export default function ApparatusPresetForm({
  onSave,
}: {
  onSave?: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [apparatus, setApparatus] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [executionGrade, setExecutionGrade] = useState<string>("");

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
          apparatus: apparatus as any,
          quantity,
          execution_grade: executionGrade as any,
        },
      ]);

      if (result && "error" in result) {
        toast({
          title: "Errore",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: "Preset attrezzo salvato.",
          duration: 1500,
        });
        setName("");
        setApparatus("");
        setQuantity(1);
        setExecutionGrade("");
        if (onSave) await onSave();
      }
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
    };
    return names[apparatus] || apparatus;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Preset</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
