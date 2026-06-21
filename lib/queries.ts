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
