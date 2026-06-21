"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { OcListItem } from "@/lib/queries";
import { formatUF } from "@/lib/format";
import { ESTADO_OC_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { OcFormDialog } from "@/components/oc/oc-form-dialog";
import { OcActions } from "@/components/oc/oc-actions";

export function OcTable({
  data,
  ccssOptions,
}: {
  data: OcListItem[];
  ccssOptions: { id: string; nombre: string }[];
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [empresa, setEmpresa] = useState(ALL);
  const [ccss, setCcss] = useState(ALL);
  const [estado, setEstado] = useState(ALL);

  const empresaOptions = useMemo<FilterOption[]>(() => {
    const names = Array.from(
      new Set(
        data
          .map((r) => r.cambio_servicio?.empresa?.nombre)
          .filter(Boolean) as string[],
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
    return names.map((n) => ({ value: n, label: n }));
  }, [data]);

  const ccssOptionsFilter = useMemo<FilterOption[]>(() => {
    const names = Array.from(
      new Set(
        data.map((r) => r.cambio_servicio?.nombre).filter(Boolean) as string[],
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
    return names.map((n) => ({ value: n, label: n }));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (empresa !== ALL && r.cambio_servicio?.empresa?.nombre !== empresa)
        return false;
      if (ccss !== ALL && r.cambio_servicio?.nombre !== ccss) return false;
      if (estado !== ALL && r.estado !== estado) return false;
      return true;
    });
  }, [data, empresa, ccss, estado]);

  const filtersActive =
    globalFilter !== "" || empresa !== ALL || ccss !== ALL || estado !== ALL;

  const columns = useMemo<ColumnDef<OcListItem>[]>(
    () => [
      { accessorKey: "numero_oc", header: "N° OC" },
      {
        id: "ccss",
        header: "Cambio de servicio",
        accessorFn: (r) => r.cambio_servicio?.nombre ?? "",
        cell: ({ row }) => (
          <Link
            href={`/cambios-servicio/${row.original.cambio_servicio_id}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {row.original.cambio_servicio?.nombre ?? "—"}
          </Link>
        ),
      },
      {
        id: "empresa",
        header: "Empresa",
        accessorFn: (r) => r.cambio_servicio?.empresa?.nombre ?? "",
      },
      {
        accessorKey: "monto_uf",
        header: () => <div className="text-right">Monto UF</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatUF(row.original.monto_uf)}
          </div>
        ),
      },
      {
        accessorKey: "facturado_uf",
        header: () => <div className="text-right">Facturado UF</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatUF(row.original.facturado_uf)}
          </div>
        ),
      },
      {
        accessorKey: "saldo_uf",
        header: () => <div className="text-right">Saldo UF</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatUF(row.original.saldo_uf)}
          </div>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <Badge variant="outline">{ESTADO_OC_LABEL[row.original.estado]}</Badge>
        ),
      },
      {
        id: "acciones",
        header: "",
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <OcActions
              ccssId={row.original.cambio_servicio_id}
              oc={row.original}
            />
          </div>
        ),
      },
    ],
    [],
  );

  // @tanstack/react-table maneja su propio estado interno; el plugin del React
  // Compiler lo marca como librería incompatible (falso positivo).
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filtered,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar por N° OC o CCSS…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <OcFormDialog
          mode="create"
          ccssOptions={ccssOptions}
          trigger={<Button>Nueva OC</Button>}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Empresa"
          value={empresa}
          onValueChange={setEmpresa}
          options={empresaOptions}
        />
        <FilterSelect
          label="CCSS"
          value={ccss}
          onValueChange={setCcss}
          options={ccssOptionsFilter}
        />
        <FilterSelect
          label="Estado"
          value={estado}
          onValueChange={setEstado}
          options={Object.entries(ESTADO_OC_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setGlobalFilter("");
              setEmpresa(ALL);
              setCcss(ALL);
              setEstado(ALL);
            }}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} orden(es) de compra
      </p>
    </div>
  );
}
