"use client";

import { redirect } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { useRole } from "@/lib/hooks/use-role";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { role, loading: roleLoading } = useRole();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = getBrowserClient();
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();
      if (!supabaseUser) {
        redirect("/auth/login");
        return;
      }
      setUser(supabaseUser);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading || roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (user && !roleLoading && role === null) {
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
