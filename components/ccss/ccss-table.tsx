"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { CcssListItem } from "@/lib/queries";
import { formatUF } from "@/lib/format";
import {
  FASE_LABEL,
  TIPO_FINANCIAMIENTO_LABEL,
} from "@/lib/constants";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstadoBadge } from "@/components/ccss/estado-badge";

export function CcssTable({ data }: { data: CcssListItem[] }) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<CcssListItem>[]>(
    () => [
      {
        id: "empresa",
        header: "Empresa",
        accessorFn: (row) => row.empresa?.nombre ?? "",
      },
      { accessorKey: "nombre", header: "Nombre" },
      {
        accessorKey: "fase",
        header: "Fase",
        cell: ({ row }) =>
          row.original.fase ? FASE_LABEL[row.original.fase] : "—",
      },
      {
        accessorKey: "tipo_financiamiento",
        header: "Financiamiento",
        cell: ({ row }) =>
          row.original.tipo_financiamiento
            ? TIPO_FINANCIAMIENTO_LABEL[row.original.tipo_financiamiento]
            : "—",
      },
      {
        accessorKey: "contratado_uf",
        header: () => <div className="text-right">Contratado UF</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums">
            {formatUF(row.original.contratado_uf)}
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
        accessorKey: "n_oc",
        header: () => <div className="text-center">N° OC</div>,
        cell: ({ row }) => (
          <div className="text-center tabular-nums">
            {row.original.n_oc ?? 0}
          </div>
        ),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <EstadoBadge estado={row.original.estado} />,
      },
    ],
    [],
  );

  // @tanstack/react-table maneja su propio estado interno; el plugin del React
  // Compiler lo marca como librería incompatible (falso positivo).
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por empresa o nombre…"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
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
        {table.getFilteredRowModel().rows.length} cambio(s) de servicio
      </p>
    </div>
  );
}
