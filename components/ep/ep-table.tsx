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

import type { EpListItem } from "@/lib/queries";
import { formatDate, formatUF } from "@/lib/format";
import { ESTADO_EP_LABEL } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { EpFormDialog } from "@/components/ep/ep-form-dialog";
import { EpActions } from "@/components/ep/ep-actions";

const ALL = "all";

type OcOption = {
  id: string;
  ccssId: string;
  label: string;
  montoUf: number;
  cursadoUf: number;
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
      <SelectTrigger className="w-[180px]">
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

export function EpTable({
  data,
  ocOptions,
}: {
  data: EpListItem[];
  ocOptions: OcOption[];
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [oc, setOc] = useState(ALL);
  const [estado, setEstado] = useState(ALL);

  // Suma de EP cursados por OC (para validar el tope al editar cada fila).
  const cursadoPorOc = useMemo(() => {
    const acc = new Map<string, number>();
    for (const ep of data) {
      if (ep.estado === "cursado") {
        acc.set(
          ep.orden_compra_id,
          (acc.get(ep.orden_compra_id) ?? 0) + ep.monto_uf,
        );
      }
    }
    return acc;
  }, [data]);

  const ocFilterOptions = useMemo<FilterOption[]>(() => {
    const nums = Array.from(
      new Set(
        data.map((r) => r.orden_compra?.numero_oc).filter(Boolean) as string[],
      ),
    ).sort((a, b) => a.localeCompare(b, "es"));
    return nums.map((n) => ({ value: n, label: `OC ${n}` }));
  }, [data]);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (oc !== ALL && r.orden_compra?.numero_oc !== oc) return false;
      if (estado !== ALL && r.estado !== estado) return false;
      return true;
    });
  }, [data, oc, estado]);

  const filtersActive =
    globalFilter !== "" || oc !== ALL || estado !== ALL;

  const columns = useMemo<ColumnDef<EpListItem>[]>(
    () => [
      { accessorKey: "numero_ep", header: "N° EP" },
      {
        id: "oc",
        header: "OC",
        accessorFn: (r) => r.orden_compra?.numero_oc ?? "",
        cell: ({ row }) => row.original.orden_compra?.numero_oc ?? "—",
      },
      {
        id: "ccss",
        header: "Cambio de servicio",
        accessorFn: (r) => r.orden_compra?.cambio_servicio?.nombre ?? "",
        cell: ({ row }) => {
          const ccss = row.original.orden_compra?.cambio_servicio;
          return ccss ? (
            <Link
              href={`/cambios-servicio/${ccss.id}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {ccss.nombre}
            </Link>
          ) : (
            "—"
          );
        },
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
        accessorKey: "fecha",
        header: "Fecha",
        cell: ({ row }) => formatDate(row.original.fecha) || "—",
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            variant={row.original.estado === "cursado" ? "default" : "outline"}
          >
            {ESTADO_EP_LABEL[row.original.estado]}
          </Badge>
        ),
      },
      {
        id: "acciones",
        header: "",
        enableGlobalFilter: false,
        cell: ({ row }) => {
          const ep = row.original;
          const ccssId = ep.orden_compra?.cambio_servicio?.id;
          const montoOc = ep.orden_compra?.monto_uf ?? 0;
          const cursadoTotal = cursadoPorOc.get(ep.orden_compra_id) ?? 0;
          const cursadoOtros =
            cursadoTotal - (ep.estado === "cursado" ? ep.monto_uf : 0);
          if (!ccssId) return null;
          return (
            <div className="flex justify-end">
              <EpActions
                ccssId={ccssId}
                ocId={ep.orden_compra_id}
                montoOcUf={montoOc}
                cursadoOtrosUf={cursadoOtros}
                ep={ep}
              />
            </div>
          );
        },
      },
    ],
    [cursadoPorOc],
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
          placeholder="Buscar por N° EP o CCSS…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <EpFormDialog
          mode="create"
          ocOptions={ocOptions}
          trigger={<Button>Nuevo EP</Button>}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="OC"
          value={oc}
          onValueChange={setOc}
          options={ocFilterOptions}
        />
        <FilterSelect
          label="Estado"
          value={estado}
          onValueChange={setEstado}
          options={Object.entries(ESTADO_EP_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setGlobalFilter("");
              setOc(ALL);
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
        {table.getFilteredRowModel().rows.length} estado(s) de pago
      </p>
    </div>
  );
}
