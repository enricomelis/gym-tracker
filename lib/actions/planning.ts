"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

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
  
  // Use RPC function to get weekly goals with proper RLS handling
  const { data, error } = await supabase.rpc("get_weekly_goals_rpc", {
    p_athlete_id: athleteId,
    p_week_number: weekNumber,
    p_year: year,
  });

  if (error) {
    console.error("Error fetching weekly goals:", error);
    return [];
  }

  return data;
}

export async function upsertWeeklyGoals(goals: Omit<WeeklyGoal, "id">[]) {
  const supabase = await createClient();

  const goalSchema = z.object({
    athlete_id: z.string().uuid(),
    week_number: z.number().int().min(1).max(52),
    year: z.number().int().gte(2020).lte(2100),
    apparatus: z.enum(["FX", "PH", "SR", "VT", "PB", "HB"]),
    macro: z.enum(["Mixed", "Competition"]),
    micro: z.enum([
      "Increasing Load",
      "Decreasing Load",
      "Model",
      "Competition Week",
    ]),
    exercise_volume: z.number().int().min(0),
    dismount_volume: z.number().int().min(0),
    target_penalty: z.number().min(0).max(10),
    base_volume: z.number().int().min(0).nullable().optional(),
    camp: z.string().nullable().optional(),
    competition_id: z.string().uuid().nullable().optional(),
  });

  const parsed = z.array(goalSchema).safeParse(goals);

  if (!parsed.success) {
    return { error: "Invalid weekly goals data" };
  }

  const { data, error } = await supabase
    .from("apparatus_weekly_goals")
    .upsert(parsed.data, {
      onConflict: "athlete_id,week_number,year,apparatus",
    })
    .select();

  if (error) {
    console.error("Error upserting weekly goals:", error);
    return { error: error.message };
  }

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

  return { success: true };
}

export async function getWeeklyGoalForApparatus(
  athleteId: string,
  apparatus: string,
  weekNumber: number,
  year: number,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apparatus_weekly_goals")
    .select("*")
    .eq("athlete_id", athleteId)
    .eq("apparatus", apparatus)
    .eq("week_number", weekNumber)
    .eq("year", year)
    .maybeSingle();
  if (error) {
    console.error("Error fetching weekly goal for apparatus:", error);
    return null;
  }
  return data;
}
