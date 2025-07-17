"use client";

import { useState, useTransition } from "react";
import { createMacrocyclePreset } from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function MacrocyclePresetForm({
  onSave,
}: {
  onSave?: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
      toast({ title: "Nome Preset obbligatorio", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await createMacrocyclePreset([{ name: name.trim() }]);
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
        if (onSave) await onSave();
      }
    });
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Nome Preset Macrociclo</label>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isPending}
      />
      <Button onClick={handleSave} disabled={isPending || !name.trim()}>
        {isPending ? "Salvataggio..." : "Salva Preset"}
      </Button>
    </div>
  );
}
