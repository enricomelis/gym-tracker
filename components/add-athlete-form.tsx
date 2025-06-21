"use client";

import { createAthlete, type CreateAthleteState } from "@/lib/actions/athletes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { DialogClose } from "@radix-ui/react-dialog";
import { useActionState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Society = {
  id: string;
  name: string;
};

const initialState: CreateAthleteState = {};

export default function AddAthleteForm({
  societies,
}: {
  societies: Society[];
}) {
  const { toast } = useToast();
  const closeRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createAthlete, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Successo",
        description: "Atleta creato con successo.",
        duration: 3000,
      });
      closeRef.current?.click();
    }

    const hasErrors =
      state.errors?.general || state.errors?.registration_number;

    if (hasErrors) {
      if (state.errors?.general) {
        toast({
          title: "Errore",
          description: state.errors.general.join(", "),
          variant: "destructive",
        });
      }

      const timer = setTimeout(() => {
        closeRef.current?.click();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Data di Nascita</Label>
        <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registrationNumber">Numero di Matricola</Label>
        <Input
          id="registrationNumber"
          name="registrationNumber"
          type="number"
          required
          className={cn(
            state.errors?.registration_number && "border-destructive",
          )}
        />
        {state.errors?.registration_number && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.registration_number}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="societyId">Società di Appartenenza</Label>
        <Select name="societyId">
          <SelectTrigger>
            <SelectValue placeholder="Seleziona una società" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">Nessuna</SelectItem>
            {societies.map((society) => (
              <SelectItem key={society.id} value={society.id}>
                {society.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">
        Crea Atleta
      </Button>
      <DialogClose ref={closeRef} />
    </form>
  );
}
