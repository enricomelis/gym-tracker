import { getWeeklyGoals } from "@/lib/actions/weekly-planning";
import { getDailyTrainings } from "@/lib/actions/daily-planning";
import { createClient } from "@/lib/supabase/server";
import { getWeek, getYear } from "date-fns";
import { Button } from "@/components/ui/button";

export default async function AthleteDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Utente non trovato.</div>;
  }

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id, first_name, last_name")
    .eq("supabase_id", user.id)
    .single();

  if (athleteError || !athlete) {
    return <div>Atleta non trovato.</div>;
  }

  const today = new Date();
  const weekNumber = getWeek(today, { weekStartsOn: 1 });
  const year = getYear(today);
  const month = today.getMonth() + 1;
  const todayStr = today.toISOString().slice(0, 10);

  const [weeklyGoals, dailyTrainings] = await Promise.all([
    getWeeklyGoals(athlete.id, weekNumber, year),
    getDailyTrainings(athlete.id, year, month),
  ]);
  const todaySession = dailyTrainings.find((s) => s.date === todayStr);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">
        Dashboard Allenamento Giornaliero
      </h1>
      <div className="mb-4 flex items-center gap-4">
        <span className="font-semibold">Atleta:</span> {athlete.first_name}{" "}
        {athlete.last_name}
        <span className="font-semibold">Settimana:</span> {weekNumber}
        <a href="/allenamenti">
          <Button size="sm" className="ml-2">
            Vai agli allenamenti
          </Button>
        </a>
      </div>
      <div className="flex gap-8">
        {/* Weekly Programming */}
        <div className="flex-1 border-r pr-8">
          <h2 className="mb-2 text-xl font-semibold">
            Programmazione Settimanale Corrente
          </h2>
          {weeklyGoals.length === 0 ? (
            <p>Nessuna programmazione trovata per questa settimana.</p>
          ) : (
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Attrezzo</th>
                  <th className="border px-2 py-1">Volume</th>
                  <th className="border px-2 py-1">Uscita / Base</th>
                  <th className="border px-2 py-1">Penalità</th>
                  <th className="w-28 border px-1 py-1">Macro</th>
                  <th className="w-28 border px-1 py-1">Micro</th>
                </tr>
              </thead>
              <tbody>
                {weeklyGoals.map((goal) => (
                  <tr key={goal.apparatus}>
                    <td className="border px-2 py-1">{goal.apparatus}</td>
                    <td className="border px-2 py-1">{goal.exercise_volume}</td>
                    <td className="border px-2 py-1">{goal.dismount_volume}</td>
                    <td className="border px-2 py-1">{goal.target_penalty}</td>
                    <td className="w-28 border px-1 py-1">{goal.macro}</td>
                    <td className="w-28 border px-1 py-1">{goal.micro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Daily Data */}
        <div className="flex-1 pl-8">
          <h2 className="mb-2 text-xl font-semibold">
            Dati Allenamento di Oggi
          </h2>
          {!todaySession ? (
            <p>Nessun dato inserito per oggi.</p>
          ) : todaySession.routines.length === 0 ? (
            <p>Nessuna routine inserita per questa sessione.</p>
          ) : (
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Attrezzo</th>
                  <th className="border px-2 py-1">Tipo</th>
                  <th className="border px-2 py-1">Quantità</th>
                  <th className="border px-2 py-1">N° Salite</th>
                  <th className="border px-2 py-1">Esecuzione</th>
                </tr>
              </thead>
              <tbody>
                {todaySession.routines.map((routine, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{routine.apparatus}</td>
                    <td className="border px-2 py-1">{routine.type}</td>
                    <td className="border px-2 py-1">{routine.quantity}</td>
                    <td className="border px-2 py-1">{routine.target_sets}</td>
                    <td className="border px-2 py-1">
                      {routine.target_execution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
