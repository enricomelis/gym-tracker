"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { getUserRole, type UserRole } from "@/lib/role";

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

      const role = await getUserRole(supabase, user.id);

      setRole(role);

      setLoading(false);
    };
    fetchRole();
  }, []);

  return { role, loading } as const;
}
