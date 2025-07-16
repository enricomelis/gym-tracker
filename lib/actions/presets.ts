"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  WeeklyGoalPreset,
  MicrocyclePreset,
  TrainingSessionPreset,
  DailyRoutinePreset,
} from "@/lib/types";
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

export async function getTrainingSessionPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("training_sessions_presets")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching training session presets:", error);
    return [] as TrainingSessionPreset[];
  }
  return data as TrainingSessionPreset[];
}

export async function createTrainingSessionPreset(
  presets: Omit<TrainingSessionPreset, "id" | "created_by">[],
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
    week_day: z.number().int().min(0).max(6),
    fx_preset_id: z.string().uuid().nullable(),
    ph_preset_id: z.string().uuid().nullable(),
    sr_preset_id: z.string().uuid().nullable(),
    vt_preset_id: z.string().uuid().nullable(),
    pb_preset_id: z.string().uuid().nullable(),
    hb_preset_id: z.string().uuid().nullable(),
  });

  const parsed = z.array(baseSchema).safeParse(presets);

  if (!parsed.success) {
    return { error: "Invalid training session preset data" } as const;
  }

  const { data, error } = await supabase
    .from("training_sessions_presets")
    .insert(parsed.data)
    .select();

  if (error) {
    console.error("Error creating training session preset:", error);
    return { error: error.message } as const;
  }

  return { success: true, data } as const;
}

export async function getMicrocyclePresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("microcycles_presets")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching microcycle presets:", error);
    return [] as MicrocyclePreset[];
  }
  return data as MicrocyclePreset[];
}
export async function createMicrocyclePreset(
  presets: Omit<
    MicrocyclePreset,
    "id" | "created_by" | "created_at" | "updated_at"
  >[],
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
    allenamento_1: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    allenamento_2: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    allenamento_3: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    allenamento_4: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    allenamento_5: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    allenamento_6: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    allenamento_7: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    macrocycle_id: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
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

  return { success: true, data } as const;
}

export async function getDailyRoutinePresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_routine_presets")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching daily routine presets:", error);
    return [] as DailyRoutinePreset[];
  }
  return data as DailyRoutinePreset[];
}
