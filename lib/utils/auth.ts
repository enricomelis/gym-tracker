import { createClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export type AuthResult =
  | { error: string }
  | { coach: { id: string }; supabase: SupabaseClient };

/**
 * Get authenticated coach - eliminates repeated auth/coach lookup across server actions
 * Returns either an error or the coach data with supabase client
 */
export async function getAuthenticatedCoach(): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not found" };
  }

  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (coachError || !coach) {
    return { error: "Coach profile not found" };
  }

  return { coach, supabase };
}

/**
 * Get authenticated athlete - for athlete-specific actions
 */
export async function getAuthenticatedAthlete(): Promise<
  { error: string } | { athlete: { id: string }; supabase: SupabaseClient }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not found" };
  }

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id")
    .eq("supabase_id", user.id)
    .single();

  if (athleteError || !athlete) {
    return { error: "Athlete profile not found" };
  }

  return { athlete, supabase };
}
