// ============================================================================
// BACKUP: Vecchia logica preset non più utilizzata
// ============================================================================
// Questo file contiene tutte le vecchie funzioni e tipi dei preset
// che sono state sostituite dalla nuova logica dei due macrocicli
// ============================================================================

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthenticatedCoach } from "@/lib/utils/auth";

// ============================================================================
// VECCHI TIPI
// ============================================================================

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

export type DailyRoutinePreset = {
  id: string;
  name: string;
  apparatus: "All" | "FX" | "PH" | "SR" | "VT" | "PB" | "HB";
  type: "I+" | "I" | "P" | "C" | "U" | "Std" | "G" | "S" | "B" | "D";
  quantity: number;
  target_sets: number;
  target_execution: "A+" | "A" | "B+" | "B" | "C+" | "C";
  created_by?: string | null;
};

export type TrainingSessionPreset = {
  id: string;
  name: string;
  created_by: string;
  week_day: number | null;
  fx_preset_id: string | null;
  ph_preset_id: string | null;
  sr_preset_id: string | null;
  vt_preset_id: string | null;
  pb_preset_id: string | null;
  hb_preset_id: string | null;
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
  allenamento_1: string | null;
  allenamento_2: string | null;
  allenamento_3: string | null;
  allenamento_4: string | null;
  allenamento_5: string | null;
  allenamento_6: string | null;
  allenamento_7: string | null;
  macrocycle_id: string | null;
  created_by: string;
  created_at?: string | null;
  updated_at?: string | null;
};

// ============================================================================
// VECCHIE FUNZIONI
// ============================================================================

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
  const authResult = await getAuthenticatedCoach();
  if ("error" in authResult) {
    return { error: authResult.error } as const;
  }

  const { coach, supabase } = authResult;

  const baseSchema = z.object({
    name: z.string().min(1),
    week_day: z.number().int().min(1).max(7).nullable(),
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

export async function getMicrocyclePresetsOld() {
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

export async function createMicrocyclePresetOld(
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

export async function getMacrocyclePresetsOld() {
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

export async function createMacrocyclePresetOld(
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

// ============================================================================
// NOTE SUL REFACTOR
// ============================================================================
/*
REFACTOR COMPLETATO:
- Rimossi tutti i vecchi tipi e funzioni dai file principali
- Sostituiti con la nuova logica dei due macrocicli
- Mantenuti qui per riferimento storico

NUOVA LOGICA IMPLEMENTATA:
1. Preset Attrezzi (apparatus) - ✅ Mantenuto
2. Preset Allenamenti (sessions) - ✅ Mantenuto  
3. Preset Giorni (weekdays) - ✅ Mantenuto
4. Preset Giorni-Allenamenti (weekdays-sessions) - ✅ Mantenuto
5. Preset Microcicli (microcycles) - ✅ Mantenuto
6. Preset Microcicli-Giorni (microcycles-weekdays) - ✅ Mantenuto
7. Preset Macrocicli (macrocycles) - ✅ NUOVO
8. Preset Macrocicli-Microcicli (macrocycles-microcycles) - ✅ NUOVO

VECCHIA LOGICA RIMOSSA:
- WeeklyGoalPreset (sostituito da logica integrata)
- DailyRoutinePreset (sostituito da apparatus presets)
- TrainingSessionPreset (sostituito da session presets)
- MacrocyclePreset (sostituito da nuova logica macrocycles)
- MicrocyclePreset (sostituito da nuova logica microcycles)
*/
