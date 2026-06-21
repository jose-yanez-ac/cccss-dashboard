"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { DashboardPublic } from "@/lib/dashboard-public";
import { formatPct, formatUF } from "@/lib/format";
import {
  COLORS,
  ESTADO_CCSS,
  FASE_LABEL,
  SECTOR_LABEL,
  type EstadoCcss,
} from "@/lib/constants";
import { KpiCard } from "@/components/kpi-card";
import { EstadoBadge } from "@/components/ccss/estado-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FacturadoDonut } from "@/components/charts/facturado-donut";
import { ComparativoBars } from "@/components/charts/comparativo-bars";
import { PorEmpresaBars } from "@/components/charts/por-empresa-bars";
import { EstadoDonut } from "@/components/charts/estado-donut";

const ALL = "all";

type Filters = {
  empresa: string;
  fase: string;
  estado: string;
  sector: string;
};

const INITIAL_FILTERS: Filters = {
  empresa: ALL,
  fase: ALL,
  estado: ALL,
  sector: ALL,
};

type FilterOption = { value: string; label: string };

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as string)}>
      <SelectTrigger className="w-[170px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: todos</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function PublicDashboard({ initial }: { initial: DashboardPublic }) {
  const [data, setData] = useState<DashboardPublic>(initial);
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [isPending, startTransition] = useTransition();

  const filtersActive = Object.values(filters).some((v) => v !== ALL);

  // Recarga desde el handler del evento (no en un efecto). El filtrado lo hace
  // la función `dashboard_public` en la BD → paridad exacta con el autenticado.
  function applyFilters(next: Filters) {
    setFilters(next);
    startTransition(async () => {
      const supabase = createClient();
      const { data: payload } = await supabase.rpc("dashboard_public", {
        p_empresa: next.empresa === ALL ? undefined : next.empresa,
        p_fase: next.fase === ALL ? undefined : next.fase,
        p_estado: next.estado === ALL ? undefined : next.estado,
        p_sector: next.sector === ALL ? undefined : next.sector,
      });
      if (payload) setData(payload as unknown as DashboardPublic);
    });
  }

  const { kpis, proyecto } = data;
  const ds153 = proyecto?.ds153_uf ?? 0;
  const brecha = kpis.proyeccion_total_uf - ds153;

  const contratadoEmpresa = data.por_empresa
    .map((e) => ({ empresa: e.empresa, value: e.contratado_uf }))
    .filter((d) => d.value > 0);
  const proyeccionEmpresa = data.por_empresa
    .map((e) => ({ empresa: e.empresa, value: e.proyeccion_uf }))
    .filter((d) => d.value > 0);
  const porEstado = data.por_estado.map((s) => {
    const cfg = ESTADO_CCSS[s.estado as EstadoCcss];
    return {
      estado: s.estado,
      label: cfg?.label ?? s.estado,
      value: s.n_ccss,
      color: cfg?.color ?? "#9CA3AF",
    };
  });

  return (
    <div
      className="space-y-6 transition-opacity"
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Empresa"
          value={filters.empresa}
          onValueChange={(v) => applyFilters({ ...filters, empresa: v })}
          options={data.empresas.map((e) => ({ value: e.id, label: e.nombre }))}
        />
        <FilterSelect
          label="Fase"
          value={filters.fase}
          onValueChange={(v) => applyFilters({ ...filters, fase: v })}
          options={Object.entries(FASE_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <FilterSelect
          label="Estado"
          value={filters.estado}
          onValueChange={(v) => applyFilters({ ...filters, estado: v })}
          options={Object.entries(ESTADO_CCSS).map(([value, cfg]) => ({
            value,
            label: cfg.label,
          }))}
        />
        <FilterSelect
          label="Sector"
          value={filters.sector}
          onValueChange={(v) => applyFilters({ ...filters, sector: v })}
          options={Object.entries(SECTOR_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        {filtersActive && (
          <button
            type="button"
            onClick={() => applyFilters(INITIAL_FILTERS)}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {kpis.total_ccss} CCSS
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total contratado"
          value={`${formatUF(kpis.total_contratado_uf)} UF`}
          accentColor={COLORS.petrol}
        />
        <KpiCard
          title="Facturado"
          value={`${formatUF(kpis.facturado_uf)} UF`}
          hint={`${formatPct(kpis.pct_facturado)} del contratado`}
          accentColor={COLORS.green}
        />
        <KpiCard
          title="Proyección total"
          value={`${formatUF(kpis.proyeccion_total_uf)} UF`}
          accentColor={COLORS.blue}
        />
        <KpiCard
          title="DS N°153"
          value={`${formatUF(ds153)} UF`}
          hint={
            filtersActive ? "Tope del proyecto" : `Brecha: ${formatUF(brecha)} UF`
          }
          accentColor={COLORS.violet}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Avance: facturado vs saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FacturadoDonut
              facturado={kpis.facturado_uf}
              saldo={kpis.saldo_uf}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparativo (UF)</CardTitle>
          </CardHeader>
          <CardContent>
            <ComparativoBars
              contratado={kpis.total_contratado_uf}
              facturado={kpis.facturado_uf}
              ds153={ds153}
              proyeccion={kpis.proyeccion_total_uf}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
                {data.ccss.length ? (
                  data.ccss.map((r, i) => (
                    <TableRow key={`${r.empresa}-${r.nombre}-${i}`}>
                      <TableCell>{r.empresa}</TableCell>
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

      <div className="flex justify-center pt-2">
        <Button variant="outline" render={<Link href="/login" />}>
          <LogIn className="size-4" />
          Iniciar sesión para gestionar
        </Button>
      </div>
    </div>
  );
}
