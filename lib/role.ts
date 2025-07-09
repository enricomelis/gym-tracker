import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "coach" | "athlete" | null;

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserRole> {
  const { data: coach } = await supabase
    .from("coaches")
    .select("*")
    .eq("supabase_id", userId)
    .single();

  if (coach) {
    return "coach";
  }

  const { data: athlete } = await supabase
    .from("athletes")
    .select("*")
    .eq("supabase_id", userId)
    .single();

  if (athlete) {
    return "athlete";
  }

  return null;
}
