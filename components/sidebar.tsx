"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Users,
  Calendar,
  ClipboardList,
  BarChart2,
  LayoutDashboard,
  ChevronLeft,
  Dumbbell,
  Settings,
} from "lucide-react";
import { useEffect } from "react";

const coachLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/atleti", label: "Atleti", icon: Users },
  { href: "/presets", label: "Presets", icon: Settings },
  // { href: "/microcicli", label: "Microcicli", icon: Calendar }, // Temporarily disabled during refactoring
  // { href: "/settimanale", label: "Settimanale", icon: Calendar }, // Temporarily disabled during refactoring
  // { href: "/giornaliera", label: "Giornaliera", icon: ClipboardList }, // Temporarily disabled during refactoring
  { href: "/allenamenti", label: "Allenamenti", icon: Dumbbell },
  { href: "/analisi-dati", label: "Analisi Dati", icon: BarChart2 },
];

export default function Sidebar({
  isSidebarOpen,
  toggleSidebar,
  role,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  role: "coach" | "athlete";
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (isSidebarOpen) {
      toggleSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Link per atleti
  const athleteLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    // { href: "/settimanale", label: "Settimanale", icon: Calendar }, // Temporarily disabled during refactoring
    // { href: "/giornaliera", label: "Giornaliera", icon: ClipboardList }, // Temporarily disabled during refactoring
    { href: "/allenamenti", label: "Allenamenti", icon: Dumbbell },
  ];

  const linksToShow = role === "athlete" ? athleteLinks : coachLinks;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <h2 className="text-lg font-semibold tracking-tight">Navigazione</h2>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      <div className="px-4">
        <hr className="border-t border-muted" />
      </div>
      <nav className="flex flex-col gap-3 p-4">
        {linksToShow.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Button
              key={href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className="justify-start"
            >
              <Link href={href} className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
