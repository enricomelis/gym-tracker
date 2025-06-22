"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type WeeklyGoal = {
  id?: string;
  athlete_id: string;
  week_number: number;
  year: number;
  apparatus: "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
  macro: "Mixed" | "Competition";
  micro: "Increasing Load" | "Decreasing Load" | "Model" | "Competition Week";
  exercise_volume: number;
  dismount_volume: number;
  target_penalty: number;
  base_volume?: number | null;
  camp?: string | null;
  competition_id?: string | null;
};

export async function getWeeklyGoals(
  athleteId: string,
  weekNumber: number,
  year: number,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apparatus_weekly_goals")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("week_number", weekNumber)
    .eq("year", year);

  if (error) {
    console.error("Error fetching weekly goals:", error);
    return [];
  }

  return data;
}

export async function upsertWeeklyGoals(goals: Omit<WeeklyGoal, "id">[]) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("apparatus_weekly_goals")
    .upsert(goals, { onConflict: "athlete_id,week_number,year,apparatus" })
    .select();

  if (error) {
    console.error("Error upserting weekly goals:", error);
    return { error: error.message };
  }

  revalidatePath("/settimanale");
  return { success: true, data };
}

export async function getGroupedWeeklyGoals(athleteId: string, year: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apparatus_weekly_goals")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("year", year);

  if (error) {
    console.error("Error fetching grouped weekly goals:", error);
    return {};
  }

  // Group goals by week number
  const groupedByWeek = data.reduce(
    (acc, goal) => {
      const week = goal.week_number;
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(goal);
      return acc;
    },
    {} as Record<number, WeeklyGoal[]>,
  );

  return groupedByWeek;
}

export async function deleteWeeklyGoals(
  athleteId: string,
  year: number,
  weekNumber: number,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("apparatus_weekly_goals")
    .delete()
    .eq("athlete_id", athleteId)
    .eq("year", year)
    .eq("week_number", weekNumber);

  if (error) {
    console.error("Error deleting weekly goals:", error);
    return { error: error.message };
  }

  revalidatePath("/settimanale");
  return { success: true };
}
