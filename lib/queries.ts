import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/lib/database.types";

/**
 * Capa de acceso a datos (servidor). Todos los agregados/KPIs se leen desde las
 * vistas SQL (`v_kpis_proyecto`, `v_ccss_resumen`, `v_oc_resumen`); nunca se
 * suman totales en JS/TS.
 */

export type Kpis = Tables<"v_kpis_proyecto">;
export type CcssResumen = Tables<"v_ccss_resumen">;
export type Empresa = Tables<"empresas">;
export type OrdenCompra = Tables<"ordenes_compra">;
export type EstadoPago = Tables<"estados_pago">;

export type CcssListItem = CcssResumen & {
  empresa: { nombre: string } | null;
};

export type OcConResumen = OrdenCompra & {
  facturado_uf: number;
  saldo_uf: number;
};

/** Campos editables de un CCSS (tabla base), incluido `fecha_entrega_terreno`
 * que la vista no expone. Se usa para precargar el formulario de edición. */
export type CcssEditable = Pick<
  Tables<"cambios_servicio">,
  | "id"
  | "empresa_id"
  | "nombre"
  | "fase"
  | "tipo_financiamiento"
  | "proyeccion_uf"
  | "sector"
  | "ubicacion"
  | "plazo_dias_habiles"
  | "fecha_entrega_terreno"
  | "observaciones"
>;

const CCSS_EDITABLE_COLUMNS =
  "id,empresa_id,nombre,fase,tipo_financiamiento,proyeccion_uf,sector,ubicacion,plazo_dias_habiles,fecha_entrega_terreno,observaciones";

export type CcssFiltros = {
  empresaId?: string;
  fase?: Enums<"fase_ccss">;
  tipoFinanciamiento?: Enums<"tipo_financiamiento">;
  estado?: string;
  sector?: Enums<"sector_obra">;
};

/** KPIs del proyecto desde `v_kpis_proyecto`. Sin `proyectoId` devuelve el único proyecto. */
export async function getKpis(proyectoId?: string): Promise<Kpis | null> {
  const supabase = await createClient();
  let query = supabase.from("v_kpis_proyecto").select("*");
  if (proyectoId) query = query.eq("proyecto_id", proyectoId);
  const { data, error } = await query.limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

/** Lista de CCSS desde `v_ccss_resumen` con el nombre de la empresa y filtros opcionales. */
export async function listCcss(
  filtros: CcssFiltros = {},
): Promise<CcssListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("v_ccss_resumen")
    .select("*, empresa:empresas(nombre)")
    .order("nombre", { ascending: true });

  if (filtros.empresaId) query = query.eq("empresa_id", filtros.empresaId);
  if (filtros.fase) query = query.eq("fase", filtros.fase);
  if (filtros.tipoFinanciamiento)
    query = query.eq("tipo_financiamiento", filtros.tipoFinanciamiento);
  if (filtros.estado) query = query.eq("estado", filtros.estado);
  if (filtros.sector) query = query.eq("sector", filtros.sector);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Un CCSS (resumen) por id, con el nombre de la empresa. */
export async function getCcss(id: string): Promise<CcssListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_ccss_resumen")
    .select("*, empresa:empresas(nombre)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Campos editables de todos los CCSS (tabla base), indexable por id. */
export async function listCcssEditable(): Promise<CcssEditable[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cambios_servicio")
    .select(CCSS_EDITABLE_COLUMNS);
  if (error) throw error;
  return data ?? [];
}

/** Órdenes de compra de un CCSS, enriquecidas con facturado/saldo de `v_oc_resumen`. */
export async function listOc(ccssId: string): Promise<OcConResumen[]> {
  const supabase = await createClient();
  const [ocResult, resumenResult] = await Promise.all([
    supabase
      .from("ordenes_compra")
      .select("*")
      .eq("cambio_servicio_id", ccssId)
      .order("numero_oc", { ascending: true }),
    supabase
      .from("v_oc_resumen")
      .select("*")
      .eq("cambio_servicio_id", ccssId),
  ]);

  if (ocResult.error) throw ocResult.error;
  if (resumenResult.error) throw resumenResult.error;

  const resumenById = new Map(
    (resumenResult.data ?? []).map((r) => [r.id, r]),
  );

  return (ocResult.data ?? []).map((oc) => {
    const resumen = resumenById.get(oc.id);
    return {
      ...oc,
      facturado_uf: resumen?.facturado_uf ?? 0,
      saldo_uf: resumen?.saldo_uf ?? oc.monto_uf,
    };
  });
}

/** OC con su CCSS/empresa padre y facturado/saldo desde `v_oc_resumen`.
 * Para el módulo standalone de Órdenes de Compra. */
export type OcListItem = OrdenCompra & {
  facturado_uf: number;
  saldo_uf: number;
  cambio_servicio: {
    nombre: string;
    empresa: { nombre: string } | null;
  } | null;
};

/** Todas las OC del proyecto, con padre y facturado/saldo (desde la vista). */
export async function listAllOc(): Promise<OcListItem[]> {
  const supabase = await createClient();
  const [ocResult, resumenResult] = await Promise.all([
    supabase
      .from("ordenes_compra")
      .select(
        "*, cambio_servicio:cambios_servicio(nombre, empresa:empresas(nombre))",
      )
      .order("numero_oc", { ascending: true }),
    supabase.from("v_oc_resumen").select("*"),
  ]);

  if (ocResult.error) throw ocResult.error;
  if (resumenResult.error) throw resumenResult.error;

  const resumenById = new Map(
    (resumenResult.data ?? []).map((r) => [r.id, r]),
  );

  return (ocResult.data ?? []).map((oc) => {
    const resumen = resumenById.get(oc.id);
    return {
      ...oc,
      facturado_uf: resumen?.facturado_uf ?? 0,
      saldo_uf: resumen?.saldo_uf ?? oc.monto_uf,
    };
  });
}

/** Estados de pago de una OC. */
export async function listEp(ocId: string): Promise<EstadoPago[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estados_pago")
    .select("*")
    .eq("orden_compra_id", ocId)
    .order("numero_ep", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** EP con su OC y CCSS padre. Para el módulo standalone de Estados de Pago. */
export type EpListItem = EstadoPago & {
  orden_compra: {
    numero_oc: string;
    monto_uf: number;
    cambio_servicio: {
      id: string;
      nombre: string;
      empresa: { nombre: string } | null;
    } | null;
  } | null;
};

/** Todos los EP del proyecto, con OC y CCSS padre. */
export async function listAllEp(): Promise<EpListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("estados_pago")
    .select(
      "*, orden_compra:ordenes_compra(numero_oc, monto_uf, cambio_servicio:cambios_servicio(id, nombre, empresa:empresas(nombre)))",
    )
    .order("numero_ep", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Catálogo de empresas. */
export async function listEmpresas(): Promise<Empresa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .order("nombre", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
