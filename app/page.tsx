import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <Link href={"/dashboard"}>Gym Tracker</Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              {hasEnvVars && <AuthButton />}
            </div>
          </div>
        </nav>
        <div className="flex max-w-5xl flex-1 flex-col gap-20 p-5">
          <main className="flex flex-1 flex-col gap-6 px-4 text-center">
            <h1 className="mb-4 text-xl font-medium">
              Benvenuto in Gym Tracker
            </h1>
            <p className="text-muted-foreground">
              Gym Tracker è un'applicazione per programmare, tracciare e
              analizzare gli allenamenti di ginnastica artistica.
            </p>

            <div className="flex justify-center">
              <Link href="/dashboard">
                <Button variant={"outline"}>Vai alla Dashboard</Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </main>
  );
}
