import { getKpis } from "@/lib/queries";
import { formatPct, formatUF } from "@/lib/format";
import { COLORS } from "@/lib/constants";
import { KpiCard } from "@/components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FacturadoDonut } from "@/components/charts/facturado-donut";
import { ComparativoBars } from "@/components/charts/comparativo-bars";

export default async function DashboardPage() {
  const kpis = await getKpis();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen del proyecto {kpis?.nombre ?? "Túnel Lo Ruiz"}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total contratado"
          value={`${formatUF(kpis?.total_contratado_uf)} UF`}
          accentColor={COLORS.petrol}
        />
        <KpiCard
          title="Facturado"
          value={`${formatUF(kpis?.facturado_uf)} UF`}
          hint={`${formatPct(kpis?.pct_facturado)} del contratado`}
          accentColor={COLORS.green}
        />
        <KpiCard
          title="Proyección total"
          value={`${formatUF(kpis?.proyeccion_total_uf)} UF`}
          accentColor={COLORS.blue}
        />
        <KpiCard
          title="DS N°153"
          value={`${formatUF(kpis?.ds153_uf)} UF`}
          hint={`Brecha: ${formatUF(kpis?.brecha_ds153_uf)} UF`}
          accentColor={COLORS.violet}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avance: facturado vs saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <FacturadoDonut
              facturado={kpis?.facturado_uf ?? 0}
              saldo={kpis?.saldo_uf ?? 0}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparativo (UF)</CardTitle>
          </CardHeader>
          <CardContent>
            <ComparativoBars
              contratado={kpis?.total_contratado_uf ?? 0}
              facturado={kpis?.facturado_uf ?? 0}
              ds153={kpis?.ds153_uf ?? 0}
              proyeccion={kpis?.proyeccion_total_uf ?? 0}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
