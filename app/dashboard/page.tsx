import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachDashboard from "@/components/coach-dashboard";
import AthleteDashboard from "@/components/athlete-dashboard";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Handle error or profile not found
    // For now, redirect or show a generic error
    console.error("Error fetching profile:", error);
    return <div>Could not load dashboard. Profile not found.</div>;
  }

  if (profile.role === "coach") {
    return <CoachDashboard />;
  }

  if (profile.role === "athlete") {
    return <AthleteDashboard />;
  }

  return <div>Unknown role.</div>;
}
