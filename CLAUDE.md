# CCSS Túnel Lo Ruiz — Plataforma de Gestión de Cambios de Servicios

Aplicación web interna para la concesionaria **Víaschile – Autopista Central** que
gestiona los **Cambios de Servicios (CCSS)** del proyecto **Túnel Lo Ruiz** y muestra
un **dashboard** equivalente a la presentación semanal del comité.

## Stack
- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS**
- **shadcn/ui** para componentes; **Recharts** para gráficos
- **Supabase** local (PostgreSQL + Auth + Storage) vía Supabase CLI + Docker
- **@supabase/supabase-js** y **@supabase/ssr** (sesión en server y cliente)
- **react-hook-form + zod** (formularios), **@tanstack/react-table** (tablas)

## Reglas de dominio (IMPORTANTES)
- Todo se expresa en **UF**. Formatear con `Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` → `76.243,36`.
- **Los KPI NUNCA se escriben a mano**: se leen de las vistas SQL `v_kpis_proyecto`, `v_ccss_resumen`, `v_oc_resumen`.
- Un **Cambio de Servicio** puede tener **varias** órdenes de compra (caso ENEL) y, además, una **proyección** (`proyeccion_uf`) que coexiste con su OC (caso Aguas Andinas AVN).
- Jerarquía: `cambios_servicio` → `ordenes_compra` → `estados_pago`.
- `tipo_financiamiento`: `con_oc` · `proyeccion` · `autofinanciamiento`.
- Estado de un CCSS (derivado en la vista): `pagado_total` · `pagado_parcial` · `pendiente` · `proyeccion` · `autofinanciamiento`.

## Colores de estado (consistentes con la presentación)
- pagado_total → verde `#1E8E5A` · pagado_parcial → ámbar `#D98E04`
- pendiente → naranja `#C0532B` · proyeccion → azul `#2D6CB0`
- autofinanciamiento → gris `#5E6E82` · DS153 → violeta `#6E59A5`
- primario/navy `#12243B` · petróleo `#0E5A82`

## Convenciones de código
- TypeScript estricto; nada de `any` salvo justificado.
- Tipos de BD generados en `lib/database.types.ts` (`supabase gen types`).
- Acceso a datos en `lib/queries.ts` (server) usando el cliente de servidor.
- Componentes server por defecto; `"use client"` sólo cuando haya interactividad.
- No exponer `SUPABASE_SERVICE_ROLE_KEY` al cliente. Sólo `NEXT_PUBLIC_*` va al navegador.
- Mensajes de UI en español.

## Estructura objetivo
```
app/(auth)/login/          app/(app)/dashboard/
app/(app)/cambios-servicio/  .../ordenes-compra/  .../estados-pago/  .../empresas/
components/ui/  components/charts/  components/kpi-card.tsx
lib/supabase/{client,server,middleware}.ts  lib/{queries,format,database.types}.ts
supabase/migrations/0001_init.sql  supabase/seed.sql
```

## Comandos
- `npm run dev` — app en http://localhost:3000
- `npx supabase start` — stack local (Studio en http://localhost:54323)
- `npx supabase db reset` — aplica migraciones + seed
- `npx supabase status` — URLs y llaves locales
- `npx supabase gen types typescript --local > lib/database.types.ts`

## Validación de datos (debe cumplirse siempre)
`select * from v_kpis_proyecto;` debe dar: total_contratado_uf **76243.36**,
proyeccion_total_uf **320765.88**, brecha_ds153_uf **97678.88**, total_ccss **35**.
(facturado_uf = 16247.98 con los EP documentados; ver nota del plan.)
