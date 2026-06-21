import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static, _next/image (assets internos)
     * - favicon.ico y archivos de imagen estáticos
     * - /publico (dashboard público sin sesión)
     */
    "/((?!_next/static|_next/image|favicon.ico|publico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
