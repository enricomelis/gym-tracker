"use server";

import { createClient } from "@/lib/supabase/server";
import { getWeek } from "date-fns";
import { z } from "zod";

// TODO: Define types for daily planning data
// TODO: Implement getDailyRoutine function
// TODO: Implement saveDailyRoutine function
// TODO: Implement deleteDailyRoutine function

export type DailyRoutine = {
  id?: string;
  session_id: string;
  apparatus: "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
  type: "I+" | "I" | "P" | "C" | "U" | "Std" | "G" | "S" | "B" | "D";
  quantity: number;
  target_sets: number; // n_salite
  target_execution: "A+" | "A" | "B+" | "B" | "C+" | "C";
};

export type TrainingSession = {
  id: string;
  date: string;
  session_number: number;
  // This is the raw type from the DB
  daily_routines: DailyRoutine[];
};

export type EnrichedTrainingSession = {
  id: string;
  date: string;
  session_number: number;
  week_number: number;
  total_volume: number;
  average_intensity: number;
  routines: DailyRoutine[];
};

const volumeMultipliers: Record<DailyRoutine["type"], number> = {
  "I+": 1.15,
  I: 1.0,
  P: 0.5,
  C: 0.33,
  U: 1.0, // This will be handled separately
  Std: 0,
  G: 0,
  S: 0,
  B: 0,
  D: 0,
};

const executionPenaltyMap: Record<DailyRoutine["target_execution"], number> = {
  "A+": 1.4,
  A: 1.6,
  "B+": 1.8,
  B: 2.0,
  "C+": 2.2,
  C: 2.5,
};

export async function getDailyTrainings(
  athleteId: string,
  year: number,
  month: number,
): Promise<EnrichedTrainingSession[]> {
  const supabase = await createClient();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const startDateStr = startDate.toISOString().slice(0, 10);
  const endDateStr = endDate.toISOString().slice(0, 10);

  const { data: joins, error: sessionsError } = await supabase
    .from("athlete_training_sessions")
    .select(
      `
      training_sessions (
        id,
        date,
        session_number,
        daily_routines (*)
      )
    `,
    )
    .eq("athlete_id", athleteId)
    .gte("training_sessions.date", startDateStr)
    .lte("training_sessions.date", endDateStr);

  if (sessionsError) {
    console.error("Error fetching training sessions:", sessionsError);
    return [];
  }

  // Definisco il tipo per la join
  type JoinResult = { training_sessions: TrainingSession[] };
  const sessions = ((joins as JoinResult[]) ?? []).flatMap(
    (join) => join.training_sessions ?? [],
  );

  // Fetch all weekly goals for the given year and athlete to calculate volume
  const { data: weeklyGoals, error: weeklyGoalsError } = await supabase
    .from("apparatus_weekly_goals")
    .select("week_number, apparatus, exercise_volume, dismount_volume")
    .eq("athlete_id", athleteId)
    .eq("year", year);

  if (weeklyGoalsError) {
    console.error("Error fetching weekly goals:", weeklyGoalsError);
    return [];
  }

  const weeklyGoalsMap = new Map<
    string,
    { exercise: number; dismount: number }
  >();
  for (const goal of weeklyGoals) {
    const key = `${goal.week_number}-${goal.apparatus}`;
    weeklyGoalsMap.set(key, {
      exercise: goal.exercise_volume,
      dismount: goal.dismount_volume,
    });
  }

  const trainingSessions: EnrichedTrainingSession[] = sessions.map(
    (session) => {
      const weekNumber = getWeek(new Date(session.date), { weekStartsOn: 1 });

      let totalVolume = 0;
      const routineIntensities: number[] = [];

      for (const routine of session.daily_routines) {
        const weeklyGoalKey = `${weekNumber}-${routine.apparatus}`;
        const weeklyGoal = weeklyGoalsMap.get(weeklyGoalKey);

        if (!weeklyGoal) continue;

        const routineBaseVolume =
          routine.type === "U" ? weeklyGoal.dismount : weeklyGoal.exercise;

        const multiplier =
          volumeMultipliers[routine.type as keyof typeof volumeMultipliers] ??
          0;
        const penalty =
          executionPenaltyMap[
            routine.target_execution as keyof typeof executionPenaltyMap
          ];
        const CoE = (10 - penalty) / 10;

        const volume = routineBaseVolume * multiplier * routine.quantity;
        totalVolume += volume;

        const sets = routine.target_sets;
        const intensity = sets > 0 ? (volume * CoE) / sets : 0;
        routineIntensities.push(intensity);
      }

      const averageIntensity =
        routineIntensities.length > 0
          ? routineIntensities.reduce((a, b) => a + b, 0) /
            routineIntensities.length
          : 0;

      return {
        id: session.id,
        date: session.date,
        session_number: session.session_number,
        week_number: weekNumber,
        total_volume: Math.round(totalVolume),
        average_intensity: parseFloat(averageIntensity.toFixed(2)),
        routines: session.daily_routines,
      };
    },
  );

  return trainingSessions;
}

