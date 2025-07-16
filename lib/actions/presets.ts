"use server";

import { createClient } from "@/lib/supabase/server";
import { type WeeklyGoalPreset } from "@/lib/types";
import { Coach } from "@/lib/types";
import { z } from "zod";

/**
 * Insert multiple weekly goal preset rows (one per apparatus) sharing the same preset name.
 */
export async function createWeeklyGoalPreset(
  presets: Omit<WeeklyGoalPreset, "id" | "created_by">[],
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not found" } as const;
  }

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
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid preset data" } as const;
  }

  // Attach created_by to each row
  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("weekly_goal_presets")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating weekly goal preset:", error);
    return { error: error.message } as const;
  }

  return { success: true, data } as const;
}

export async function getWeeklyGoalPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weekly_goal_presets")
    .select("*")
    .order("name");
  if (error) {
    console.error("Error fetching weekly goal presets:", error);
    return [] as WeeklyGoalPreset[];
  }
  return data as WeeklyGoalPreset[];
}

export type DailyRoutinePreset = {};

export type TrainingSessionPreset = {
  id: string;
  name: string;
  created_by: string;
  week_day: number;
  fx_preset_id: DailyRoutinePreset | null;
  ph_preset_id: DailyRoutinePreset | null;
  sr_preset_id: DailyRoutinePreset | null;
  vt_preset_id: DailyRoutinePreset | null;
  pb_preset_id: DailyRoutinePreset | null;
  hb_preset_id: DailyRoutinePreset | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MacrocyclePreset = {
  id: string;
  name: string;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MicrocyclePreset = {
  id: string;
  name: string;
  allenamento_1: TrainingSessionPreset;
  allenamento_2: TrainingSessionPreset;
  allenamento_3: TrainingSessionPreset;
  allenamento_4: TrainingSessionPreset;
  allenamento_5: TrainingSessionPreset;
  allenamento_6: TrainingSessionPreset;
  allenamento_7: TrainingSessionPreset;
  macrocycle_id: MacrocyclePreset | null;
  created_by: Coach;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function createMicrocyclePreset(
  presets: Omit<MicrocyclePreset, "id" | "created_by">[],
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not found" } as const;
  }

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
    allenamento_1: z.string().uuid().nullable(),
    allenamento_2: z.string().uuid().nullable(),
    allenamento_3: z.string().uuid().nullable(),
    allenamento_4: z.string().uuid().nullable(),
    allenamento_5: z.string().uuid().nullable(),
    allenamento_6: z.string().uuid().nullable(),
    allenamento_7: z.string().uuid().nullable(),
    macrocycle_id: z.string().uuid().nullable(),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid microcycle preset data" } as const;
  }

  const { data, error } = await supabase
    .from("microcycles_presets")
    .insert(parsed.data)
    .select();
  if (error) {
    console.error("Error creating microcycle preset:", error);
    return { error: error.message } as const;
  }
}
