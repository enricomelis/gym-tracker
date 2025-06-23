"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  EnrichedTrainingSession,
  saveDailyRoutine,
  deleteDailyTraining,
} from "@/lib/actions/daily-planning";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

const APPARATUS_TYPES = ["FX", "PH", "SR", "VT", "PB", "HB"] as const;
const ROUTINE_TYPES = [
  "I+",
  "I",
  "P",
  "C",
  "U",
  "Std",
  "G",
  "S",
  "B",
  "D",
] as const;
const EXECUTION_TYPES = ["A+", "A", "B+", "B", "C+", "C"] as const;

const routineSchema = z.object({
  apparatus: z.enum(APPARATUS_TYPES),
  type: z.enum(ROUTINE_TYPES),
  quantity: z.coerce.number().min(1, "La quantità è richiesta"),
  target_sets: z.coerce.number().min(1, "Le salite sono richieste"),
  target_execution: z.enum(EXECUTION_TYPES),
});

const formSchema = z.object({
  date: z.string().min(1, "La data è richiesta"),
  session_number: z.coerce
    .number()
    .min(1, "Il numero della sessione è richiesto"),
  routines: z.array(routineSchema),
});

type FormData = z.infer<typeof formSchema>;

interface DailyRoutineFormProps {
  isOpen: boolean;
  onClose: () => void;
  trainingData: EnrichedTrainingSession | null;
  athleteId: string;
  year: number;
  month: number;
}

export default function DailyRoutineForm({
  isOpen,
  onClose,
  trainingData,
  athleteId,
  year,
  month,
}: DailyRoutineFormProps) {
  const { toast } = useToast();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      session_number: 1,
      routines: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "routines",
  });

  useEffect(() => {
    if (isOpen && trainingData) {
      reset({
        date: trainingData.date.split("T")[0],
        session_number: trainingData.session_number,
        routines: trainingData.routines,
      });
    } else if (isOpen) {
      reset({
        date: new Date(year, month - 1, 1).toISOString().split("T")[0],
        session_number: 1,
        routines: [],
      });
    }
  }, [isOpen, trainingData, reset, year, month]);

  const onSubmit = async (data: FormData) => {
    const parsedData = formSchema.safeParse(data);
    if (!parsedData.success) {
      toast({
        title: "Errore di validazione",
        description:
          "Controlla i dati inseriti. Tutti i campi sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...parsedData.data,
      athlete_id: athleteId,
    };
    const result = await saveDailyRoutine(payload);
    if (result.error) {
      toast({
        title: "Errore",
        description: `Impossibile salvare l&apos;allenamento: ${result.error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Allenamento salvato con successo.",
      });
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!trainingData) return;
    const result = await deleteDailyTraining(trainingData.id);
    if (result.error) {
      toast({
        title: "Errore",
        description: `Impossibile eliminare l&apos;allenamento: ${result.error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Allenamento eliminato con successo.",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {trainingData ? "Modifica Allenamento" : "Nuovo Allenamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" {...register("date")} />
            </div>
            <div>
              <Label htmlFor="session_number">Sessione N.</Label>
              <Input
                id="session_number"
                type="number"
                {...register("session_number")}
              />
            </div>
          </div>

          <h3 className="border-t pt-4 text-lg font-semibold">Esercizi</h3>
          <div className="max-h-64 space-y-4 overflow-y-auto pr-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 items-center gap-2 rounded-md border p-2 md:grid-cols-6"
              >
                <Controller
                  name={`routines.${index}.apparatus`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Attrezzo" />
                      </SelectTrigger>
                      <SelectContent>
                        {APPARATUS_TYPES.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  name={`routines.${index}.type`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROUTINE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  {...register(`routines.${index}.quantity`)}
                  placeholder="Quantità"
                  type="number"
                />
                <Input
                  {...register(`routines.${index}.target_sets`)}
                  placeholder="N. Salite"
                  type="number"
                />
                <Controller
                  name={`routines.${index}.target_execution`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Esec." />
                      </SelectTrigger>
                      <SelectContent>
                        {EXECUTION_TYPES.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                apparatus: "FX",
                type: "I",
                quantity: 1,
                target_sets: 1,
                target_execution: "A",
              })
            }
          >
            Aggiungi Esercizio
          </Button>

          <DialogFooter className="pt-4">
            {trainingData && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Elimina
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
