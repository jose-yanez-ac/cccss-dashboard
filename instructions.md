# instructions.md — Brief de ejecución para Claude Code
## Plataforma de Gestión de Cambios de Servicios (CCSS) · Túnel Lo Ruiz

> **Este archivo es la fuente de verdad operativa del proyecto.** Léelo completo antes de actuar. Contiene el contexto, los roles que debes asumir, la metodología de trabajo, los principios de consistencia y el **backlog de tareas acotadas** con sus criterios de aceptación. Avanza de forma autónoma, una tarea a la vez, validando antes de continuar. `CLAUDE.md` resume las mismas convenciones para sesiones cortas; si hay conflicto, **manda este archivo**.

---

## 1. Cómo debes operar (resumen ejecutivo)

- Trabaja el **backlog (§9)** en orden, **una tarea acotada a la vez**. No agrupes tareas ni adelantes trabajo futuro.
- Para cada tarea aplica el **ciclo por tarea (§7)**: planificar → implementar mínimo → validar → commit → siguiente.
- Respeta sin excepción los **principios de consistencia (§6)**. Si una tarea te obligara a romper uno, **detente y avisa**.
- Mantén un archivo **`PROGRESS.md`** con el estado de cada tarea (`[ ]` / `[x]`), actualizado en cada commit.
- **Detente y pregunta** solo en las condiciones de §7.4 (acción humana requerida, ambigüedad real, o riesgo de romper un guardrail). En lo demás, decide y avanza.

---

## 2. Estado actual del proyecto (punto de partida)

