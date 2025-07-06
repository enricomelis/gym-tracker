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
import { Athlete, getSocieties } from "@/lib/actions/athletes";
import { getServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { getUserRole } from "@/lib/role";
import InactiveAthletesList from "@/components/inactive-athletes-list";

export default async function AtletiPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Utente non trovato.</p>;
  }

  const role = await getUserRole(supabase, user.id);

  if (role !== "coach") {
    return <p>Solo i tecnici possono gestire la pagina atleti.</p>;
  }

  const { data: coachId, error: coachError } = await supabase.rpc(
    "get_coach_id_rpc",
    { user_id: user.id },
  );

  if (coachError || !coachId) {
    console.error("Error fetching coach:", coachError);
    return <p>Coach non trovato.</p>;
  }

  const { data: athletes, error: athletesError } = await supabase.rpc(
    "get_coach_athletes_rpc",
    { p_coach_id: coachId as string, p_active_only: true },
  );

  if (athletesError || !athletes) {
    return <div>Errore nel caricamento degli atleti.</div>;
  }
  const { data: inactiveAthletes } = await supabase.rpc(
    "get_coach_athletes_rpc",
    { p_coach_id: coachId as string, p_active_only: false },
  );

  const societies = await getSocieties();
  const filteredInactiveAthletes =
    inactiveAthletes?.filter((athlete: Athlete) => !athlete.is_active) || [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Gestione Atleti</h1>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Atleti Disattivati</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Atleti Disattivati</DialogTitle>
              </DialogHeader>
              <InactiveAthletesList athletes={filteredInactiveAthletes} />
            </DialogContent>
          </Dialog>

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
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {athletes.map((athlete: Athlete) => (
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
                    <strong>Tessera:</strong> {athlete.registration_number}
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
