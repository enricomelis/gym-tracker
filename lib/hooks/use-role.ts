"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/role";

export function useRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const supabase = getBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Query coach first then athlete (same as server util)
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("supabase_id", user.id)
        .maybeSingle();

      if (coach) {
        setRole("coach");
        setLoading(false);
        return;
      }

      const { data: athlete } = await supabase
        .from("athletes")
        .select("id")
        .eq("supabase_id", user.id)
        .maybeSingle();

      if (athlete) {
        setRole("athlete");
      } else {
        setRole(null);
      }
      setLoading(false);
    };
    fetchRole();
  }, []);

  return { role, loading } as const;
}
