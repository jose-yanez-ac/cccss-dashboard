import { listAllEp, listAllOc } from "@/lib/queries";
import { EpTable } from "@/components/ep/ep-table";

export default async function EstadosPagoPage() {
  const [eps, ocs] = await Promise.all([listAllEp(), listAllOc()]);

  // Cupo ya cursado por OC, a partir de los EP.
  const cursadoPorOc = new Map<string, number>();
  for (const ep of eps) {
    if (ep.estado === "cursado") {
      cursadoPorOc.set(
        ep.orden_compra_id,
        (cursadoPorOc.get(ep.orden_compra_id) ?? 0) + ep.monto_uf,
      );
    }
  }

  const ocOptions = ocs.map((oc) => ({
    id: oc.id,
    ccssId: oc.cambio_servicio_id,
    label: `OC ${oc.numero_oc} — ${oc.cambio_servicio?.nombre ?? "—"}`,
    montoUf: oc.monto_uf,
    cursadoUf: cursadoPorOc.get(oc.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Estados de Pago
        </h1>
        <p className="text-sm text-muted-foreground">
          Todos los EP del proyecto, con su OC y CCSS.
        </p>
      </div>
      <EpTable data={eps} ocOptions={ocOptions} />
    </div>
  );
}
