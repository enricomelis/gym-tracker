"use client";

import { useState, useTransition, useEffect } from "react";
import { createMacrocyclePreset } from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function MacrocyclePresetForm({
  onSave,
  onCancel,
}: {
  onSave?: () => Promise<void> | void;
  onCancel?: () => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [lengthInWeeks, setLengthInWeeks] = useState(1);

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

    if (lengthInWeeks < 1) {
      toast({
        title: "Durata deve essere almeno 1 settimana",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createMacrocyclePreset([
        {
          name: name.trim(),
          length_in_weeks: lengthInWeeks,
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
          description: "Preset macrociclo salvato.",
          duration: 1500,
        });
        setName("");
        setLengthInWeeks(1);
        if (onSave) await onSave();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Nome Preset Macrociclo</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Inserisci nome preset"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Durata in Settimane</label>
        <Input
          type="number"
          min="1"
          value={lengthInWeeks}
          onChange={(e) => setLengthInWeeks(parseInt(e.target.value) || 1)}
          onFocus={handleFocus}
          disabled={isPending}
          placeholder="Numero settimane"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending || !name.trim() || lengthInWeeks < 1}
        className="w-full"
      >
        {isPending ? "Salvataggio..." : "Salva Preset Macrociclo"}
      </Button>
    </div>
  );
}
