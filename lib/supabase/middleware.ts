import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/database.types";

/**
 * Refresca la sesión de Supabase en cada request y propaga las cookies de
 * sesión actualizadas tanto al request (para los server components) como a la
 * respuesta (para el navegador). Patrón oficial de `@supabase/ssr`.
 *
 * IMPORTANTE: no insertar lógica entre `createServerClient` y `getUser()`; eso
 * podría provocar cierres de sesión intermitentes difíciles de depurar.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresca el token de la sesión si corresponde.
  await supabase.auth.getUser();

  return supabaseResponse;
}
