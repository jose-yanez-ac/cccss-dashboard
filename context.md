# context.md — Contexto consolidado del proyecto
## Plataforma de Gestión de Cambios de Servicios (CCSS) · Túnel Lo Ruiz

> **Propósito de este archivo.** Documento de *handoff* para que cualquier sesión de Claude Code retome el proyecto con el contexto completo: qué es, cómo está construido, qué decisiones se tomaron, qué está hecho y qué sigue. Se complementa con `instructions.md` (metodología y backlog operativo), `CLAUDE.md` (convenciones rápidas) y `NOTES.md` (decisiones de implementación). Si hay conflicto operativo, manda `instructions.md`; para entender el "por qué", manda este archivo.
> Estado al momento del handoff: **v1 funcional completa**. Lo que viene son **mejoras** e **iteración 2**.

---

## 1. Resumen del proyecto

La concesionaria **Víaschile – Autopista Central** ejecuta el proyecto **Túnel Lo Ruiz**. Participan **OHLA** (constructora) y la **Inspección Fiscal / MOP** (fiscalización). Un **Cambio de Servicio (CCSS)** es la modificación o relocalización de un servicio de utilidad (agua, electricidad, gas, telecomunicaciones, canales, semaforización) afectado por la obra.

El objetivo es reemplazar el flujo manual (Excel + PowerPoint semanal) por una **plataforma web**: un **back office** para mantener los datos y un **dashboard interactivo** que reproduce, en vivo, la presentación del comité. El detonante de fondo: los totales hechos "a mano" divergían entre sí; aquí **todos los KPI se calculan en la base de datos** y nunca se digitan.

Línea de tiempo de entregables previos (para referencia): dashboard PPTX → propuesta técnica DOCX → plan de implementación local → adaptación a Supabase Cloud → guía de construcción → `instructions.md` (brief de ejecución) → **v1 construida**.

---

## 2. Glosario y actores

- **UF** — Unidad de Fomento; toda cifra monetaria está en UF, formato chileno `76.243,36`.
- **CCSS** — Cambio de Servicio. **OC** — Orden de Compra. **EP** — Estado de Pago.
- **DS N°153** — presupuesto base del contrato (UF 223.087); la proyección real lo supera.
- **Fase** — `ingenieria` | `construccion`.
- **tipo_financiamiento** — `con_oc` (tiene OC y EP) · `proyeccion` (sólo presupuesto estimado, "bluff") · `autofinanciamiento` (lo asume el prestador, UF 0).
- **Sector** — `AVN` (Américo Vespucio Norte) · `AGV` · `otro`.
- **Estado de un CCSS** (derivado en vista) — `pagado_total` · `pagado_parcial` · `pendiente` · `proyeccion` · `autofinanciamiento`.
- Jerarquía: **`cambios_servicio` → `ordenes_compra` → `estados_pago`**. Un CCSS puede tener **varias OC** (ENEL) y además una **proyección** que coexiste con su OC (Aguas Andinas AVN).

---

## 3. Estado actual — v1 funcional (COMPLETA)

Construida con `instructions.md` (backlog T-00…T-81). Resumen por épica:

| Épica | Tareas | Estado |
|---|---|---|
| 0 · Prerrequisitos | T-00 | ✅ tipos de BD válidos |
| 1 · Conexión | T-10…T-13 | ✅ client/server/middleware + format/constants |
| 2 · Auth y shell | T-20…T-22 | ✅ login, layout protegido, dashboard |
| 3 · Datos | T-30 | ✅ `lib/queries.ts` (agregados desde vistas) |
| 4 · Empresas | T-40, T-41 | ✅ CRUD patrón base (Server Actions + sonner + RLS) |
| 5 · CCSS | T-50…T-53 | ✅ lista, filtros, CRUD, detalle OC→EP |
| 6 · OC y EP | T-60, T-61 | ✅ CRUD + regla Σ EP cursados ≤ monto OC |
| 7 · Dashboard | T-70…T-73 | ✅ KPIs, gráficos, distribución, filtros globales |
| 8 · Cierre | T-80, T-81 | ✅ calidad + `NOTES.md` + DoD |

**Verificaciones realizadas (no asumidas):**
- Cifras de oro contra PostgREST: **76243.36 / 16247.98 / 320765.88 / 97678.88 / 35** ✅
- Tarjetas KPI formateadas: **76.243,36 · 16.247,98 (21,3%) · 320.765,88 · 223.087,00** ✅
- ENEL con **2 OC** confirmado en BD ✅
- Mecanismo de la "prueba de oro" (T-61) verificado en la capa de datos: `facturado_uf = Σ EP cursados`; cursar un EP sube facturado y baja saldo sin tocar `total_contratado_uf`; las actions revalidan lista + detalle + dashboard ✅
- `tsc --noEmit` ✅ · `lint` ✅ · `build` ✅ · sin `any` · sin `service_role` en cliente ✅

