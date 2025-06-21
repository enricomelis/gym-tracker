import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-20">
        <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <Link href={"/"}>Gym Tracker</Link>
            </div>
            {hasEnvVars && <AuthButton />}
          </div>
        </nav>
        <div className="flex max-w-5xl flex-1 flex-col gap-20 p-5">
          <main className="flex flex-1 flex-col gap-6 px-4">
            <h1 className="mb-4 text-xl font-medium">
              Benvenuto in Gym Tracker
            </h1>
            <p>
              Questa è la pagina principale. Accedi per entrare nell'area
              riservata.
            </p>
          </main>
        </div>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-16 text-center text-xs">
          <p>Sviluppato con Next.js e Supabase</p>
        </footer>
      </div>
    </main>
  );
}
