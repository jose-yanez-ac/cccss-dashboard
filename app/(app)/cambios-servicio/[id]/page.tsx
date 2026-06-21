import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCcss, listEp, listOc } from "@/lib/queries";
import { formatDate, formatUF } from "@/lib/format";
import {
  ESTADO_EP_LABEL,
  ESTADO_OC_LABEL,
  FASE_LABEL,
  SECTOR_LABEL,
  TIPO_FINANCIAMIENTO_LABEL,
} from "@/lib/constants";
import { EstadoBadge } from "@/components/ccss/estado-badge";
import { OcFormDialog } from "@/components/oc/oc-form-dialog";
import { OcActions } from "@/components/oc/oc-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

function Dato({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function CcssDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ccss = await getCcss(id);
  if (!ccss) notFound();

  const ocs = await listOc(id);
  const epsPorOc = await Promise.all(ocs.map((oc) => listEp(oc.id)));

  return (
    <div className="space-y-6">
      <Link
        href="/cambios-servicio"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Cambios de Servicio
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {ccss.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ccss.empresa?.nombre ?? "—"}
          </p>
        </div>
        <EstadoBadge estado={ccss.estado} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Dato
              label="Fase"
              value={ccss.fase ? FASE_LABEL[ccss.fase] : "—"}
            />
            <Dato
              label="Financiamiento"
              value={
                ccss.tipo_financiamiento
                  ? TIPO_FINANCIAMIENTO_LABEL[ccss.tipo_financiamiento]
                  : "—"
              }
            />
            <Dato
              label="Sector"
              value={ccss.sector ? SECTOR_LABEL[ccss.sector] : "—"}
            />
            <Dato label="N° OC" value={ccss.n_oc ?? 0} />
            <Dato
              label="Contratado UF"
              value={formatUF(ccss.contratado_uf)}
            />
            <Dato label="Facturado UF" value={formatUF(ccss.facturado_uf)} />
            <Dato label="Saldo UF" value={formatUF(ccss.saldo_uf)} />
            <Dato
              label="Proyección UF"
              value={formatUF(ccss.proyeccion_uf)}
            />
            <Dato label="Ubicación" value={ccss.ubicacion ?? "—"} />
            <Dato
              label="Plazo (días háb.)"
              value={ccss.plazo_dias_habiles ?? "—"}
            />
          </dl>
          {ccss.observaciones && (
            <p className="mt-4 text-sm text-muted-foreground">
              {ccss.observaciones}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Órdenes de Compra</h2>
          <OcFormDialog
            mode="create"
            ccssId={id}
            trigger={<Button size="sm">Agregar OC</Button>}
          />
        </div>
        {ocs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Este CCSS no tiene órdenes de compra
              {ccss.tipo_financiamiento === "proyeccion"
                ? " (financiamiento por proyección)."
                : ccss.tipo_financiamiento === "autofinanciamiento"
                  ? " (autofinanciamiento)."
                  : "."}
            </CardContent>
          </Card>
        ) : (
          ocs.map((oc, i) => {
            const eps = epsPorOc[i];
            return (
              <Card key={oc.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      OC {oc.numero_oc}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {ESTADO_OC_LABEL[oc.estado]}
                      </Badge>
                      <OcActions ccssId={id} oc={oc} />
                    </div>
                  </div>
                  <CardDescription>
                    Emitida: {formatDate(oc.fecha_emision) || "—"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid grid-cols-3 gap-4">
                    <Dato label="Monto UF" value={formatUF(oc.monto_uf)} />
                    <Dato
                      label="Facturado UF"
                      value={formatUF(oc.facturado_uf)}
                    />
                    <Dato label="Saldo UF" value={formatUF(oc.saldo_uf)} />
                  </dl>

                  <div>
                    <p className="mb-2 text-sm font-medium">Estados de Pago</p>
                    {eps.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Sin estados de pago.
                      </p>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>N° EP</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead className="text-right">
                                Monto UF
                              </TableHead>
                              <TableHead>Estado</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {eps.map((ep) => (
                              <TableRow key={ep.id}>
                                <TableCell>{ep.numero_ep}</TableCell>
                                <TableCell>
                                  {formatDate(ep.fecha) || "—"}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatUF(ep.monto_uf)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      ep.estado === "cursado"
                                        ? "default"
                                        : "outline"
                                    }
                                  >
                                    {ESTADO_EP_LABEL[ep.estado]}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
