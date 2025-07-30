"use client";

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { useState, useCallback } from "react";
import type { UserRole } from "@/lib/role";

interface LayoutClientProps {
  children: React.ReactNode;
  role: UserRole;
}

export default function LayoutClient({ children, role }: LayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  if (!role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        role={role}
      />
      <div className="flex flex-col">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/50"
        />
      )}
    </div>
  );
}
