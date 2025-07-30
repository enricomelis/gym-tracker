"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { getUserRole, type UserRole } from "@/lib/role";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
  initialRole?: UserRole;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialRole = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getBrowserClient();
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      setUser(currentUser);

      if (currentUser) {
        const userRole = await getUserRole(supabase, currentUser.id);
        setRole(userRole);
      } else {
        setRole(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error");
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have initial data
    if (!initialUser) {
      refreshAuth();
    }

    // Set up auth state listener for session changes
    const supabase = getBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser(session.user);
          // Only fetch role if we don't already have it
          if (!role) {
            const userRole = await getUserRole(supabase, session.user.id);
            setRole(userRole);
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialUser, role]);

  return (
    <AuthContext.Provider value={{ user, role, loading, error, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Optimized hook that just returns the data without triggering loading states
export function useAuthData() {
  const { user, role, loading } = useAuth();
  return { user, role, loading } as const;
}
