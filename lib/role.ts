import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "coach" | "athlete" | null;

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserRole> {
  const { data, error } = await supabase.rpc("get_user_role", {
    user_id: userId,
  });

  if (error || !data) {
    return getUserRoleFallback(supabase, userId);
  }

  return data as UserRole;
}

async function getUserRoleFallback(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserRole> {
  const [coachResult, athleteResult] = await Promise.all([
    supabase
      .from("coaches")
      .select("id")
      .eq("supabase_id", userId)
      .maybeSingle(),
    supabase
      .from("athletes")
      .select("id")
      .eq("supabase_id", userId)
      .maybeSingle(),
  ]);

  if (coachResult.data) {
    return "coach";
  }

  if (athleteResult.data) {
    return "athlete";
  }

  return null;
}

export async function getUserRoleWithProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  role: UserRole;
  profile: { id: string; [key: string]: any } | null;
}> {
  const [coachResult, athleteResult] = await Promise.all([
    supabase
      .from("coaches")
      .select("*")
      .eq("supabase_id", userId)
      .maybeSingle(),
    supabase
      .from("athletes")
      .select("*")
      .eq("supabase_id", userId)
      .maybeSingle(),
  ]);

  if (coachResult.data) {
    return { role: "coach", profile: coachResult.data };
  }

  if (athleteResult.data) {
    return { role: "athlete", profile: athleteResult.data };
  }

  return { role: null, profile: null };
}
