import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "coach" | "athlete" | null;

export async function getUserRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserRole> {
  // Use the security definer RPC function to bypass RLS policies
  const { data, error } = await supabase.rpc("get_user_role_rpc", {
    user_id: userId,
  });

  if (error) {
    console.error("Error getting user role:", error);
    return null;
  }

  return data as UserRole;
}