Ya está hecho:
- App **Next.js (App Router) + TypeScript + Tailwind** creada; **dependencias** instaladas (`@supabase/supabase-js`, `@supabase/ssr`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-table`, `recharts`, `lucide-react`) y **shadcn/ui** inicializado con componentes base.
- **Supabase Cloud** operativo: esquema (`0001_init.sql`) y datos (`seed.sql`) **ya aplicados**; **usuario** creado con **rol `admin`** asignado.
- **`.env.local`** presente con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
- `npm run dev` levanta `http://localhost:3000`.

Punto de partida del backlog: **T-00** (verificar tipos de BD), luego construir conexión → auth → datos → mantenedores → dashboard.

No se usa Supabase local ni Docker. La BD vive en la nube; la app corre en local apuntando a ella.

---

## 3. Contexto de negocio y dominio

La concesionaria **Víaschile – Autopista Central** ejecuta el proyecto **Túnel Lo Ruiz**. Participan **OHLA** (constructora) y la **Inspección Fiscal / MOP** (fiscalización). Un **Cambio de Servicio (CCSS)** es la modificación/relocalización de un servicio de utilidad (agua, electricidad, gas, telecomunicaciones, canales, semaforización) que cruza la obra.

Conceptos clave:
- Todo se mide en **UF**. Formato chileno: `76.243,36` (punto miles, coma decimal).
- Un CCSS pertenece a una **empresa prestadora** y a una **fase** (`ingenieria` | `construccion`).
- **Tipo de financiamiento** (`tipo_financiamiento`):
  - `con_oc`: tiene una o más **Órdenes de Compra (OC)**; cada OC se paga con uno o varios **Estados de Pago (EP)**.
  - `proyeccion`: aún sin OC; sólo lleva una **proyección de presupuesto** (`proyeccion_uf`, el "bluff").
  - `autofinanciamiento`: lo asume el prestador, costo UF 0 para el proyecto.
- Un CCSS puede tener **varias OC** (caso ENEL) y, además, una **proyección** que coexiste con su OC (caso Aguas Andinas AVN).
- Jerarquía: **`cambios_servicio` → `ordenes_compra` → `estados_pago`**.
- **Estado** de un CCSS (derivado en la vista, no se guarda): `pagado_total` · `pagado_parcial` · `pendiente` · `proyeccion` · `autofinanciamiento`.

La cartera cargada tiene **35 CCSS** (14 con OC / 15 en proyección / 6 autofinanciamiento). El objetivo de la app es un **back office** para mantener estos datos y un **dashboard** que reproduzca, en vivo, la presentación semanal del comité.

### Cifras de validación (deben cumplirse siempre)
`select … from v_kpis_proyecto;` debe entregar:

| total_contratado_uf | facturado_uf | proyeccion_total_uf | brecha_ds153_uf | total_ccss |
|---|---|---|---|---|
| 76243.36 | 16247.98 | 320765.88 | 97678.88 | 35 |

> `facturado_uf = 16247.98` corresponde a los EP **documentados** (21,3%). El valor "de planilla" era 31.419,18 (41,21%), que incluye EP no detallados; **subirá solo** cuando se carguen esos EP desde el mantenedor. Nunca ajustes un KPI a mano.

---

## 4. Arquitectura y stack

- **Frontend/SSR:** Next.js (App Router) + React + TypeScript, desplegable luego en Vercel.
- **UI:** Tailwind + **shadcn/ui**; gráficos con **Recharts**; íconos `lucide-react`.
- **Datos/Auth/Storage:** **Supabase Cloud** (PostgreSQL 15 + Auth + Storage), acceso con **`@supabase/ssr`**.
- **Formularios:** `react-hook-form` + `zod`. **Tablas:** `@tanstack/react-table`.
- **Lógica de negocio en la BD:** vistas SQL para KPIs, **RLS** para autorización.

Capas: Presentación (componentes server por defecto) → Acceso a datos (`lib/queries.ts`, server) → Mutaciones (Server Actions con `revalidatePath`) → Supabase (PostgREST + RLS).

### Modelo de datos (ya creado en la nube)
Tablas: `proyectos`, `empresas`, `cambios_servicio`, `ordenes_compra`, `estados_pago`, `hitos`, `perfiles`.
Vistas (calculadas, `security_invoker = on`): **`v_oc_resumen`**, **`v_ccss_resumen`**, **`v_kpis_proyecto`**.
RLS: lectura para autenticados; escritura para `admin`/`gestor` (función `public.rol_actual()`). Trigger crea `perfiles` al registrarse un usuario.

---

## 5. Roles que debes asumir

Durante el desarrollo cambias de "sombrero" según la fase de cada tarea. Antes de codear, piensa como Arquitecto; al validar, como QA.

- **Arquitecto de software** — antes de implementar cada épica/tarea: confirma que el enfoque respeta §4 y §6 (capas, vistas para KPIs, RLS, server vs client). Si detectas deuda o inconsistencia, corrígela o avisa.
- **Desarrollador full-stack** — implementa el cambio **mínimo** de la tarea con código tipado, limpio y coherente con las convenciones (§8). No introduzcas dependencias nuevas sin justificar.
- **Ingeniero QA** — al cerrar cada tarea: corre `tsc`/lint, verifica los **criterios de aceptación**, y describe (o ejecuta) la prueba funcional. No marques una tarea como hecha si su criterio no se cumple.
- **Documentador** — deja **commits convencionales** claros, actualiza `PROGRESS.md`, y registra decisiones no obvias en comentarios breves o en `NOTES.md`.

---

## 6. Principios de consistencia (NO negociables)

**Arquitectónicos**
1. **KPIs y agregados SIEMPRE desde las vistas** (`v_kpis_proyecto`, `v_ccss_resumen`, `v_oc_resumen`). Prohibido sumar totales en JS/TS.
2. **Componentes server por defecto**; usa `"use client"` solo cuando haya interactividad real (formularios, gráficos, filtros).
3. **Acceso a datos centralizado** en `lib/queries.ts` (server, cliente de servidor). **Mutaciones** vía **Server Actions** con `revalidatePath`/`revalidateTag`.
4. **No modifiques el esquema SQL** salvo que una tarea lo pida explícitamente. Si fuera imprescindible, crea una migración nueva y **detente para que el humano regenere los tipos**.

**Técnicos**
5. **TypeScript estricto**, sin `any` (salvo justificación puntual comentada). Tipa todo desde `lib/database.types.ts`.
6. **`service_role` solo en servidor.** Jamás en componentes cliente ni en variables `NEXT_PUBLIC_*`.
7. **RLS activo**: maneja los errores de permiso con un mensaje claro al usuario (no los silencies).
8. **Validación con `zod`** en cada formulario. Regla de negocio obligatoria: la suma de **EP cursados ≤ monto de su OC** (saldo nunca negativo).
9. **Sin claves ni secretos** en el repo. Asume que `.env.local` está en `.gitignore`.

**Funcionales / UX**
10. **UF** siempre con `Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` desde `lib/format.ts`. Nunca formatees a mano.
11. **Colores y estados centralizados** en `lib/constants.ts` (mapa estado→color, ver §8). Úsalos en badges y gráficos para mantener coherencia con la presentación.
12. **Textos de UI en español.** Identificadores de código y de BD según los ya definidos (tablas/campos en español, como en el esquema).

---

## 7. Metodología de trabajo (ciclo por tarea)

### 7.1 Tamaño de una tarea
Una tarea = un cambio cohesionado y verificable (1 archivo principal + sus dependencias directas). Si una tarea “crece”, divídela y avisa en `PROGRESS.md`.

### 7.2 Ciclo por tarea
1. **Plan (breve):** en 2–4 líneas declara qué archivos crearás/modificarás y por qué. Para épicas grandes, usa *plan mode* antes de tocar archivos.
2. **Implementa lo mínimo** de la tarea. No adelantes funcionalidades de tareas posteriores.
3. **Valida:** `npx tsc --noEmit` y `npm run lint` sin errores nuevos; cumple los **criterios de aceptación** de la tarea; si es UI, indica la prueba manual concreta.
4. **Commit convencional** (un commit por tarea): `feat(scope): …`, `fix(scope): …`, `chore(scope): …`, `refactor(scope): …`. Incluye el código de tarea, ej. `feat(empresas): lista con búsqueda [T-40]`.
5. **Actualiza `PROGRESS.md`** (marca `[x]`) y pasa a la siguiente.

### 7.3 Manejo de errores
- Si una validación falla, **corrige antes de avanzar**; no acumules deuda entre tareas.
- Si un error proviene de RLS/permittido, revisa sesión y rol; no desactives RLS.
- Si un comando requiere login interactivo (browser), **no lo asumas**: pídelo al humano (ver 7.4).

### 7.4 Cuándo detenerte y preguntar (y solo entonces)
- Falta un prerrequisito que requiere acción humana: **generar tipos** (`supabase login` es interactivo), nuevas llaves, o decisiones de producto.
- Ambigüedad funcional real que cambie el resultado esperado.
- Una tarea exigiría romper un principio de §6 o modificar el esquema.
- Necesitas una dependencia nueva no contemplada.
En esos casos: explica el bloqueo en una frase, propón la opción recomendada, y espera.

---

## 8. Convenciones de código y estructura

Estructura objetivo:
```
app/(auth)/login/page.tsx
app/(app)/layout.tsx
app/(app)/dashboard/page.tsx
app/(app)/empresas/…
app/(app)/cambios-servicio/…  (+ [id] detalle con OC/EP)
app/(app)/ordenes-compra/…    (o integrado en el detalle)
app/(app)/estados-pago/…      (o integrado en el detalle)
components/ui/…               (shadcn)
components/charts/…           (Recharts)
components/kpi-card.tsx
lib/supabase/{client,server,middleware}.ts
lib/{queries,format,constants,database.types}.ts
middleware.ts                 (raíz)
```

`lib/constants.ts` (paleta y mapa de estados — única fuente):
```ts
export const COLORS = {
  navy: "#12243B", petrol: "#0E5A82", teal: "#1C7293",
  green: "#1E8E5A", amber: "#D98E04", orange: "#C0532B",
  blue: "#2D6CB0", slate: "#5E6E82", violet: "#6E59A5",
} as const;

export const ESTADO_CCSS = {
  pagado_total:      { label: "Pagado total",      color: COLORS.green },
  pagado_parcial:    { label: "Pagado parcial",    color: COLORS.amber },
  pendiente:         { label: "Pendiente",         color: COLORS.orange },
  proyeccion:        { label: "Proyección",        color: COLORS.blue },
  autofinanciamiento:{ label: "Autofinanciamiento",color: COLORS.slate },
} as const;
```

Reglas: nombres de archivos en `kebab-case`; componentes en `PascalCase`; funciones de datos en `camelCase`. Un componente por archivo. Sin lógica de negocio en componentes de presentación.

---

## 9. Backlog de tareas acotadas

> Ejecuta en orden. Cada tarea trae **objetivo**, **archivos** y **criterios de aceptación (CA)**. Marca el avance en `PROGRESS.md`.

### Épica 0 — Prerrequisitos
- **T-00 · Verificar tipos de BD.** Comprueba que exista `lib/database.types.ts` y comience con `export type Database`.
  - Si **no** existe o es inválido: **detente y pide al humano** ejecutar `npx supabase login` y `npx supabase gen types typescript --project-id <REF> > lib/database.types.ts` (en PowerShell usar `| Out-File -Encoding utf8`). No continúes hasta tenerlo.
  - **CA:** `lib/database.types.ts` válido y tipos importables.

### Épica 1 — Infraestructura de conexión
- **T-10 · Cliente browser.** `lib/supabase/client.ts` con `createBrowserClient<Database>` usando las env `NEXT_PUBLIC_*`. **CA:** compila; exporta un helper reutilizable.
- **T-11 · Cliente server.** `lib/supabase/server.ts` con `createServerClient<Database>` y `cookies()` de `next/headers`. **CA:** compila; usable en server components/actions.
- **T-12 · Middleware de sesión.** `middleware.ts` (raíz) que refresque la sesión por request (patrón oficial `@supabase/ssr`). **CA:** la navegación funciona; la sesión persiste tras recargar.
- **T-13 · Utilidades base.** `lib/format.ts` (`formatUF`, `formatDate`) y `lib/constants.ts` (§8). **CA:** `formatUF(76243.36) === "76.243,36"`.

### Épica 2 — Autenticación y shell
- **T-20 · Login.** `app/(auth)/login/page.tsx` con form (`react-hook-form` + `zod`) → `signInWithPassword` → redirige a `/dashboard`; muestra errores. **CA:** credenciales válidas entran; inválidas muestran mensaje.
- **T-21 · Layout protegido.** `app/(app)/layout.tsx` con sidebar (Dashboard, Cambios de Servicio, Órdenes de Compra, Estados de Pago, Empresas) y topbar (correo + "Salir"/`signOut`). Sin sesión → redirige a `/login`. **CA:** sin sesión no se accede a `/app/*`.
- **T-22 · Dashboard placeholder.** `app/(app)/dashboard/page.tsx` provisional. **CA:** se ve tras login; "Salir" cierra sesión.

### Épica 3 — Capa de datos
- **T-30 · Queries.** `lib/queries.ts` (server): `getKpis(proyectoId)`, `listCcss(filtros)`, `getCcss(id)`, `listOc(ccssId)`, `listEp(ocId)`, `listEmpresas()`. Agregados **solo** desde vistas. **CA:** un server component de prueba imprime `getKpis` con las cifras de §3.

### Épica 4 — Mantenedor Empresas (patrón base)
- **T-40 · Lista empresas.** `app/(app)/empresas/page.tsx` con tabla (`@tanstack/react-table`) + búsqueda. **CA:** muestra las 15 empresas del seed.
- **T-41 · CRUD empresas.** Crear/editar/eliminar en dialog (`zod`), vía **Server Actions** + `revalidatePath`; toasts (`sonner`); maneja error de RLS. **CA:** crear una empresa la muestra sin recargar; validaciones activas.

### Épica 5 — Cambios de Servicio
- **T-50 · Lista CCSS.** Desde `v_ccss_resumen`: empresa, nombre, fase, tipo_financiamiento, contratado_uf, facturado_uf, saldo_uf, n_oc, estado (Badge con `ESTADO_CCSS`). UF con `formatUF`. **CA:** 35 filas; montos/estados coinciden con §3.
- **T-51 · Filtros CCSS.** Filtros combinables: empresa, fase, tipo_financiamiento, estado, sector. **CA:** filtrar "ENEL" reduce la lista coherentemente.
- **T-52 · CRUD CCSS.** Crear/editar (dialog, `zod`): empresa, nombre, fase, tipo_financiamiento, proyeccion_uf, sector, ubicacion, plazo_dias_habiles, fecha_entrega_terreno, observaciones. **CA:** alta/edición persisten y se reflejan en la lista.
- **T-53 · Detalle CCSS.** `app/(app)/cambios-servicio/[id]/page.tsx` con jerarquía OC → EP y subtotales calculados. **CA:** un CCSS de ENEL muestra sus 2 OC.

### Épica 6 — Órdenes de Compra y Estados de Pago
- **T-60 · CRUD OC.** En el detalle del CCSS: numero_oc (único), monto_uf, fecha_emision, estado. **CA:** crear OC actualiza `contratado_uf` del CCSS.
- **T-61 · CRUD EP.** numero_ep, monto_uf, fecha, estado (`pendiente`/`cursado`), factura_url. Valida `zod`: Σ EP cursados ≤ monto OC. Revalida al guardar. **CA (prueba de oro):** agregar un EP **cursado** a una OC pendiente **sube facturado** y **baja saldo** en listado y dashboard, sin tocar totales.

### Épica 7 — Dashboard
- **T-70 · Tarjetas KPI.** `components/kpi-card.tsx` + dashboard: Total contratado, Facturado (`pct_facturado`), Proyección total, DS N°153. UF con `formatUF`. **CA:** muestran 76.243,36 · 16.247,98 (21,3%) · 320.765,88 · 223.087,00.
- **T-71 · Gráficos núcleo.** Dona "facturado vs saldo" + barras comparativas (facturado/contratado/DS153/proyección). **CA:** valores coherentes con las vistas.
- **T-72 · Distribución.** Barras "contratado por empresa" y "proyección por empresa"; dona "CCSS por estado" (35) con leyenda y colores de `ESTADO_CCSS`. **CA:** la dona suma 35.
- **T-73 · Filtros del dashboard.** Filtros globales (empresa, fase, estado, sector) que afecten tarjetas, tablas y gráficos. **CA:** filtrar actualiza todo de forma consistente.

### Épica 8 — Cierre v1
- **T-80 · Calidad.** `npx tsc --noEmit` y `npm run lint` limpios; sin `any` injustificado; sin `service_role` en cliente; agregados solo desde vistas. **CA:** ambos comandos pasan.
- **T-81 · DoD.** Verifica la checklist de §10 y deja en `NOTES.md` un resumen de archivos por módulo y mejoras futuras. **CA:** todos los ítems de §10 marcados.

---

## 10. Definition of Done (v1)

- [ ] `npm run dev`, `tsc --noEmit` y `lint` sin errores.
- [ ] Login/logout OK; sin sesión todo redirige a `/login`.
- [ ] `v_kpis_proyecto` → 76243.36 / 16247.98 / 320765.88 / 97678.88 / 35.
- [ ] Lista CCSS = 35 con estados/montos correctos y filtros operativos.
- [ ] Detalle CCSS con jerarquía OC→EP; ENEL con 2 OC por servicio.
- [ ] CRUD de empresa, CCSS, OC y EP con validación (EP ≤ saldo OC).
- [ ] **Prueba de oro (T-61)** cumplida.
- [ ] Dashboard completo (4 tarjetas + dona avance + barras + dona por estado + leyenda + filtros).
- [ ] UF en formato chileno en toda la UI; colores/estados desde `lib/constants.ts`.

---

## 11. Comandos de referencia (cloud)

```bash
npm run dev                 # http://localhost:3000
npx tsc --noEmit            # chequeo de tipos
npm run lint                # ESLint
# Tras CUALQUIER cambio de esquema en la nube, regenerar tipos (requiere login):
npx supabase gen types typescript --project-id <REF> > lib/database.types.ts
```
Cambios de esquema: aplicarlos en el **SQL Editor** del proyecto cloud. No hay Supabase local.

---

## 12. Fuera de alcance de la v1 (no implementar aún)

Auditoría con triggers, roles diferenciados en UI (aprobador/visualizador), alertas de hitos, exportación PPTX/PDF, carga masiva desde Excel y **despliegue (GitHub + Vercel)**. Se abordarán en una iteración posterior reutilizando este mismo esquema.

---

### Primer movimiento esperado
Crea `PROGRESS.md` con el backlog de §9 en casillas, ejecuta **T-00** (verificación de tipos) y, según su resultado, continúa con **T-10** o detente para pedir la generación de tipos. A partir de ahí, avanza tarea por tarea siguiendo el ciclo de trabajo.