const dailyRoutineSchema = z.object({
  apparatus: z.enum(["FX", "PH", "SR", "VT", "PB", "HB"]),
  type: z.enum(["I+", "I", "P", "C", "U", "Std", "G", "S", "B", "D"]),
  quantity: z.coerce.number().min(1),
  target_sets: z.coerce.number().min(1),
  target_execution: z.enum(["A+", "A", "B+", "B", "C+", "C"]),
});

const formSchema = z.object({
  session_id: z.string().uuid(),
  routines: z.array(dailyRoutineSchema),
});

export async function saveDailyRoutine(formData: unknown) {
  const supabase = await createClient();
  const parsed = formSchema.safeParse(formData);

  if (!parsed.success) {
    console.error("Invalid form data", parsed.error);
    return { error: "Invalid form data" };
  }

  const { session_id, routines } = parsed.data;

  try {
    // Recupera athlete_id dalla join table
    const { data: join, error: joinError } = await supabase
      .from("athlete_training_sessions")
      .select("athlete_id")
      .eq("training_session_id", session_id)
      .single();

    if (joinError || !join) {
      return { error: "Athlete for session not found" };
    }

    const athlete_id = join.athlete_id;

    // Delete existing routines for this session
    const { error: deleteError } = await supabase
      .from("daily_routines")
      .delete()
      .eq("session_id", session_id);

    if (deleteError) {
      console.error("Error deleting old routines:", deleteError);
      return { error: "Could not update routines" };
    }

    if (routines.length > 0) {
      const routinesToInsert = routines.map((routine) => ({
        ...routine,
        session_id,
        athlete_id,
      }));

      const { error: insertError } = await supabase
        .from("daily_routines")
        .insert(routinesToInsert);

      if (insertError) {
        console.error("Error inserting routines:", insertError);
        return { error: "Could not insert routines" };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving daily routine:", error);
    return { error: "An error occurred while saving the routine" };
  }
}

export async function createEmptyTrainingSession(
  athleteId: string,
  date: string,
  sessionNumber: number,
) {
  const supabase = await createClient();

  const dateObj = new Date(date);
  const week_number = getWeek(dateObj, { weekStartsOn: 1 });
  const year = dateObj.getFullYear();

  // 1. Crea la sessione
  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      date,
      session_number: sessionNumber,
      week_number,
      year,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Error creating empty session:", error);
    return { error: "Could not create training session" };
  }

  // 2. Crea la join
  const { error: joinError } = await supabase
    .from("athlete_training_sessions")
    .insert({
      athlete_id: athleteId,
      training_session_id: data.id,
    });

  if (joinError) {
    console.error("Error creating join:", joinError);
    return { error: "Could not link athlete to session" };
  }

  return { success: true };
}

export async function deleteDailyTraining(sessionId: string) {
  const supabase = await createClient();

  // 1. Elimina tutte le daily routines associate con la sessione
  await supabase.from("daily_routines").delete().eq("session_id", sessionId);

  // 2. Elimina la join con l'atleta
  await supabase
    .from("athlete_training_sessions")
    .delete()
    .eq("training_session_id", sessionId);

  // 3. Elimina la sessione
  const { error: sessionError } = await supabase
    .from("training_sessions")
    .delete()
    .eq("id", sessionId);

  if (sessionError) {
    console.error("Error deleting training session:", sessionError);
    return { error: "Could not delete training session" };
  }

  return { success: true };
}

// Backend logic for daily planning is complete.
// Next steps:
// 1. Create the UI page in `app/(protected)/giornaliera/page.tsx`.
// 2. Create the form component for adding/editing daily routines.
