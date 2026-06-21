import { listCcss } from "@/lib/queries";
import { CcssTable } from "@/components/ccss/ccss-table";

export default async function CambiosServicioPage() {
  const ccss = await listCcss();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Cambios de Servicio
        </h1>
        <p className="text-sm text-muted-foreground">
          Cartera de CCSS del proyecto Túnel Lo Ruiz.
        </p>
      </div>
      <CcssTable data={ccss} />
    </div>
  );
}
