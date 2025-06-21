import AddAthleteForm from "@/components/add-athlete-form";
import AthleteDetails from "@/components/athlete-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAthletesForCoach, getSocieties } from "@/lib/actions/athletes";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AtletiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Utente non trovato.</p>;
  }

  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (coachError || !coach) {
    console.error("Error fetching coach:", coachError);
    return <p>Coach non trovato.</p>;
  }

  const athletes = await getAthletesForCoach(coach.id);
  const societies = await getSocieties();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestione Atleti</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Aggiungi Atleta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi un nuovo atleta</DialogTitle>
            </DialogHeader>
            <AddAthleteForm societies={societies} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {athletes.map((athlete) => (
          <Dialog key={athlete.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>
                    {athlete.first_name} {athlete.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Data di nascita:</strong>{" "}
                    {formatDate(athlete.date_of_birth)}
                  </p>
                  <p>
                    <strong>Matricola:</strong> {athlete.registration_number}
                  </p>
                  <p>
                    <strong>Categoria:</strong> {athlete.category}
                  </p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>
                  {athlete.first_name} {athlete.last_name}
                </DialogTitle>
              </DialogHeader>
              <AthleteDetails athlete={athlete} />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
