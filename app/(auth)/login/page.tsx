"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { CORPORATE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setAuthError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setAuthError("Credenciales inválidas. Verifica tu correo y contraseña.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca (desktop) */}
      <aside
        className="relative hidden flex-col justify-between p-12 text-white lg:flex"
        style={{ backgroundColor: CORPORATE.teal }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: CORPORATE.orange }}
        />
        <div>
          <p className="text-lg font-semibold">CCSS · Túnel Lo Ruiz</p>
          <p className="text-sm text-white/60">Víaschile — Autopista Central</p>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">
            Gestión de Cambios de Servicios
          </h2>
          <p className="text-white/70">
            Back office y dashboard del proyecto Túnel Lo Ruiz. Todos los
            indicadores se calculan desde la base de datos, en tiempo real.
          </p>
          <span
            className="inline-block h-1 w-16 rounded-full"
            style={{ backgroundColor: CORPORATE.orange }}
          />
        </div>
        <p className="text-xs text-white/40">
          Acceso restringido · uso interno
        </p>
      </aside>

      {/* Formulario */}
      <div className="flex items-center justify-center bg-muted/40 p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p
              className="text-lg font-semibold"
              style={{ color: CORPORATE.teal }}
            >
              CCSS · Túnel Lo Ruiz
            </p>
            <p className="text-sm text-muted-foreground">
              Víaschile — Autopista Central
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h1 className="text-xl font-semibold tracking-tight">
                Iniciar sesión
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ingresa con tu cuenta para continuar.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@correo.cl"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {authError && (
                <p className="text-sm text-destructive" role="alert">
                  {authError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full border-transparent text-white hover:opacity-90"
                style={{ backgroundColor: CORPORATE.orange }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Ingresando…" : "Ingresar"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿Solo quieres ver indicadores?{" "}
            <Link
              href="/publico"
              className="font-medium underline-offset-4 hover:underline"
              style={{ color: CORPORATE.teal }}
            >
              Ir al dashboard público
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
