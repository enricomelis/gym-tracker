"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type WeeklyGoalPreset = {
  id?: string;
  name: string;
  apparatus: "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
  macro: "Mixed" | "Competition";
  micro: "Increasing Load" | "Decreasing Load" | "Model" | "Competition Week";
  exercise_volume: number;
  dismount_volume: number;
  target_penalty: number;
  base_volume?: number | null;
  created_by?: string;
};

/**
 * Insert multiple weekly goal preset rows (one per apparatus) sharing the same preset name.
 */
export async function createWeeklyGoalPreset(presets: Omit<WeeklyGoalPreset, "id" | "created_by">[]) {
  const supabase = await createClient();

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not found" } as const;
  }

  // Fetch coach id linked to the current user
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (coachError || !coach) {
    return { error: "Coach profile not found" } as const;
  }

  const baseSchema = z.object({
    name: z.string().min(1),
    apparatus: z.enum(["FX", "PH", "SR", "VT", "PB", "HB"]),
    macro: z.enum(["Mixed", "Competition"]),
    micro: z.enum(["Increasing Load", "Decreasing Load", "Model", "Competition Week"]),
    exercise_volume: z.number().int().min(0),
    dismount_volume: z.number().int().min(0),
    target_penalty: z.number().min(0).max(10),
    base_volume: z.number().int().min(0).nullable().optional(),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid preset data" } as const;
  }

  // Attach created_by to each row
  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase.from("weekly_goal_presets").insert(rows).select();

  if (error) {
    console.error("Error creating weekly goal preset:", error);
    return { error: error.message } as const;
  }

  return { success: true, data } as const;
}

export async function getWeeklyGoalPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("weekly_goal_presets").select("*").order("name");
  if (error) {
    console.error("Error fetching weekly goal presets:", error);
    return [] as WeeklyGoalPreset[];
  }
  return data as WeeklyGoalPreset[];
} 