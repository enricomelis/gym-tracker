import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "coach" | "athlete" | null;

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserRole> {
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", userId)
    .maybeSingle();

  if (coach && !coachError) {
    return "coach";
  }

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id")
    .eq("supabase_id", userId)
    .maybeSingle();

  if (athlete && !athleteError) {
    return "athlete";
  }

  return null;
}
