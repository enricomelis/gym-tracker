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
      }
      setUser(supabaseUser);
    };
    checkUser();
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
