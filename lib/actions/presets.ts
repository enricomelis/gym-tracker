"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  WeeklyGoalPreset,
  MicrocyclePreset,
  TrainingSessionPreset,
  DailyRoutinePreset,
  MacrocyclePreset,
  NewApparatusPreset,
  NewTrainingSessionPreset,
  NewWeekdayPreset,
  NewWeekdaysSessionsPreset,
} from "@/lib/types";
import { z } from "zod";
import { getAuthenticatedCoach } from "@/lib/utils/auth";

/**
 * Insert multiple weekly goal preset rows (one per apparatus) sharing the same preset name.
 */
export async function createWeeklyGoalPreset(
  presets: Omit<WeeklyGoalPreset, "id" | "created_by">[],
) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

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

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("weekly_goal_presets")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating weekly goal preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
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
    .from("presets_training_sessions")
    .select("*");

  if (error) {
    console.error("Error fetching training session presets:", error);
    return [] as TrainingSessionPreset[];
  }
  return data as TrainingSessionPreset[];
}

export async function createTrainingSessionPreset(
  presets: Omit<TrainingSessionPreset, "id" | "created_by">[],
) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  const baseSchema = z.object({
    name: z.string().min(1),
    week_day: z.number().int().min(0).max(6).nullable(),
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

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("training_sessions_presets")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating training session preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
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
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

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

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("microcycles_presets")
    .insert(rows)
    .select();
  if (error) {
    console.error("Error creating microcycle preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
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

export async function createDailyRoutinePreset(
  presets: Omit<DailyRoutinePreset, "id" | "created_by">[],
) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  const baseSchema = z.object({
    name: z.string().min(1),
    apparatus: z.enum(["All", "FX", "PH", "SR", "VT", "PB", "HB"]),
    type: z.enum(["I+", "I", "P", "C", "U", "Std", "G", "S", "B", "D"]),
    quantity: z.number().int().min(1),
    target_sets: z.number().int().min(1),
    target_execution: z.enum(["A+", "A", "B+", "B", "C+", "C"]),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid daily routine preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("daily_routine_presets")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating daily routine preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getMacrocyclePresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("macrocycles_presets")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching macrocycle presets:", error);
    return [] as MacrocyclePreset[];
  }
  return data as MacrocyclePreset[];
}

export async function createMacrocyclePreset(
  presets: Omit<
    MacrocyclePreset,
    "id" | "created_by" | "created_at" | "updated_at"
  >[],
) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  const baseSchema = z.object({
    name: z.string().min(1),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid macrocycle preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("macrocycles_presets")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating macrocycle preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

// -- new preset actions --
export async function createApparatusPreset(
  presets: Omit<
    NewApparatusPreset,
    "id" | "created_by" | "created_at" | "updated_at"
  >[],
) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  const baseSchema = z.object({
    name: z.string().min(1),
    apparatus: z.enum(["FX", "PH", "SR", "VT", "PB", "HB"]),
    quantity: z.number().int().min(1),
    execution_grade: z.enum(["A+", "A", "B+", "B", "C+", "C"]),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid apparatus preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_apparatus")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating apparatus preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getApparatusPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets_apparatus")
    .select("*")
    .order("apparatus");

  if (error) {
    console.error("Error fetching apparatus presets:", error);
    return [] as NewApparatusPreset[];
  }
  return data as NewApparatusPreset[];
}

export async function createSessionPreset(
  presets: Omit<
    NewTrainingSessionPreset,
    "id" | "created_by" | "created_at" | "updated_at"
  >[],
) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  const baseSchema = z.object({
    name: z.string().min(1),
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

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_training_sessions")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating training session preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getSessionPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets_training_sessions")
    .select("*");

  if (error) {
    console.error("Error fetching training session presets:", error);
    return [] as NewTrainingSessionPreset[];
  }
  return data as NewTrainingSessionPreset[];
}

export async function createWeekdayPreset(
  presets: Omit<
    NewWeekdayPreset,
    "id" | "created_by" | "created_at" | "updated_at"
  >[],
) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  const baseSchema = z.object({
    weekday_number: z.number().int().min(0).max(6),
    name: z.string().min(1),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid weekday preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_weekdays")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating weekday preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getWeekdayPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("presets_weekdays").select("*");

  if (error) {
    console.error("Error fetching weekday presets:", error);
    return [] as NewWeekdayPreset[];
  }
  return data as NewWeekdayPreset[];
}

export async function createWeekdaysSessionsPreset(
  presets: Omit<NewWeekdaysSessionsPreset, "id">[],
) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  const baseSchema = z.object({
    name: z.string().min(1),
    weekday_id: z.string().uuid(),
    session_id: z.string().uuid(),
    session_number: z.number().int().min(1),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid weekdays sessions preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_weekdays_sessions")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating weekdays sessions preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getWeekdaysSessionsPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets_weekdays_sessions")
    .select("*");

  if (error) {
    console.error("Error fetching weekdays sessions presets:", error);
    return [] as NewWeekdaysSessionsPreset[];
  }
  return data as NewWeekdaysSessionsPreset[];
}

// Unified function to get all four preset types efficiently
export async function getUnifiedPresets() {
  const supabase = await createClient();

  // Single auth call, then reuse client for all operations
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "User not found" } as const;
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (!coach) {
    return { error: "Coach profile not found" } as const;
  }

  // Parallel execution with shared client - much faster!
  const [
    apparatusPresets,
    sessionPresets,
    weekdayPresets,
    weekdaysSessionsPresets,
  ] = await Promise.all([
    supabase
      .from("presets_apparatus")
      .select("*")
      .eq("created_by", coach.id)
      .order("apparatus"),
    supabase
      .from("presets_training_sessions")
      .select("*")
      .eq("created_by", coach.id),
    supabase.from("presets_weekdays").select("*").eq("created_by", coach.id),
    supabase
      .from("presets_weekdays_sessions")
      .select("*")
      .eq("created_by", coach.id)
      .order("weekday_id"),
  ]);

  return {
    apparatusPresets: apparatusPresets.data || [],
    sessionPresets: sessionPresets.data || [],
    weekdayPresets: weekdayPresets.data || [],
    weekdaysSessionsPresets: weekdaysSessionsPresets.data || [],
  };
}
