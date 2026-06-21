import type { CcssListItem } from "@/lib/queries";
import { ESTADO_CCSS, type EstadoCcss } from "@/lib/constants";

/**
 * Agregaciones de distribución para el dashboard.
 *
 * Nota de arquitectura: los KPI de cabecera (total contratado, facturado,
 * proyección, DS153) se leen SIEMPRE de `v_kpis_proyecto` y nunca se calculan
 * aquí. Estas funciones sólo derivan *distribuciones* (por empresa / por estado)
 * agrupando las filas de la vista `v_ccss_resumen`, porque el esquema no provee
 * una vista de breakdown y crearla exigiría migración + regeneración de tipos
 * (fuera de alcance). Ver NOTES.md.
 */

export type EmpresaBar = { empresa: string; value: number };
export type EstadoSlice = { estado: string; label: string; value: number; color: string };

function sumPorEmpresa(
  rows: CcssListItem[],
  pick: (r: CcssListItem) => number | null,
): EmpresaBar[] {
  const acc = new Map<string, number>();
  for (const r of rows) {
    const nombre = r.empresa?.nombre ?? "—";
    acc.set(nombre, (acc.get(nombre) ?? 0) + (pick(r) ?? 0));
  }
  return Array.from(acc.entries())
    .map(([empresa, value]) => ({ empresa, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function contratadoPorEmpresa(rows: CcssListItem[]): EmpresaBar[] {
  return sumPorEmpresa(rows, (r) => r.contratado_uf);
}

export function proyeccionPorEmpresa(rows: CcssListItem[]): EmpresaBar[] {
  return sumPorEmpresa(rows, (r) => r.proyeccion_uf);
}

export function ccssPorEstado(rows: CcssListItem[]): EstadoSlice[] {
  const acc = new Map<string, number>();
  for (const r of rows) {
    const estado = r.estado ?? "sin_estado";
    acc.set(estado, (acc.get(estado) ?? 0) + 1);
  }
  return Array.from(acc.entries()).map(([estado, value]) => {
    const cfg = ESTADO_CCSS[estado as EstadoCcss];
    return {
      estado,
      label: cfg?.label ?? estado,
      value,
      color: cfg?.color ?? "#9CA3AF",
    };
  });
}

/** Agregados de la cartera filtrada (para tarjetas cuando hay filtros activos). */
export function agregadosFiltrados(rows: CcssListItem[]) {
  let contratado = 0;
  let facturado = 0;
  let saldo = 0;
  let proyeccion = 0;
  for (const r of rows) {
    contratado += r.contratado_uf ?? 0;
    facturado += r.facturado_uf ?? 0;
    saldo += r.saldo_uf ?? 0;
    proyeccion += r.proyeccion_uf ?? 0;
  }
  const pctFacturado = contratado > 0 ? (facturado / contratado) * 100 : 0;
  return { contratado, facturado, saldo, proyeccion, pctFacturado };
}
