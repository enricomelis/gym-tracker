import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/role";
import { AuthProvider } from "@/lib/context/auth-context";
import LayoutClient from "./layout-client";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const role = await getUserRole(supabase, user.id);

  if (role === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>
          Il tuo utente non ha un ruolo assegnato (né tecnico, né atleta).
          Contatta l&apos;amministratore.
        </p>
      </div>
    );
  }

  return (
    <AuthProvider initialUser={user} initialRole={role}>
      <LayoutClient role={role}>{children}</LayoutClient>
    </AuthProvider>
  );
}
