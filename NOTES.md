# NOTES.md — CCSS Túnel Lo Ruiz (v1 local)

Resumen de la implementación, decisiones no obvias y mejoras futuras.

## Resumen de archivos por módulo

### Infraestructura / conexión
- `lib/supabase/client.ts` — cliente browser (`createBrowserClient`, solo `NEXT_PUBLIC_*`).
- `lib/supabase/server.ts` — cliente server (`createServerClient` + `cookies()` async de Next 16).
- `lib/supabase/middleware.ts` + `middleware.ts` — refresco de sesión por request.
- `lib/database.types.ts` — tipos generados de la BD (no editar a mano).

### Utilidades
- `lib/format.ts` — `formatUF`, `formatPct`, `formatDate` (formato chileno).
- `lib/constants.ts` — `COLORS`, `ESTADO_CCSS` y mapas de etiquetas (fase, financiamiento, sector, estado OC/EP).
- `lib/schemas.ts` — esquemas zod (empresa, CCSS, OC, EP) + conversores form→payload.
- `lib/action-utils.ts` — `ActionResult` y `mapDbError` (traduce RLS/FK/unique/check a mensajes claros).
- `lib/queries.ts` — capa de datos server; **agregados solo desde vistas**.
- `lib/dashboard.ts` — agregaciones de distribución del dashboard (ver exepción abajo).

### Autenticación y shell
- `app/(auth)/login/page.tsx` — login (react-hook-form + zod → `signInWithPassword`).
- `app/(app)/layout.tsx` — guardia de sesión, sidebar, topbar, `<Toaster/>`.
- `app/(app)/actions.ts` — `signOut`.
- `components/sidebar-nav.tsx` — navegación con resaltado de ruta activa.

### Empresas (patrón base de CRUD)
- `app/(app)/empresas/{page,actions}.tsx` · `components/empresas/*` (tabla, dialog, row-actions).

### Cambios de Servicio
- `app/(app)/cambios-servicio/{page,actions}.tsx` · `.../[id]/{page,actions}.tsx` (detalle + OC/EP actions).
- `components/ccss/*` — tabla con filtros combinables, badge de estado, form dialog, row-actions.

### Órdenes de Compra y Estados de Pago
- `components/oc/*` y `components/ep/*` — dialogs y acciones, integrados en el detalle del CCSS.
- Regla de negocio Σ EP cursados ≤ monto OC: validación en cliente + **autoritativa en server action**.

### Dashboard
- `app/(app)/dashboard/page.tsx` → `components/dashboard/dashboard-view.tsx` (cliente, con filtros).
- `components/kpi-card.tsx` · `components/charts/*` (Recharts).

## Decisiones no obvias

1. **shadcn/ui usa Base UI, no Radix.** Los triggers se componen con la prop `render={<Elem/>}`
   en vez de `asChild`. Stack nuevo (Next 16 + Tailwind v4 + Base UI): verificar `.d.ts` antes de asumir APIs.
2. **`@tanstack/react-table` + React Compiler.** El plugin marca `useReactTable` como
   "incompatible library" (falso positivo); se silencia localmente con `eslint-disable-next-line`.
3. **Edición de CCSS usa la tabla base, no la vista.** `v_ccss_resumen` no expone
   `fecha_entrega_terreno`; `listCcssEditable()` lee la tabla para no perder ese dato al editar.
4. **Agregación de distribución en JS (excepción documentada).** Las tarjetas KPI de cabecera
   y los valores con cifras de oro se leen SIEMPRE de `v_kpis_proyecto` (principio #1). Las
   *distribuciones* del dashboard (contratado/proyección por empresa, CCSS por estado) y los
   agregados al aplicar filtros se derivan agrupando filas de la vista `v_ccss_resumen`, porque
   el esquema no provee vistas de breakdown ni filtrables, y crearlas exigiría migración +
   regeneración de tipos (fuera de alcance de v1, §6.4/§12). Sin filtros, las tarjetas muestran
   exactamente las cifras de la vista. Si se desea cumplimiento estricto, crear vistas
   `v_dist_empresa` / `v_dist_estado` en una iteración futura.
5. **Validación de saldo de EP.** La suma de cursados se calcula en la action solo como
   *guardia de integridad* (no es un KPI mostrado); el dato facturado/saldo de la UI viene de las vistas.

## Verificación de datos (cumplida)
`v_kpis_proyecto` → 76243.36 / 16247.98 / 320765.88 / 97678.88 / 35 (verificado vía PostgREST).
`facturado_uf (vista) = Σ EP cursados` (verificado), lo que valida la prueba de oro (T-61).

## Iteración 1.1 — Diagnóstico (Épica D) y correcciones

### Causas raíz (confirmadas en el repo, no hipótesis)
1. **OC → 404.** El sidebar enlaza `/ordenes-compra` (`components/sidebar-nav.tsx:18`) pero no existe
   `app/(app)/ordenes-compra/page.tsx`. En la v1 el CRUD de OC vive solo dentro del detalle del CCSS.
   *Fix:* módulo standalone `app/(app)/ordenes-compra/` + `listAllOc(filtros)` en `lib/queries.ts`.
2. **EP → 404.** Igual que OC: el sidebar enlaza `/estados-pago` pero no existe la página.
   *Fix:* módulo standalone `app/(app)/estados-pago/` + `listAllEp(filtros)`.
3. **Edición de CCSS inerte (bug sistémico).** El `MenuItem` de Base UI usa **`onClick`** y `closeOnClick`;
   **no existe `onSelect`** (esa es API de Radix). Las acciones de fila usaban `onSelect={(e)=>{…}}`, que
   Base UI ignora → el diálogo nunca abría → "Editar/Eliminar" no hacían nada. 8 usos en 4 archivos
   (`components/{empresas,oc,ep,ccss}/*-actions.tsx`). La Server Action `updateCcss` + `revalidatePath`
   y el formulario `zod` ya estaban correctos. *Fix:* `onSelect` → `onClick` en los 4 archivos.

### Decisión de stack reforzada
- **Base UI `MenuItem` = `onClick`, no `onSelect`.** Sumar a la regla "shadcn = Base UI → `render={…}`".

## Mejoras futuras (fuera de alcance v1)
- Vistas SQL de distribución (empresa/estado) para eliminar la agregación en JS.
- Roles diferenciados en UI (aprobador/visualizador), auditoría con triggers, alertas de hitos.
- Exportación PPTX/PDF, carga masiva desde Excel.
- Storage para `factura_url` (subida de archivos) en vez de URL manual.
- Paginación/orden server-side en tablas si la cartera crece.
- Despliegue (GitHub + Vercel).
