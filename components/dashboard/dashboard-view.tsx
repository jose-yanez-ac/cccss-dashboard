"use client";

import { useMemo, useState } from "react";

import type { CcssListItem, Kpis } from "@/lib/queries";
import { formatPct, formatUF } from "@/lib/format";
import {
  COLORS,
  ESTADO_CCSS,
  FASE_LABEL,
  SECTOR_LABEL,
} from "@/lib/constants";
import {
  agregadosFiltrados,
  ccssPorEstado,
  contratadoPorEmpresa,
  proyeccionPorEmpresa,
} from "@/lib/dashboard";
import { KpiCard } from "@/components/kpi-card";
import { EstadoBadge } from "@/components/ccss/estado-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FilterSelect,
  FILTER_ALL as ALL,
  type FilterOption,
} from "@/components/filter-select";
import { FacturadoDonut } from "@/components/charts/facturado-donut";
import { ComparativoBars } from "@/components/charts/comparativo-bars";
import { PorEmpresaBars } from "@/components/charts/por-empresa-bars";
import { EstadoDonut } from "@/components/charts/estado-donut";

type Filters = {
  empresa: string;
  fase: string;
  estado: string;
  sector: string;
};

const INITIAL: Filters = {
  empresa: ALL,
  fase: ALL,
  estado: ALL,
  sector: ALL,
};

export function DashboardView({
  kpis,
  ccss,
}: {
  kpis: Kpis | null;
  ccss: CcssListItem[];
}) {
  const [filters, setFilters] = useState<Filters>(INITIAL);
  const filtersActive = Object.values(filters).some((v) => v !== ALL);

  const empresaOptions = useMemo<FilterOption[]>(() => {
    const names = Array.from(
      new Set(ccss.map((r) => r.empresa?.nombre).filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b, "es"));
    return names.map((n) => ({ value: n, label: n }));
  }, [ccss]);

  const filtered = useMemo(() => {
    return ccss.filter((row) => {
      if (filters.empresa !== ALL && row.empresa?.nombre !== filters.empresa)
        return false;
      if (filters.fase !== ALL && row.fase !== filters.fase) return false;
      if (filters.estado !== ALL && row.estado !== filters.estado) return false;
      if (filters.sector !== ALL && row.sector !== filters.sector) return false;
      return true;
    });
  }, [ccss, filters]);

  const agg = useMemo(() => agregadosFiltrados(filtered), [filtered]);

  // Sin filtros: cifras exactas desde v_kpis_proyecto. Con filtros: subconjunto.
  const contratado = filtersActive
    ? agg.contratado
    : (kpis?.total_contratado_uf ?? 0);
  const facturado = filtersActive ? agg.facturado : (kpis?.facturado_uf ?? 0);
  const saldo = filtersActive ? agg.saldo : (kpis?.saldo_uf ?? 0);
  const proyeccion = filtersActive
    ? agg.proyeccion
    : (kpis?.proyeccion_total_uf ?? 0);
  const pctFacturado = filtersActive
    ? agg.pctFacturado
    : (kpis?.pct_facturado ?? 0);
  const ds153 = kpis?.ds153_uf ?? 0;

  const contratadoEmpresa = useMemo(
    () => contratadoPorEmpresa(filtered),
    [filtered],
  );
  const proyeccionEmpresa = useMemo(
    () => proyeccionPorEmpresa(filtered),
    [filtered],
  );
  const porEstado = useMemo(() => ccssPorEstado(filtered), [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen del proyecto {kpis?.nombre ?? "Túnel Lo Ruiz"}.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Empresa"
          value={filters.empresa}
          onValueChange={(v) => setFilters((f) => ({ ...f, empresa: v }))}
          options={empresaOptions}
        />
        <FilterSelect
          label="Fase"
          value={filters.fase}
          onValueChange={(v) => setFilters((f) => ({ ...f, fase: v }))}
          options={Object.entries(FASE_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <FilterSelect
          label="Estado"
          value={filters.estado}
          onValueChange={(v) => setFilters((f) => ({ ...f, estado: v }))}
          options={Object.entries(ESTADO_CCSS).map(([value, cfg]) => ({
            value,
            label: cfg.label,
          }))}
        />
        <FilterSelect
          label="Sector"
          value={filters.sector}
          onValueChange={(v) => setFilters((f) => ({ ...f, sector: v }))}
          options={Object.entries(SECTOR_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        {filtersActive && (
          <button
            type="button"
            onClick={() => setFilters(INITIAL)}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} CCSS
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total contratado"
          value={`${formatUF(contratado)} UF`}
          accentColor={COLORS.petrol}
        />
        <KpiCard
          title="Facturado"
          value={`${formatUF(facturado)} UF`}
          hint={`${formatPct(pctFacturado)} del contratado`}
          accentColor={COLORS.green}
        />
        <KpiCard
          title="Proyección total"
          value={`${formatUF(proyeccion)} UF`}
          accentColor={COLORS.blue}
        />
        <KpiCard
          title="DS N°153"
          value={`${formatUF(ds153)} UF`}
          hint={
            filtersActive
              ? "Tope del proyecto"
              : `Brecha: ${formatUF(kpis?.brecha_ds153_uf)} UF`
          }
          accentColor={COLORS.violet}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Avance: facturado vs saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FacturadoDonut facturado={facturado} saldo={saldo} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparativo (UF)</CardTitle>
          </CardHeader>
          <CardContent>
            <ComparativoBars
              contratado={contratado}
              facturado={facturado}
              ds153={ds153}
              proyeccion={proyeccion}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contratado por empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <PorEmpresaBars data={contratadoEmpresa} color={COLORS.petrol} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proyección por empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <PorEmpresaBars data={proyeccionEmpresa} color={COLORS.blue} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CCSS por estado</CardTitle>
        </CardHeader>
        <CardContent>
          <EstadoDonut data={porEstado} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle de la cartera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Contratado UF</TableHead>
                  <TableHead className="text-right">Facturado UF</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length ? (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.empresa?.nombre ?? "—"}</TableCell>
                      <TableCell>{r.nombre}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUF(r.contratado_uf)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatUF(r.facturado_uf)}
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={r.estado} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Sin resultados para los filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
