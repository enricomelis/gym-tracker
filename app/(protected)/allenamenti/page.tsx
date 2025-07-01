import ApparatusCard from "@/components/apparatus-card";
import { createClient } from "@/lib/supabase/server";
import { getWeek } from "date-fns";
import Link from "next/link";
import AthleteSelectSwitcher from "@/components/athlete-select-switcher";

const APPARATUS = ["FX", "PH", "SR", "VT", "PB", "HB"];

// Define types for TrainingSession and Join
type TrainingSession = {
  id: string;
  date: string;
  session_number: number;
};

type Join = {
  training_session_id: string;
  training_sessions: TrainingSession[];
};

type AthleteType = {
  id: string;
  first_name: string;
  last_name: string;
};

async function getTodaySessions(athleteId: string, todayStr: string) {
  const supabase = await createClient();
  // Find all training_sessions for today for this athlete
  const { data: joins } = await supabase
    .from("athlete_training_sessions")
    .select(`training_session_id, training_sessions (id, date, session_number)`)
    .eq("athlete_id", athleteId);

  // Filter for today's sessions
  const sessions = (joins ?? [])
    .flatMap((j: Join) => j.training_sessions)
    .filter((s: TrainingSession) => s && s.date === todayStr);
  // Sort by session_number
  sessions.sort(
    (a: TrainingSession, b: TrainingSession) =>
      a.session_number - b.session_number,
  );
  return sessions;
}

async function getApparatusSessionsWithSets(sessionId: string) {
  const supabase = await createClient();
  // Get all apparatus_sessions for this session
  const { data: apparatusSessions } = await supabase
    .from("apparatus_sessions")
    .select("*")
    .eq("training_session_id", sessionId);

  // For each apparatus_session, get its training_sets
  const apparatusWithSets = await Promise.all(
    APPARATUS.map(async (app) => {
      const session = (apparatusSessions ?? []).find(
        (a) => a.apparatus === app,
      );
      if (!session) return { apparatus: app, session: null, sets: [] };
      const { data: sets } = await supabase
        .from("training_sets")
        .select("*")
        .eq("apparatus_session_id", session.id);
      return { apparatus: app, session, sets: sets ?? [] };
    }),
  );
  return apparatusWithSets;
}

export default async function AllenamentiPage({
  searchParams,
}: {
  searchParams?: { athlete?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <div>Utente non trovato.</div>;

  // Prova a vedere se è un coach
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  let athlete: AthleteType | null = null;
  let athletes: AthleteType[] = [];

  if (coach && !coachError) {
    // Coach: carica lista atleti
    const { data: athletesData, error: athletesError } = await supabase
      .from("athletes")
      .select("id, first_name, last_name")
      .eq("current_coach_id", coach.id);
    if (athletesError) {
      return <div>Errore nel caricamento degli atleti.</div>;
    }
    athletes = athletesData || [];
    if (athletes.length === 0) {
      return (
        <div>
          Non hai ancora aggiunto nessun atleta. Aggiungine uno dalla pagina{" "}
          <Link href="/atleti" className="underline">
            Atleti
          </Link>
          .
        </div>
      );
    }
    // Scegli atleta selezionato da query param, o il primo
    const selectedAthleteId = searchParams?.athlete || athletes[0].id;
    athlete = athletes.find((a) => a.id === selectedAthleteId) || athletes[0];
  } else {
    // Se non è coach, prova come atleta
    const { data: athleteData } = await supabase
      .from("athletes")
      .select("id, first_name, last_name")
      .eq("supabase_id", user.id)
      .single();
    if (!athleteData) return <div>Atleta non trovato.</div>;
    athlete = athleteData;
  }

  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Get all today's sessions
  const sessions = await getTodaySessions(athlete.id, todayStr);
  if (sessions.length === 0) {
    return (
      <div>
        {athletes.length > 0 && (
          <div className="mb-4">
            <AthleteSelectSwitcher
              athletes={athletes}
              selectedAthleteId={athlete.id}
            />
          </div>
        )}
        Nessun allenamento trovato per oggi.
      </div>
    );
  }

  // For now, select the first session (add switcher later)
  const selectedSession = sessions[0];
  const apparatusData = await getApparatusSessionsWithSets(selectedSession.id);

  // Calcola weekNumber e year dalla data della sessione
  const weekNumber = getWeek(new Date(selectedSession.date), {
    weekStartsOn: 1,
  });
  const year = new Date(selectedSession.date).getFullYear();

  // Format date as DD/MM/YYYY
  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT");
  }

  return (
    <div>
      {athletes.length > 0 && (
        <div className="mb-4">
          <AthleteSelectSwitcher
            athletes={athletes}
            selectedAthleteId={athlete.id}
          />
        </div>
      )}
      <h1 className="mb-4 text-2xl font-bold">
        Allenamento di oggi - {formatDate(selectedSession.date)} (Allenamento
        {" #"}
        {selectedSession.session_number})
      </h1>
      {sessions.length > 1 && (
        <div className="mb-4">
          {/* TODO: session switcher */}
          <span>Seleziona sessione: </span>
          {sessions.map((s: TrainingSession) => (
            <span key={s.id} className="mr-2">
              Sessione {s.session_number}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {apparatusData.map((data) => (
          <ApparatusCard
            key={data.apparatus}
            apparatus={data.apparatus}
            session={data.session}
            sets={data.sets}
            trainingSessionId={selectedSession.id}
            athleteId={athlete.id}
            weekNumber={weekNumber}
            year={year}
          />
        ))}
      </div>
    </div>
  );
}
