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

      // Use the same RPC function as the server-side getUserRole
      const { data, error } = await supabase.rpc("get_user_role_rpc", {
        user_id: user.id,
      });

      if (error) {
        console.error("Error getting user role:", error);
        setRole(null);
      } else {
        setRole(data as UserRole);
      }

      setLoading(false);
    };
    fetchRole();
  }, []);

  return { role, loading } as const;
}
