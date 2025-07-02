"use client";

import { useTransition } from "react";
import { reactivateAthlete, type Athlete } from "@/lib/actions/athletes";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function InactiveAthletesList({
  athletes,
}: {
  athletes: Athlete[];
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleReactivate = (id: string) => {
    startTransition(async () => {
      const res = await reactivateAthlete(id);
      if (res?.error) {
        toast({
          title: "Errore",
          description: `Impossibile riattivare atleta: ${res.error}`,
          variant: "destructive",
        });
      } else {
        toast({ title: "Atleta riattivato", duration: 1000 });
      }
    });
  };

  if (athletes.length === 0) {
    return <p>Nessun atleta disattivato.</p>;
  }

  return (
    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
      {athletes.map((ath) => (
        <div
          key={ath.id}
          className="flex items-center justify-between rounded border p-2"
        >
          <span>
            {ath.first_name} {ath.last_name} ({ath.registration_number})
          </span>
          <Button
            size="sm"
            onClick={() => handleReactivate(ath.id)}
            disabled={isPending}
          >
            Riattiva
          </Button>
        </div>
      ))}
    </div>
  );
}