> Nota sobre facturado: `16.247,98` (21,3%) corresponde a los **EP documentados**. El valor "de planilla" era `31.419,18` (41,21%), que incluye EP **no detallados**; **subirá solo** al cargar esos EP desde el mantenedor. Nunca ajustar un KPI a mano.

---

## 4. Arquitectura y stack (tal como se construyó)

- **Frontend/SSR:** Next.js (App Router) + React + TypeScript + Tailwind.
- **UI:** **shadcn/ui** + **Recharts** + `lucide-react`.
- **Datos/Auth:** **Supabase Cloud** (PostgreSQL 15 + Auth), acceso con **`@supabase/ssr`**. **No** hay Supabase local ni Docker.
- **Capa "backend":** la **capa server de Next.js (Server Actions / Route Handlers) ES el backend** (patrón BFF). Decisión tomada explícitamente: **no se monta un servicio backend separado**; el front consume la capa server de Next.js, y ésta habla con Supabase con los tipos generados. Un worker delgado (p. ej. Render) se reserva **solo** para procesos pesados futuros (exportación PPTX/PDF, integraciones ERP/SAP, tareas programadas).
- **Mutaciones:** Server Actions con `revalidatePath`. **Lectura/agregados:** desde vistas SQL.

### Modelo de datos (en la nube)
Tablas: `proyectos`, `empresas`, `cambios_servicio`, `ordenes_compra`, `estados_pago`, `hitos`, `perfiles`.
Vistas calculadas (`security_invoker = on`): **`v_oc_resumen`**, **`v_ccss_resumen`**, **`v_kpis_proyecto`**.
RLS: lectura para autenticados; escritura para `admin`/`gestor` (función `public.rol_actual()`). Trigger crea `perfiles` al registrarse un usuario. El esquema y los datos están en `0001_init.sql` y `seed.sql`.

### Cifras de oro (regresión — deben mantenerse)
`select … from v_kpis_proyecto;` → total_contratado **76243.36** · facturado **16247.98** · proyeccion_total **320765.88** · brecha_ds153 **97678.88** · total_ccss **35**.

---

## 5. Decisiones y descubrimientos clave de la construcción (de `NOTES.md`)

1. **Excepción documentada al principio "agregados sólo desde vistas".** Las **tarjetas KPI y todas las cifras de oro** se leen siempre de `v_kpis_proyecto`. Pero las **distribuciones del dashboard** (contratado/proyección por empresa, CCSS por estado) y los **agregados al filtrar** se calculan agrupando filas de `v_ccss_resumen` **en JS**, porque el esquema no tiene vistas de *breakdown* ni filtrables, y crearlas exigía migración + regeneración de tipos (se respetó la condición de parada). Sin filtros, las tarjetas muestran exactamente los números de la vista. **Para cumplimiento estricto, el siguiente paso es crear `v_dist_empresa` y `v_dist_estado`** (ver §7, deuda de v1).
2. **Stack — shadcn/ui usa Base UI (no Radix).** Se compone con `render={<Elem/>}` **en vez de** `asChild`. **Condiciona todo el código de UI**: cualquier componente nuevo debe seguir este patrón.
3. **Prueba de oro literal end-to-end pendiente.** Insertar un EP cursado **real** y ver subir el KPI en pantalla **no** se ejecutó para no mutar los datos reales en la nube; se verificó el mecanismo en la capa de datos. Queda como tarea opcional con `npm run dev`.

---

## 6. Principios de consistencia (vigentes — resumen)

Detalle completo en `instructions.md §6`. Lo esencial a no romper:
1. **KPIs/agregados desde vistas SQL** (`v_kpis_proyecto`, `v_ccss_resumen`, `v_oc_resumen`); prohibido sumar en JS — *con la excepción ya documentada de las distribuciones, que debería cerrarse con vistas*.
2. **Server Components por defecto**; `"use client"` sólo si hay interactividad. **Capa server (Actions/Route Handlers) como API**; el cliente no llama a Supabase para operaciones sensibles.
3. **`service_role` solo en servidor**; nunca `NEXT_PUBLIC_*` ni cliente. **RLS activo**, errores de permiso con mensaje claro.
4. **TypeScript estricto**, sin `any`; tipos desde `lib/database.types.ts`. **`zod`** en cada formulario; regla **Σ EP cursados ≤ monto OC**.
5. **UF** con `Intl.NumberFormat('es-CL', …)` desde `lib/format.ts`; **colores/estados** desde `lib/constants.ts`. UI en español.
6. **No tocar el esquema** salvo que la tarea lo pida; si se requiere, crear migración y **regenerar tipos** (`npx supabase gen types … --project-id <REF>`), luego avisar.
7. **shadcn = Base UI**: usar `render={…}`, no `asChild`.

