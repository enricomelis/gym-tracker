"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  NewApparatusPreset,
  NewTrainingSessionPreset,
  NewMicrocyclePreset,
  NewMicrocyclesSessionsPreset,
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
    apparatus: z.enum(["FX", "PH", "SR", "VT", "PB", "HB", "All"]),
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

export async function getMicrocyclePresetsWithDetails() {
  const supabase = await createClient();

  // Get microcycle presets with their sessions and training session details
  const { data, error } = await supabase
    .from("presets_microcycles")
    .select(
      `
      *,
      presets_microcycles_sessions (
        *,
        presets_training_sessions (
          *,
          fx_preset:presets_apparatus!fx_preset_id (name, apparatus),
          ph_preset:presets_apparatus!ph_preset_id (name, apparatus),
          sr_preset:presets_apparatus!sr_preset_id (name, apparatus),
          vt_preset:presets_apparatus!vt_preset_id (name, apparatus),
          pb_preset:presets_apparatus!pb_preset_id (name, apparatus),
          hb_preset:presets_apparatus!hb_preset_id (name, apparatus)
        )
      )
    `,
    )
    .order("name");

  if (error) {
    console.error("Error fetching microcycle presets with details:", error);
    return [] as any[];
  }
  return data || [];
}

export async function createMicrocyclesSessionsPreset(
  presets: Omit<
    NewMicrocyclesSessionsPreset,
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
    training_session_id: z.string().uuid(),
    day_number: z.number().int().min(1).max(7),
  });

  const parsed = z.array(baseSchema).safeParse(presets);
  if (!parsed.success) {
    return { error: "Invalid microcycles weekdays preset data" } as const;
  }

  const rows = parsed.data.map((p) => ({ ...p, created_by: coach.id }));

  const { data, error } = await supabase
    .from("presets_microcycles_sessions")
    .insert(rows)
    .select();

  if (error) {
    console.error("Error creating microcycles sessions preset:", error);
    return { error: error.message } as const;
  }

  revalidatePath("/presets");
  return { success: true, data } as const;
}

export async function getMicrocyclesSessionsPresets() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presets_microcycles_sessions")
    .select("*");

  if (error) {
    console.error("Error fetching microcycles sessions presets:", error);
    return [] as NewMicrocyclesSessionsPreset[];
  }
  return data as NewMicrocyclesSessionsPreset[];
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

export async function createCompleteMicrocyclePreset(microcycleData: {
  name: string;
  sessions: Array<{
    day_number: number;
    training_session_id: string | null;
  }>;
}) {
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  // Validate input
  const schema = z.object({
    name: z.string().min(1),
    sessions: z
      .array(
        z.object({
          day_number: z.number().int().min(1).max(7),
          training_session_id: z.string().uuid().nullable(),
        }),
      )
      .min(1),
  });

  const parsed = schema.safeParse(microcycleData);
  if (!parsed.success) {
    return { error: "Invalid microcycle data" } as const;
  }

  // Filter out sessions with null training_session_id (empty sessions)
  const validSessions = parsed.data.sessions.filter(
    (session) => session.training_session_id !== null,
  );

  if (validSessions.length === 0) {
    return {
      error: "Almeno una sessione di allenamento deve essere selezionata",
    } as const;
  }

  // Use a transaction to create both microcycle and sessions
  const { data: microcycle, error: microcycleError } = await supabase
    .from("presets_microcycles")
    .insert({
      name: parsed.data.name,
      created_by: coach.id,
    })
    .select()
    .single();

  if (microcycleError) {
    console.error("Error creating microcycle preset:", microcycleError);
    return { error: microcycleError.message } as const;
  }

  // Group sessions by day and create session associations with order
  const sessionRows = validSessions.map((session, index) => ({
    name: `${parsed.data.name} - Giorno ${session.day_number}`,
    microcycle_id: microcycle.id,
    training_session_id: session.training_session_id,
    day_number: session.day_number,
    session_order: index + 1,
    created_by: coach.id,
  }));

  const { data: sessions, error: sessionsError } = await supabase
    .from("presets_microcycles_sessions")
    .insert(sessionRows)
    .select();

  if (sessionsError) {
    console.error("Error creating microcycle sessions:", sessionsError);
    return { error: sessionsError.message } as const;
  }

  revalidatePath("/presets");
  return {
    success: true,
    data: { microcycle, sessions },
  } as const;
}

// Unified function to get all preset types efficiently
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
    microcyclePresets,
    microcyclesSessionsPresets,
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
    supabase
      .from("presets_microcycles")
      .select(
        `
        *,
        presets_microcycles_sessions (
          *,
          presets_training_sessions (
            *,
            fx_preset:presets_apparatus!fx_preset_id (name, apparatus),
            ph_preset:presets_apparatus!ph_preset_id (name, apparatus),
            sr_preset:presets_apparatus!sr_preset_id (name, apparatus),
            vt_preset:presets_apparatus!vt_preset_id (name, apparatus),
            pb_preset:presets_apparatus!pb_preset_id (name, apparatus),
            hb_preset:presets_apparatus!hb_preset_id (name, apparatus)
          )
        )
      `,
      )
      .eq("created_by", coach.id)
      .order("name"),
    supabase
      .from("presets_microcycles_sessions")
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
    microcyclePresets: microcyclePresets.data || [],
    microcyclesSessionsPresets: microcyclesSessionsPresets.data || [],
    macrocyclePresets: macrocyclePresets.data || [],
    macrocyclesMicrocyclesPresets: macrocyclesMicrocyclesPresets.data || [],
  };
}
