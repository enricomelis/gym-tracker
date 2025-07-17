"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { MicrocyclePreset } from "@/lib/types";

// ---------------------------------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------------------------------

export type WeeklyMicrocycle = Omit<
  MicrocyclePreset,
  "created_at" | "updated_at" | "id" | "created_by"
> & {
  id?: string;
  week_number: number;
  year: number;
};

// ---------------------------------------------------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Fetch all microcycle rows for the given year. The result is grouped by week number.
 */
export async function getGroupedMicrocycles(year: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("microcycles_presets")
    .select("*")
    .eq("year", year);

  if (error) {
    console.error("Error fetching microcycles:", error);
    return {} as Record<number, WeeklyMicrocycle[]>;
  }

  const grouped: Record<number, WeeklyMicrocycle[]> = {};
  (data as WeeklyMicrocycle[]).forEach((row) => {
    if (!grouped[row.week_number]) grouped[row.week_number] = [];
    grouped[row.week_number].push(row);
  });
  return grouped;
}

/**
 * Fetch a single microcycle plan for week/year. If multiple rows exist, the last updated one is returned.
 */
export async function getMicrocycleForWeek(weekNumber: number, year: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("microcycles_presets")
    .select("*")
    .eq("week_number", weekNumber)
    .eq("year", year)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching microcycle for week:", error);
    return null;
  }
  return data as WeeklyMicrocycle | null;
}

// ---------------------------------------------------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------------------------------------------------

const microcycleSchema = z.object({
  name: z.string().min(1).default(""),
  week_number: z.number().int().min(1).max(52),
  year: z.number().int().gte(2020).lte(2100),
  allenamento_1: z.string().uuid().nullable().optional(),
  allenamento_2: z.string().uuid().nullable().optional(),
  allenamento_3: z.string().uuid().nullable().optional(),
  allenamento_4: z.string().uuid().nullable().optional(),
  allenamento_5: z.string().uuid().nullable().optional(),
  allenamento_6: z.string().uuid().nullable().optional(),
  allenamento_7: z.string().uuid().nullable().optional(),
  macrocycle_id: z.string().uuid().nullable().optional(),
});

export async function upsertMicrocyclePlan(plan: WeeklyMicrocycle) {
  const supabase = await createClient();

  // Validate input
  const parsed = microcycleSchema.safeParse(plan);
  if (!parsed.success) {
    return { error: "Invalid microcycle data" } as const;
  }

  // Identify current coach (created_by)
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

  const row = {
    ...parsed.data,
    created_by: coach.id,
    updated_at: new Date().toISOString(),
  } as unknown as Record<string, unknown>;

  const { data, error } = await supabase
    .from("microcycles_presets")
    .upsert(row, {
      onConflict: "week_number,year",
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error upserting microcycle:", error);
    return { error: error.message } as const;
  }

  return { success: true, data } as const;
}

export async function deleteMicrocyclePlan(weekNumber: number, year: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("microcycles_presets")
    .delete()
    .eq("week_number", weekNumber)
    .eq("year", year);

  if (error) {
    console.error("Error deleting microcycle plan:", error);
    return { error: error.message } as const;
  }

  return { success: true } as const;
}
