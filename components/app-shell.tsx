"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, SidebarNav } from "@/components/sidebar-nav";
import { signOut } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function pageTitle(pathname: string): string {
  const item = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  if (!item) return "CCSS";
  // Detalle de un CCSS.
  if (item.href === "/cambios-servicio" && pathname !== item.href) {
    return "Detalle de Cambio de Servicio";
  }
  return item.label;
}

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Cajón de navegación móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <div className="leading-tight">
                <p className="text-sm font-semibold text-sidebar-accent-foreground">
                  CCSS · Túnel Lo Ruiz
                </p>
                <p className="text-[11px] text-sidebar-foreground/60">
                  Gestión de Cambios de Servicios
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <aside
        className={cn(
          "hidden shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border px-4",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? (
            <span className="text-base font-semibold text-sidebar-accent-foreground">
              CC
            </span>
          ) : (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-accent-foreground">
                CCSS · Túnel Lo Ruiz
              </p>
              <p className="text-[11px] text-sidebar-foreground/60">
                Gestión de Cambios de Servicios
              </p>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
            <h1 className="text-sm font-semibold tracking-tight md:text-base">
              {pageTitle(pathname)}
            </h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="size-4" />
                  <span className="hidden max-w-[180px] truncate sm:inline">
                    {email}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action={signOut}>
                <DropdownMenuItem
                  render={
                    <button type="submit" className="w-full">
                      <LogOut className="size-4" />
                      Salir
                    </button>
                  }
                />
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
