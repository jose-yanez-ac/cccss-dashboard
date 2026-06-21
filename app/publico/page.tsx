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
      <header className="sticky top-0 z-40 border-b bg-[var(--sidebar)] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">
              CCSS · Túnel Lo Ruiz
            </p>
            <p className="truncate text-[11px] text-white/60">
              Dashboard público · solo lectura
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 bg-transparent text-white hover:bg-white/10"
            render={<Link href="/login" />}
          >
            <LogIn className="size-4" />
            <span className="hidden sm:inline">Iniciar sesión</span>
            <span className="sm:hidden">Entrar</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Túnel Lo Ruiz — Cambios de Servicio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Indicadores del proyecto en tiempo real. Vista pública de solo
            lectura.
          </p>
        </div>
        {initial ? (
          <PublicDashboard initial={initial} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No se pudieron cargar los indicadores en este momento.
          </p>
        )}
      </main>
    </div>
  );
}
