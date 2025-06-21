"use client";

import { deleteAthlete } from "@/lib/actions/athletes";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Athlete = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  registration_number: number;
  category: string;
};

export default function AthleteDetails({ athlete }: { athlete: Athlete }) {
  const { toast } = useToast();

  async function handleDelete() {
    const result = await deleteAthlete(athlete.id);
    if (result?.error) {
      toast({
        title: "Errore",
        description: `C'è stato un errore nell'eliminazione dell'atleta: ${result.error}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Successo",
        description: "Atleta eliminato con successo.",
        duration: 1000,
      });
    }
  }

  return (
    <div className="space-y-4">
      <p>
        <strong>Data di nascita:</strong> {formatDate(athlete.date_of_birth)}
      </p>
      <p>
        <strong>Matricola:</strong> {athlete.registration_number}
      </p>
      <p>
        <strong>Categoria:</strong> {athlete.category}
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            Elimina Atleta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L'atleta verrà eliminato
              definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
