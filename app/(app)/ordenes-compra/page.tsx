import { listAllOc, listCcss } from "@/lib/queries";
import { OcTable } from "@/components/oc/oc-table";

export default async function OrdenesCompraPage() {
  const [ocs, ccss] = await Promise.all([listAllOc(), listCcss()]);

  const ccssOptions = ccss
    .filter((c) => c.id && c.nombre)
    .map((c) => ({ id: c.id as string, nombre: c.nombre as string }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Órdenes de Compra
        </h1>
        <p className="text-sm text-muted-foreground">
          Todas las OC del proyecto, con su CCSS y avance de facturación.
        </p>
      </div>
      <OcTable data={ocs} ccssOptions={ccssOptions} />
    </div>
  );
}
