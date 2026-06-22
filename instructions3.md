# instructions3.md — Iteración 1.1
## Correcciones funcionales · Rediseño visual SaaS · Dashboard público

> **Brief de ejecución para Claude Code.** Continúa el proyecto descrito en `context.md`. Mantén la metodología (ciclo de trabajo), los roles y los guardrails de `instructions.md` (§5–§7) y respeta las decisiones de `NOTES.md` (en especial: **shadcn aquí es Base UI → componer con `render={…}`, no `asChild`**). Trabaja una tarea acotada a la vez, valida antes de avanzar y actualiza `PROGRESS.md`.

### Reglas de trabajo de esta iteración (obligatorias)
1. **Analiza el repositorio completo antes de tocar código.** Entrega primero el diagnóstico (Épica D) con la **causa raíz** de cada problema.
2. **Causa raíz antes de corregir.** No apliques parches: soluciones **definitivas** y consistentes con la arquitectura existente.
3. **Verifica de punta a punta** cada arreglo: rutas, navegación, permisos/RLS, formularios, Server Actions, persistencia y revalidación.
4. **No rompas las cifras de oro** (76243.36 / 16247.98 / 320765.88 / 97678.88 / 35) ni los guardrails (KPIs desde vistas/RPC, `service_role` solo servidor, RLS activo, `zod` en formularios, UF con `es-CL`, colores desde `lib/constants.ts`).
5. **Cambios de esquema** (RPC del dashboard público): se aplican en el **SQL Editor del cloud** y requieren **regenerar tipos** → son puntos de **parada y consulta** (acción humana). Provee el SQL listo (Apéndice A) y pídelo.
6. **Al finalizar, entrega un resumen detallado** (Épica H): cambios por archivo/módulo, causa raíz de cada bug, y validaciones ejecutadas.

---

## Backlog de tareas

### Épica D — Diagnóstico (antes de cualquier cambio)
- **T3-D1 · Auditoría del repo.** Mapea: rutas existentes (`app/**`), enlaces del sidebar, Server Actions, `lib/queries.ts`, middleware y políticas relevantes. Para cada observación, documenta la **causa raíz** y el plan de corrección en `NOTES.md` (sección "Iteración 1.1"). **CA:** diagnóstico escrito por cada punto (OC 404, EP 404, edición CCSS, etc.) antes de codear.

### Épica E — Correcciones funcionales

- **T3-E1 · Órdenes de Compra (404).**
  *Hipótesis de causa raíz:* el sidebar enlaza a `/ordenes-compra` pero la página no existe (en la v1 el CRUD de OC quedó dentro del detalle del CCSS), o hay desajuste de ruta/route-group.
  *Fix definitivo:* crea el **módulo standalone** `app/(app)/ordenes-compra/` con lista de todas las OC (filtros por empresa/CCSS/estado), columnas con `numero_oc`, `monto_uf`, facturado/saldo (desde `v_oc_resumen`), enlace al CCSS padre, y acceso a su CRUD. Añade `listAllOc(filtros)` en `lib/queries.ts` si falta. **CA:** navegar a "Órdenes de Compra" carga la lista (17 OC del seed), sin 404, con acciones operativas.

- **T3-E2 · Estados de Pago (404).**
  *Causa raíz análoga.* Crea `app/(app)/estados-pago/` con lista de todos los EP (filtros por OC/estado), columnas `numero_ep`, `monto_uf`, `fecha`, `estado`, enlace a su OC/CCSS, y CRUD con la regla **Σ EP cursados ≤ monto OC**. Añade `listAllEp(filtros)` si falta. **CA:** ruta operativa sin 404; cursar un EP revalida lista + detalle + dashboard.

- **T3-E3 · Edición de Cambios de Servicio (no hace nada).**
  *Hipótesis de causa raíz:* el submit del formulario de edición no está cableado a la Server Action de update, o el componente usa el patrón Radix (`asChild`) en vez de **Base UI (`render={…}`)** y el trigger/submit queda inerte; o la action persiste pero no hay `revalidatePath`.
  *Fix definitivo:* repara el flujo completo —apertura del diálogo, `react-hook-form`+`zod`, Server Action `updateCcss`, persistencia y `revalidatePath` de lista+detalle—. **CA:** editar un CCSS guarda los cambios y se reflejan inmediatamente en lista y detalle; errores de validación/RLS se muestran.

