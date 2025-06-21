import { LogoutButton } from "./logout-button";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={"/dashboard"} className="text-lg font-semibold">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
