import { listEmpresas } from "@/lib/queries";
import { EmpresasTable } from "@/components/empresas/empresas-table";

export default async function EmpresasPage() {
  const empresas = await listEmpresas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
        <p className="text-sm text-muted-foreground">
          Empresas prestadoras de servicios del proyecto.
        </p>
      </div>
      <EmpresasTable data={empresas} />
    </div>
  );
}