---

## 7. Trabajo pendiente (backlog de mejoras, priorizado)

### A. Cerrar deuda de la v1 (recomendado antes de nuevas features)
- **Vistas de distribución** `v_dist_empresa` y `v_dist_estado` (+ regenerar tipos) para que las distribuciones del dashboard se lean de la BD y se elimine la excepción del §5.1.
- **Prueba de oro en vivo** (opcional): con `npm run dev`, cursar un EP de prueba y confirmar en pantalla que sube el KPI; revertir el dato de prueba al terminar.

### B. Iteración 2 — funcionalidades (orden sugerido por valor)
1. **Exportación a PPTX/PDF del deck semanal** — cierra el círculo con la presentación que originó el proyecto; el de mayor impacto para el comité. (Aquí podría entrar el worker delgado si la generación es pesada.)
2. **Carga masiva desde Excel** — importar el Plan de Compras actual (mapeo → validación → confirmación) para no recapturar.
3. **Roles diferenciados en UI** — `aprobador` (revisar/aprobar EP/CCSS) y `visualizador` (solo lectura), apoyados en RLS.
4. **Auditoría** (trigger + tabla `auditoria`) y **alertas de hitos** (EP pendientes, fechas próximas).

### C. Despliegue (diferido a propósito)
- **GitHub + Vercel + Supabase staging/prod**: migraciones versionadas (`supabase link` + `db push`; el seed se corre aparte), variables de entorno por ambiente, dominios. Reutiliza el mismo esquema. Pendiente de `deploy.md`.

---

## 8. Estructura del repo (archivos clave)

```
instructions.md      ← metodología + backlog operativo (fuente de verdad para ejecutar)
context.md           ← este archivo (contexto e historia)
CLAUDE.md            ← convenciones rápidas
NOTES.md             ← decisiones de implementación (excepción de vistas, Base UI, etc.)
PROGRESS.md          ← estado de tareas
supabase/            ← 0001_init.sql (esquema+RLS+vistas) · seed.sql (cartera real)
lib/supabase/{client,server}.ts · middleware.ts
lib/{queries,format,constants,database.types}.ts
app/(auth)/login · app/(app)/{layout,dashboard,empresas,cambios-servicio,...}
components/{ui,charts}/ · components/kpi-card.tsx
```

---

## 9. Cómo continuar (para Claude Code)

1. Lee este `context.md` y luego `instructions.md` (metodología §7) y `NOTES.md`.
2. Trabaja **una tarea acotada a la vez** con el ciclo: *plan breve → implementar mínimo → validar (tsc/lint + criterios) → commit convencional → actualizar `PROGRESS.md` → siguiente*.
3. Respeta los guardrails (§6) y el patrón **Base UI** (`render={…}`).
4. **Detente y pregunta** solo ante: acción humana requerida (login interactivo para regenerar tipos), cambio de esquema, ambigüedad real, o riesgo de romper un guardrail.
5. **Recomendación de arranque:** comenzar por **§7.A** (vistas de distribución + prueba de oro) para dejar la v1 100% consistente; luego abordar la primera épica de iteración 2 que el equipo priorice (sugerido: **exportación PPTX/PDF**).

### Comandos de referencia (cloud)
```bash
npm run dev          # http://localhost:3000
npx tsc --noEmit     # tipos
npm run lint         # ESLint
npm run build        # build de producción
# Tras cambiar el esquema en la nube (SQL Editor), regenerar tipos:
npx supabase gen types typescript --project-id <REF> > lib/database.types.ts
```

---

### Verdades que no deben perderse
- Los KPIs se **calculan**, no se digitan; las cifras de oro son el contrato de regresión.
- `service_role` jamás en el cliente; **RLS** es la protección (BD en internet).
- shadcn aquí es **Base UI** → `render={…}`, no `asChild`.
- El "backend" es la **capa server de Next.js**; un servicio separado solo se evalúa para procesos pesados puntuales.
