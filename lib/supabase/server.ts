import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/lib/database.types";

/**
 * Cliente de Supabase para uso en servidor (server components, route handlers
 * y server actions). Lee/escribe la sesión a través de las cookies del request.
 *
 * En Next.js 16 `cookies()` es asíncrono, por lo que este helper es `async`.
 * Usa solo las variables públicas `NEXT_PUBLIC_*`; nunca la service_role.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` se invocó desde un Server Component. Se puede ignorar si
            // hay un middleware refrescando la sesión del usuario por request.
          }
        },
      },
    },
  );
}