- **T3-E4 · Eliminación de CCSS con doble confirmación.**
  Implementa un `AlertDialog` (Base UI) con **dos barreras**: (1) confirmación explícita mostrando el nombre del CCSS y (2) el botón destructivo se habilita solo tras **escribir el nombre exacto** del CCSS (o un segundo paso "Confirmar definitivamente"). Tras eliminar: toast + revalidación. **CA:** no es posible eliminar sin completar ambas confirmaciones; cancelar no borra nada.

### Épica F — Rediseño visual (SaaS corporativo)

- **T3-F1 · Lenguaje visual y app shell.**
  Evoluciona la apariencia hacia un SaaS **corporativo, tecnológico y ejecutivo**, manteniendo shadcn/Base UI y la paleta de `lib/constants.ts` (navy `#12243B`, petróleo `#0E5A82`, etc.) más una escala de **grises neutros**. Lineamientos:
  - **Sidebar** fija de marca (navy), ítems con ícono `lucide-react` + label, estado activo claro, colapsable.
  - **Topbar** clara con título/breadcrumb y menú de usuario.
  - **Tarjetas**: `rounded-xl`, borde sutil + `shadow-sm`, padding generoso; KPIs con número grande, label y acento de color contenido.
  - **Tablas**: cabecera fija, densidad cómoda, *zebra*, badges de estado con los colores de `ESTADO_CCSS`.
  - **Estados**: *skeletons* de carga, estados vacíos con CTA, toasts consistentes.
  - **Tipografía** con jerarquía clara; espaciado en escala 4/8; acentos de color **restringidos** (status solo para status). Responsive.
  **CA:** UI cohesiva y moderna en todas las vistas; **sin regresiones funcionales**; `build`, `tsc`, `lint` limpios.

### Épica G — Dashboard público (lectura sin login)

- **T3-G1 · Endpoint público curado.** Aplica en el **SQL Editor** la función **`dashboard_public`** del **Apéndice A** (`security definer`, expone **solo** agregados + lista de CCSS sin `observaciones` + empresas para filtros; `grant execute` a `anon`). **No** abras las tablas a `anon`: las políticas RLS de las tablas **no se tocan**. *(Parada y consulta: el humano corre el SQL y regenera tipos.)* **CA:** `select dashboard_public();` devuelve KPIs con las cifras de oro.
- **T3-G2 · Ruta pública.** Crea `app/(public)/dashboard/page.tsx` (o `/p`) **fuera** del layout protegido, que consuma `dashboard_public` con el **cliente anon**. Ajusta `middleware.ts` para **excluir** esta ruta de la protección (no redirigir a `/login`). **CA:** abrir la URL pública **en incógnito (sin sesión)** muestra el dashboard.
- **T3-G3 · Solo lectura.** La vista pública muestra indicadores, gráficos, métricas y **filtros**, pero **ningún** control de administración (sin crear/editar/eliminar, sin sidebar de mantenedores). Incluye CTA "Iniciar sesión". **CA:** un usuario no autenticado no ve ni puede invocar acciones de escritura; las mutaciones siguen exigiendo sesión + rol (RLS intacto).
- **T3-G4 · Paridad de datos.** Las cifras del dashboard público coinciden con el autenticado. **CA:** KPIs y distribuciones idénticas con y sin sesión (mismos filtros).

### Épica H — Verificación y reporte
- **T3-H1 · Verificación integral.** `npm run dev` recorriendo: OC, EP, edición/eliminación de CCSS, dashboard autenticado y **público en incógnito**. `tsc --noEmit`, `lint`, `build` limpios. **CA:** todos los flujos operativos.
- **T3-H2 · Resumen detallado.** Entrega (en el chat y en `NOTES.md`): por cada observación → **causa raíz**, **solución aplicada**, **archivos tocados** y **validación ejecutada**; más cualquier deuda/seguimiento. **CA:** resumen completo y trazable.

---

## Definition of Done (Iteración 1.1)
- [ ] Órdenes de Compra y Estados de Pago: rutas operativas, **sin 404**, con datos y CRUD.
- [ ] Edición de CCSS persiste y refleja cambios; eliminación exige **doble confirmación**.
- [ ] UI rediseñada (SaaS corporativo) cohesiva y sin regresiones.
- [ ] Dashboard **público** sin login, **solo lectura**, con filtros/gráficos/KPIs; RLS de escritura intacto.
- [ ] Cifras de oro y paridad pública verificadas; `tsc`/`lint`/`build` limpios; Base UI (`render={…}`) respetado.
- [ ] Resumen detallado entregado (T3-H2); `PROGRESS.md` y `NOTES.md` actualizados.

