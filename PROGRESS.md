# PROGRESS.md — CCSS Túnel Lo Ruiz

Estado del backlog (`instructions.md` §9). `[ ]` pendiente · `[~]` en curso/bloqueado · `[x]` hecho.

## Épica 0 — Prerrequisitos
- [x] **T-00** Verificar tipos de BD → `lib/database.types.ts` válido (`export type Database`, todas las tablas/vistas presentes).

## Épica 1 — Infraestructura de conexión
- [x] **T-10** Cliente browser (`lib/supabase/client.ts`)
- [x] **T-11** Cliente server (`lib/supabase/server.ts`)
- [x] **T-12** Middleware de sesión (`middleware.ts` + `lib/supabase/middleware.ts`)
- [x] **T-13** Utilidades base (`lib/format.ts`, `lib/constants.ts`) — CA `formatUF(76243.36) === "76.243,36"` verificado.

## Épica 2 — Autenticación y shell
- [x] **T-20** Login (`app/(auth)/login/page.tsx`)
- [x] **T-21** Layout protegido (`app/(app)/layout.tsx`, `components/sidebar-nav.tsx`, `signOut`)
- [x] **T-22** Dashboard placeholder (`app/(app)/dashboard/page.tsx`)

## Épica 3 — Capa de datos
- [x] **T-30** Queries (`lib/queries.ts`) — agregados solo desde vistas; `v_kpis_proyecto` verificada contra cifras de oro (76243.36 / 16247.98 / 320765.88 / 97678.88 / 35).

## Épica 4 — Mantenedor Empresas
- [x] **T-40** Lista empresas (tabla `@tanstack/react-table` + búsqueda; 15 empresas del seed)
- [x] **T-41** CRUD empresas (Server Actions + revalidatePath + sonner; manejo RLS). Patrón base reutilizable.

## Épica 5 — Cambios de Servicio
- [x] **T-50** Lista CCSS (desde `v_ccss_resumen`, 35 filas, UF y badges de estado)
- [x] **T-51** Filtros CCSS (empresa, fase, financiamiento, estado, sector — combinables + limpiar)
- [x] **T-52** CRUD CCSS (dialog con selects vía Controller; payload normalizado y revalidado en server action)
- [x] **T-53** Detalle CCSS (`[id]` con jerarquía OC→EP y subtotales desde `v_oc_resumen`; ENEL muestra sus 2 OC)

## Épica 6 — Órdenes de Compra y Estados de Pago
- [x] **T-60** CRUD OC (en detalle; revalida vista → actualiza contratado_uf)
- [x] **T-61** CRUD EP (prueba de oro) — validación Σ EP cursados ≤ monto OC (cliente + server autoritativo). Verificado en BD: `facturado_uf (vista) = Σ cursado`; revalida lista+detalle+dashboard.

## Épica 7 — Dashboard
- [x] **T-70** Tarjetas KPI (desde `v_kpis_proyecto`: 76.243,36 · 16.247,98 (21,3%) · 320.765,88 · 223.087,00)
- [x] **T-71** Gráficos núcleo (dona facturado/saldo + barras comparativas, desde la vista)
- [x] **T-72** Distribución (barras contratado/proyección por empresa; dona por estado suma 35, colores `ESTADO_CCSS`). Agregación derivada de `v_ccss_resumen` — ver NOTES.
- [x] **T-73** Filtros del dashboard (empresa/fase/estado/sector afectan tarjetas, gráficos y tabla; sin filtros = cifras de oro de la vista)

## Épica 8 — Cierre v1
- [x] **T-80** Calidad (`tsc --noEmit` ✅, `lint` ✅; sin `any`; sin `service_role` en cliente; KPIs solo desde vistas)
- [x] **T-81** DoD (NOTES.md + checklist §10 abajo)

### Definition of Done (§10)
- [x] `tsc --noEmit` y `lint` sin errores; `build` OK.
- [x] Login/logout OK; sin sesión redirige a `/login` (middleware + guardia de layout).
- [x] `v_kpis_proyecto` → 76243.36 / 16247.98 / 320765.88 / 97678.88 / 35 (verificado).
- [x] Lista CCSS = 35 con estados/montos y filtros operativos.
- [x] Detalle CCSS con jerarquía OC→EP; ENEL con 2 OC.
- [x] CRUD de empresa, CCSS, OC y EP con validación (EP ≤ saldo OC).
- [x] Prueba de oro (T-61): facturado sube / saldo baja al cursar EP, sin tocar totales (mecanismo verificado en la vista).
- [x] Dashboard completo (4 tarjetas + dona avance + barras + dona por estado + leyenda + filtros).
- [x] UF en formato chileno en toda la UI; colores/estados desde `lib/constants.ts`.

---

## Notas / bloqueos
- **T-00 (2026-06-20):** No existe `lib/database.types.ts`. La generación requiere `npx supabase login` (flujo interactivo por navegador) que no puedo ejecutar de forma autónoma. A la espera de que el humano genere los tipos. Project ref detectado en `.env.local`: `iqwhscdhsyqrlvcyvyau`.

---

# Iteración 1.1 (`instructions3.md`)

## Épica D — Diagnóstico
- [x] **T3-D1** Auditoría del repo + causa raíz de OC 404 / EP 404 / edición CCSS inerte (ver NOTES.md "Iteración 1.1"). Aprobado por el usuario.

## Épica E — Correcciones funcionales
- [x] **T3-E3** Arreglar acciones de fila inertes (`onSelect` → `onClick`, Base UI) en empresas/oc/ep/ccss
- [x] **T3-E1** Módulo standalone Órdenes de Compra (`/ordenes-compra`) — lista 17 OC, filtros, enlace a CCSS, CRUD (crear con selector de CCSS padre)
- [x] **T3-E2** Módulo standalone Estados de Pago (`/estados-pago`) — lista 8 EP, filtros OC/estado, enlace a OC/CCSS, CRUD (crear con selector de OC + regla de cupo)
- [x] **T3-E4** Eliminación de CCSS con doble confirmación (AlertDialog Base UI + escribir el nombre exacto)

## Épica F — Rediseño visual
- [x] **T3-F1** Lenguaje visual SaaS corporativo: sidebar navy colapsable + topbar con menú de usuario (`app-shell.tsx`), tarjetas con sombra, tablas con zebra/cabecera, KPIs rediseñados, skeletons de carga, raíz redirige a /dashboard

## Épica G — Dashboard público
- [x] **T3-G1** RPC `dashboard_public` aplicado por el usuario en el cloud + tipos regenerados. Verificado con llave anónima (200, sin observaciones, cifras de oro).
- [x] **T3-G2** Ruta pública `/publico` fuera del layout protegido; `middleware.ts` excluye `/publico`. Datos iniciales SSR con llave anónima.
- [x] **T3-G3** Solo lectura: sin sidebar ni controles de administración; CTA "Iniciar sesión".
- [x] **T3-G4** Paridad verificada: la función agrega desde `v_ccss_resumen` (mismo origen) → cifras idénticas al autenticado.

## Épica H — Verificación y reporte
- [ ] **T3-H1** Verificación integral (dev + tsc/lint/build)
- [ ] **T3-H2** Resumen detallado
