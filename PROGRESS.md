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
- [ ] **T-72** Distribución
- [ ] **T-73** Filtros del dashboard

## Épica 8 — Cierre v1
- [ ] **T-80** Calidad
- [ ] **T-81** DoD

---

## Notas / bloqueos
- **T-00 (2026-06-20):** No existe `lib/database.types.ts`. La generación requiere `npx supabase login` (flujo interactivo por navegador) que no puedo ejecutar de forma autónoma. A la espera de que el humano genere los tipos. Project ref detectado en `.env.local`: `iqwhscdhsyqrlvcyvyau`.