---

## Apéndice A — SQL del endpoint público (aplicar en SQL Editor, luego regenerar tipos)

```sql
create or replace function public.dashboard_public(
  p_proyecto uuid default null,
  p_empresa  uuid default null,
  p_fase     text default null,
  p_estado   text default null,
  p_sector   text default null
) returns jsonb
language sql stable security definer set search_path = public as $$
  with proy as (
    select coalesce(p_proyecto, (select id from proyectos order by creado_en limit 1)) as pid
  ),
  f as (
    select r.*
    from v_ccss_resumen r, proy
    where r.proyecto_id = proy.pid
      and (p_empresa is null or r.empresa_id   = p_empresa)
      and (p_fase    is null or r.fase::text   = p_fase)
      and (p_estado  is null or r.estado       = p_estado)
      and (p_sector  is null or r.sector::text = p_sector)
  )
  select jsonb_build_object(
    'proyecto', (select jsonb_build_object('id', id, 'nombre', nombre, 'ds153_uf', ds153_uf)
                 from proyectos where id = (select pid from proy)),
    'kpis', (select jsonb_build_object(
        'total_contratado_uf', coalesce(sum(contratado_uf),0),
        'facturado_uf',        coalesce(sum(facturado_uf),0),
        'saldo_uf',            coalesce(sum(contratado_uf),0) - coalesce(sum(facturado_uf),0),
        'proyeccion_total_uf', coalesce(sum(contratado_uf),0) + coalesce(sum(proyeccion_uf),0),
        'pct_facturado',       case when coalesce(sum(contratado_uf),0) > 0
                                    then round(100*coalesce(sum(facturado_uf),0)/sum(contratado_uf),2) else 0 end,
        'total_ccss',          count(*)
      ) from f),
    'por_empresa', (select coalesce(jsonb_agg(x),'[]'::jsonb) from (
        select e.nombre as empresa, count(*) n_ccss,
               sum(f.contratado_uf) contratado_uf, sum(f.proyeccion_uf) proyeccion_uf
        from f join empresas e on e.id = f.empresa_id
        group by e.nombre order by 3 desc) x),
    'por_estado', (select coalesce(jsonb_agg(x),'[]'::jsonb) from (
        select estado, count(*) n_ccss,
               sum(contratado_uf) contratado_uf, sum(proyeccion_uf) proyeccion_uf
        from f group by estado) x),
    'ccss', (select coalesce(jsonb_agg(x),'[]'::jsonb) from (
        select e.nombre as empresa, f.nombre, f.fase, f.tipo_financiamiento, f.sector,
               f.contratado_uf, f.facturado_uf, f.saldo_uf, f.estado
        from f join empresas e on e.id = f.empresa_id
        order by e.nombre) x),
    'empresas', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre)
                          order by nombre), '[]'::jsonb) from empresas)
  );
$$;

revoke all on function public.dashboard_public(uuid,uuid,text,text,text) from public;
grant execute on function public.dashboard_public(uuid,uuid,text,text,text) to anon, authenticated;
```

> Tras aplicarlo: `npx supabase gen types typescript --project-id <REF> > lib/database.types.ts`.
> El payload es `jsonb`; tipa el resultado en la app con una interfaz `DashboardPublic` (kpis, por_empresa[], por_estado[], ccss[], empresas[]). Las **tablas siguen cerradas a `anon`**: lo único público es esta función.

---

## Apéndice B — Notas de implementación
- **Cliente anon en la ruta pública:** usa el `createBrowserClient` con `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ya es pública) y llama `supabase.rpc('dashboard_public', { … })`. No uses `service_role`.
- **Middleware:** agrega la ruta pública al `matcher`/lógica de exclusión para que no redirija a `/login`. El resto de `app/(app)/**` permanece protegido.
- **Reutilización:** comparte los componentes de gráficos/tarjetas entre el dashboard autenticado y el público; en el público, oculta acciones y pasa los datos del RPC.
- **Edición CCSS / 404 de OC-EP:** revisa primero si el patrón **Base UI** (`render={…}`) está bien aplicado en diálogos y triggers; es la causa raíz más probable de "no hace nada" y de componentes inertes.
