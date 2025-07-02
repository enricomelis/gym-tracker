"use client";

import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";

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

const routineSchema = z
  .object({
    apparatus: z.enum(APPARATUS_TYPES),
    type: z.enum(ROUTINE_TYPES),
    quantity: z.coerce.number().min(1, "La quantità è richiesta"),
    target_sets: z.coerce.number().min(1, "Le salite sono richieste"),
    target_execution: z.enum(EXECUTION_TYPES),
  })
  .refine((data) => data.target_sets >= data.quantity, {
    message: "Le salite devono essere uguali o superiori alla quantità",
    path: ["target_sets"],
  });

const formSchema = z.object({
  session_id: z.string().uuid(),
  routines: z.array(routineSchema),
});

type FormData = z.infer<typeof formSchema>;

interface DailyRoutineFormProps {
  isOpen: boolean;
  onClose: (shouldRefetch?: boolean) => void;
  trainingData: EnrichedTrainingSession | null;
}

export default function DailyRoutineForm({
  isOpen,
  onClose,
  trainingData,
}: DailyRoutineFormProps) {
  const { toast } = useToast();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      session_id: "",
      routines: [],
    },
  });

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "routines",
  });

  useEffect(() => {
    if (isOpen && trainingData) {
      reset({
        session_id: trainingData.id,
        routines: trainingData.routines || [],
      });
    }
  }, [isOpen, trainingData, reset]);

  const onSubmit = async (data: FormData) => {
    if (!trainingData) return;

    const payload = {
      session_id: trainingData.id,
      routines: data.routines,
    };

    const result = await saveDailyRoutine(payload);
    if (result.error) {
      toast({
        title: "Errore",
        description: `Impossibile salvare le modifiche: ${result.error}`,
        variant: "destructive",
        duration: 1000,
      });
    } else {
      toast({
        title: "Successo",
        description: "Allenamento salvato con successo.",
        duration: 1000,
      });
      onClose(true);
    }
  };

  const handleDelete = async () => {
    if (!trainingData) return;
    const result = await deleteDailyTraining(trainingData.id);
    if (result.error) {
      toast({
        title: "Errore",
        description: `Impossibile eliminare l'allenamento: ${result.error}`,
        variant: "destructive",
        duration: 1000,
      });
    } else {
      toast({
        title: "Successo",
        description: "Allenamento eliminato con successo.",
        duration: 1000,
      });
      onClose(true);
    }
  };

  if (!trainingData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Modifica Allenamento -{" "}
            {format(new Date(trainingData.date), "EEEE, d MMMM", {
              locale: it,
            })}{" "}
            (Sessione {trainingData.session_number})
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="border-t pt-4 text-lg font-semibold">Esercizi</h3>
          <div className="max-h-64 space-y-4 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 items-center gap-2 p-2 md:grid-cols-6">
              <Label className="font-semibold">Attrezzo</Label>
              <Label className="font-semibold">Tipo</Label>
              <Label className="font-semibold">Quantità</Label>
              <Label className="font-semibold">N. Salite</Label>
              <Label className="font-semibold">Esecuzione</Label>
            </div>
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
                  {...control.register(`routines.${index}.quantity`)}
                  placeholder="Quantità"
                  type="number"
                  onFocus={handleFocus}
                />
                <Input
                  {...control.register(`routines.${index}.target_sets`)}
                  placeholder="N. Salite"
                  type="number"
                  onFocus={handleFocus}
                  className={
                    errors.routines?.[index]?.target_sets
                      ? "border-red-500 focus-visible:ring-red-500"
                      : undefined
                  }
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
                {errors.routines?.[index]?.target_sets && (
                  <div className="col-span-full text-xs text-red-600">
                    {errors.routines[index]?.target_sets?.message}
                  </div>
                )}
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
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Elimina Allenamento
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
