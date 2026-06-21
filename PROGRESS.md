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
- [ ] **T-22** Dashboard placeholder

## Épica 3 — Capa de datos
- [ ] **T-30** Queries (`lib/queries.ts`)

## Épica 4 — Mantenedor Empresas
- [ ] **T-40** Lista empresas
- [ ] **T-41** CRUD empresas

## Épica 5 — Cambios de Servicio
- [ ] **T-50** Lista CCSS
- [ ] **T-51** Filtros CCSS
- [ ] **T-52** CRUD CCSS
- [ ] **T-53** Detalle CCSS

## Épica 6 — Órdenes de Compra y Estados de Pago
- [ ] **T-60** CRUD OC
- [ ] **T-61** CRUD EP (prueba de oro)

## Épica 7 — Dashboard
- [ ] **T-70** Tarjetas KPI
- [ ] **T-71** Gráficos núcleo
- [ ] **T-72** Distribución
- [ ] **T-73** Filtros del dashboard

## Épica 8 — Cierre v1
- [ ] **T-80** Calidad
- [ ] **T-81** DoD

---

## Notas / bloqueos
- **T-00 (2026-06-20):** No existe `lib/database.types.ts`. La generación requiere `npx supabase login` (flujo interactivo por navegador) que no puedo ejecutar de forma autónoma. A la espera de que el humano genere los tipos. Project ref detectado en `.env.local`: `iqwhscdhsyqrlvcyvyau`.
