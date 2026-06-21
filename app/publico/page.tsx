import Link from "next/link";
import { LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { DashboardPublic } from "@/lib/dashboard-public";
import { Button } from "@/components/ui/button";
import { PublicDashboard } from "@/components/dashboard/public-dashboard";

export const metadata = {
  title: "Dashboard público · CCSS Túnel Lo Ruiz",
};

export default async function PublicoPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("dashboard_public", {});
  const initial = data as unknown as DashboardPublic;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-[var(--sidebar)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="leading-tight">
            <p className="text-sm font-semibold">CCSS · Túnel Lo Ruiz</p>
            <p className="text-[11px] text-white/60">
              Dashboard público · solo lectura
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent text-white hover:bg-white/10"
            render={<Link href="/login" />}
          >
            <LogIn className="size-4" />
            Iniciar sesión
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Túnel Lo Ruiz — Cambios de Servicio
          </h1>
          <p className="text-sm text-muted-foreground">
            Indicadores del proyecto en tiempo real. Vista pública de solo
            lectura.
          </p>
        </div>
        <PublicDashboard initial={initial} />
      </main>
    </div>
  );
}
