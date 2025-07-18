"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  NewApparatusPreset,
  NewTrainingSessionPreset,
  NewWeekdayPreset,
  NewWeekdaysSessionsPreset,
  NewMicrocyclePreset,
  NewMicrocyclesWeekdaysPreset,
  NewMacrocyclePreset,
  NewMacrocyclesMicrocyclesPreset,
} from "@/lib/types";
import { z } from "zod";
import { getAuthenticatedCoach } from "@/lib/utils/auth";

/**
 * Insert multiple weekly goal preset rows (one per apparatus) sharing the same preset name.
 */

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
    weekday_number: z.number().int().min(0).max(7),
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
  presets: Omit<
    NewWeekdaysSessionsPreset,
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

export async function createMicrocyclePreset(
  presets: Omit<
    NewMicrocyclePreset,
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
    return { error: "Invalid microcycle preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_microcycles")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating microcycle preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getMicrocyclePresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets_microcycles")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching microcycle presets:", error);
    return [] as NewMicrocyclePreset[];
  }
  return data as NewMicrocyclePreset[];
}

export async function createMicrocyclesWeekdaysPreset(
  presets: Omit<
    NewMicrocyclesWeekdaysPreset,
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
    microcycle_id: z.string().uuid(),
    weekday_id: z.string().uuid(),
    day_number: z.number().int().min(1),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid microcycles weekdays preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_microcycles_weekdays")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating microcycles weekdays preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getMicrocyclesWeekdaysPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets_microcycles_weekdays")
    .select("*");

  if (error) {
    console.error("Error fetching microcycles weekdays presets:", error);
    return [] as NewMicrocyclesWeekdaysPreset[];
  }
  return data as NewMicrocyclesWeekdaysPreset[];
}

export async function createMacrocyclePreset(
  presets: Omit<
    NewMacrocyclePreset,
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
    length_in_weeks: z.number().int().min(1),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid macrocycle preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_macrocycles")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating macrocycle preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getMacrocyclePresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets_macrocycles")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching macrocycle presets:", error);
    return [] as NewMacrocyclePreset[];
  }
  return data as NewMacrocyclePreset[];
}

export async function createMacrocyclesMicrocyclesPreset(
  presets: Omit<
    NewMacrocyclesMicrocyclesPreset,
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
    macrocycle_id: z.string().uuid(),
    microcycle_id: z.string().uuid(),
    week_number: z.number().int().min(1),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid macrocycles microcycles preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_macrocycles_microcycles")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating macrocycles microcycles preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getMacrocyclesMicrocyclesPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets_macrocycles_microcycles")
    .select("*");

  if (error) {
    console.error("Error fetching macrocycles microcycles presets:", error);
    return [] as NewMacrocyclesMicrocyclesPreset[];
  }
  return data as NewMacrocyclesMicrocyclesPreset[];
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
    microcyclePresets,
    microcyclesWeekdaysPresets,
    macrocyclePresets,
    macrocyclesMicrocyclesPresets,
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
      .order("name"),
    supabase
      .from("presets_microcycles")
      .select("*")
      .eq("created_by", coach.id)
      .order("name"),
    supabase
      .from("presets_microcycles_weekdays")
      .select("*")
      .eq("created_by", coach.id)
      .order("name"),
    supabase
      .from("presets_macrocycles")
      .select("*")
      .eq("created_by", coach.id)
      .order("name"),
    supabase
      .from("presets_macrocycles_microcycles")
      .select("*")
      .eq("created_by", coach.id)
      .order("name"),
  ]);

  return {
    apparatusPresets: apparatusPresets.data || [],
    sessionPresets: sessionPresets.data || [],
    weekdayPresets: weekdayPresets.data || [],
    weekdaysSessionsPresets: weekdaysSessionsPresets.data || [],
    microcyclePresets: microcyclePresets.data || [],
    microcyclesWeekdaysPresets: microcyclesWeekdaysPresets.data || [],
    macrocyclePresets: macrocyclePresets.data || [],
    macrocyclesMicrocyclesPresets: macrocyclesMicrocyclesPresets.data || [],
  };
}
