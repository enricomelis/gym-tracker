"use client";

import { useState, useEffect } from "react";
import ApparatusCard from "@/components/apparatus-card";
import { getWeek } from "date-fns";
import AthleteSelectSwitcher from "@/components/athlete-select-switcher";
import AllenamentoSwitcher from "@/components/allenamento-switcher";
import { getBrowserClient } from "@/lib/supabase/client";
import type {
  ApparatusSession,
  TrainingSet,
} from "@/components/apparatus-card";
import { Athlete } from "@/lib/actions/athletes";

const APPARATUS = ["FX", "PH", "SR", "VT", "PB", "HB"];

type TrainingSession = {
  id: string;
  date: string;
  session_number: number;
};

type AthleteType = {
  id: string;
  first_name: string;
  last_name: string;
};

// Supabase join type between athlete_training_sessions and training_sessions
type AthleteTrainingSessionJoin = {
  training_session_id: string;
  training_sessions: TrainingSession[];
};

// Define a type representing the apparatus data structure returned by Supabase
type ApparatusData = {
  apparatus: string;
  session: ApparatusSession | null;
  sets: TrainingSet[];
};

async function fetchUserAndAthletes() {
  const supabase = getBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null };

  // Try as coach using RPC
  const { data: coachId } = await supabase.rpc("get_coach_id_rpc", {
    user_id: user.id,
  });

  if (coachId) {
    const { data: athletesData } = await supabase.rpc(
      "get_coach_athletes_rpc",
      {
        user_id: user.id,
        include_inactive: false,
      },
    );
    return {
      user,
      athletes:
        athletesData?.map((a: Athlete) => ({
          id: a.id,
          first_name: a.first_name,
          last_name: a.last_name,
        })) || [],
      coach: { id: coachId },
    };
  } else {
    // Try as athlete using RPC
    const { data: athleteProfile } = await supabase.rpc(
      "get_athlete_profile_rpc",
      {
        user_id: user.id,
      },
    );
    const athlete = athleteProfile?.[0];
    return {
      user,
      athlete: athlete
        ? {
            id: athlete.id,
            first_name: athlete.first_name,
            last_name: athlete.last_name,
          }
        : null,
      athletes: [],
    };
  }
}

async function fetchTodaySessions(athleteId: string, todayStr: string) {
  const supabase = getBrowserClient();
  const { data: joins } = await supabase
    .from("athlete_training_sessions")
    .select(`training_session_id, training_sessions (id, date, session_number)`)
    .eq("athlete_id", athleteId);

  const sessions = ((joins ?? []) as AthleteTrainingSessionJoin[])
    .flatMap((j) => j.training_sessions)
    .filter((s: TrainingSession) => s && s.date === todayStr);
  sessions.sort(
    (a: TrainingSession, b: TrainingSession) =>
      a.session_number - b.session_number,
  );
  return sessions;
}

async function fetchApparatusSessionsWithSets(
  sessionId: string,
): Promise<ApparatusData[]> {
  const supabase = getBrowserClient();
  const { data: apparatusSessions } = await supabase
    .from("apparatus_sessions")
    .select("*")
    .eq("training_session_id", sessionId);
  const apparatusWithSets = await Promise.all(
    APPARATUS.map(async (app) => {
      const session = (apparatusSessions ?? []).find(
        (a: { apparatus: string }) => a.apparatus === app,
      ) as ApparatusSession | undefined;

      if (!session) return { apparatus: app, session: null, sets: [] };
      const { data: sets } = await supabase
        .from("training_sets")
        .select("*")
        .eq("apparatus_session_id", session.id);
      return { apparatus: app, session, sets: (sets ?? []) as TrainingSet[] };
    }),
  );
  return apparatusWithSets;
}

export default function AllenamentiPage() {
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<AthleteType[]>([]);
  const [athlete, setAthlete] = useState<AthleteType | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [apparatusData, setApparatusData] = useState<ApparatusData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const userData = await fetchUserAndAthletes();
      if (!userData.user) {
        setError("Utente non trovato.");
        setLoading(false);
        return;
      }
      let athleteObj: AthleteType | null = null;
      let athletesArr: AthleteType[] = [];
      if (userData.coach) {
        athletesArr = userData.athletes;
        if (athletesArr.length === 0) {
          setAthletes([]);
          setError("Non hai ancora aggiunto nessun atleta.");
          setLoading(false);
          return;
        }
        athleteObj = athletesArr[0];
      } else if (userData.athlete) {
        athleteObj = userData.athlete;
      }
      setAthletes(athletesArr);
      setAthlete(athleteObj);
      if (!athleteObj) {
        setError("Atleta non trovato.");
        setLoading(false);
        return;
      }
      const sessionsArr = await fetchTodaySessions(athleteObj.id, todayStr);
      setSessions(sessionsArr);
      if (sessionsArr.length === 0) {
        setLoading(false);
        return;
      }
      setSelectedSessionId(sessionsArr[0].id);
      const apparatusArr = await fetchApparatusSessionsWithSets(
        sessionsArr[0].id,
      );
      setApparatusData(apparatusArr);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function updateApparatus() {
      if (!selectedSessionId) return;
      setLoading(true);
      const apparatusArr =
        await fetchApparatusSessionsWithSets(selectedSessionId);
      setApparatusData(apparatusArr);
      setLoading(false);
    }
    if (selectedSessionId) updateApparatus();
  }, [selectedSessionId]);

  // Handler for athlete change
  const handleAthleteChange = async (athleteId: string) => {
    setLoading(true);
    setError(null);
    const newAthlete = athletes.find((a) => a.id === athleteId) || null;
    setAthlete(newAthlete);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const sessionsArr = await fetchTodaySessions(athleteId, todayStr);
    setSessions(sessionsArr);
    if (sessionsArr.length > 0) {
      setSelectedSessionId(sessionsArr[0].id);
      const apparatusArr = await fetchApparatusSessionsWithSets(
        sessionsArr[0].id,
      );
      setApparatusData(apparatusArr);
    } else {
      setSelectedSessionId(null);
      setApparatusData([]);
    }
    setLoading(false);
  };

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>{error}</div>;
  if (!athlete) return <div>Atleta non trovato.</div>;
  if (sessions.length === 0) {
    return (
      <div>
        {athletes.length > 0 && (
          <div className="mb-4">
            <AthleteSelectSwitcher
              athletes={athletes}
              selectedAthleteId={athlete.id}
              onChange={handleAthleteChange}
            />
          </div>
        )}
        Nessun allenamento trovato per oggi.
      </div>
    );
  }
  const selectedSession =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const weekNumber = getWeek(new Date(selectedSession.date), {
    weekStartsOn: 1,
  });
  const year = new Date(selectedSession.date).getFullYear();
  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT");
  }
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        Allenamento di oggi - {formatDate(selectedSession.date)} (Allenamento #
        {selectedSession.session_number})
      </h1>
      {(athletes.length > 0 || sessions.length > 1) && (
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {athletes.length > 0 && (
            <AthleteSelectSwitcher
              athletes={athletes}
              selectedAthleteId={athlete.id}
              onChange={handleAthleteChange}
            />
          )}
          {sessions.length > 1 && (
            <AllenamentoSwitcher
              sessions={sessions}
              selectedSessionId={selectedSessionId!}
              onChange={setSelectedSessionId}
            />
          )}
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
