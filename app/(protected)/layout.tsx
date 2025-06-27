"use client";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"coach" | "athlete" | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      if (!supabaseUser) {
        redirect("/auth/login");
        return;
      }
      setUser(supabaseUser);

      // Determina ruolo
      const { data: coach, error: coachError } = await supabase
        .from("coaches")
        .select("id")
        .eq("supabase_id", supabaseUser.id)
        .single();
      if (coach && !coachError) {
        setRole("coach");
        setLoading(false);
        return;
      }
      const { data: athlete, error: athleteError } = await supabase
        .from("athletes")
        .select("id")
        .eq("supabase_id", supabaseUser.id)
        .single();
      if (athlete && !athleteError) {
        setRole("athlete");
        setLoading(false);
        return;
      }
      setRole(null);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (user && role === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>
          Il tuo utente non ha un ruolo assegnato (né tecnico, né atleta).
          Contatta l&#39;amministratore.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        role={role as "coach" | "athlete"}
      />
      <div className="flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
      {/* Overlay for all screen sizes */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50"
        />
      )}
    </div>
  );
}
