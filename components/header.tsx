import Link from "next/link";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { ThemeSwitcher } from "./theme-switcher";

export default function Header({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="relative flex h-16 items-center px-4 md:px-6">
        {/* Left section for hamburger */}
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={toggleSidebar}
          >
            <Menu className="h-7 w-7" />
          </Button>
        </div>

        {/* Absolute center for title */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight"
          >
            Gym Tracker
          </Link>
        </div>

        {/* Right section for actions */}
        <div className="ml-auto flex items-center gap-4">
          <ThemeSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
