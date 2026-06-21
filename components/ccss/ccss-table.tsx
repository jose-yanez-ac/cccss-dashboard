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

import type { CcssEditable, CcssListItem, Empresa } from "@/lib/queries";
import { formatUF } from "@/lib/format";
import {
  ESTADO_CCSS,
  FASE_LABEL,
  SECTOR_LABEL,
  TIPO_FINANCIAMIENTO_LABEL,
} from "@/lib/constants";
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
import { EstadoBadge } from "@/components/ccss/estado-badge";
import { CcssFormDialog } from "@/components/ccss/ccss-form-dialog";
import { CcssRowActions } from "@/components/ccss/ccss-row-actions";

const ALL = "all";

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

type Filters = {
  empresa: string;
  fase: string;
  tipo: string;
  estado: string;
  sector: string;
};

const INITIAL_FILTERS: Filters = {
  empresa: ALL,
  fase: ALL,
  tipo: ALL,
  estado: ALL,
  sector: ALL,
};

export function CcssTable({
  data,
  empresas,
  editables,
}: {
  data: CcssListItem[];
  empresas: Empresa[];
  editables: CcssEditable[];
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const editableById = useMemo(
    () => new Map(editables.map((e) => [e.id, e])),
    [editables],
  );

  const empresaOptions = useMemo<FilterOption[]>(() => {
    const names = Array.from(
      new Set(data.map((r) => r.empresa?.nombre).filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b, "es"));
    return names.map((n) => ({ value: n, label: n }));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.empresa !== ALL && row.empresa?.nombre !== filters.empresa)
        return false;
      if (filters.fase !== ALL && row.fase !== filters.fase) return false;
      if (filters.tipo !== ALL && row.tipo_financiamiento !== filters.tipo)
        return false;
      if (filters.estado !== ALL && row.estado !== filters.estado) return false;
      if (filters.sector !== ALL && row.sector !== filters.sector) return false;
      return true;
    });
  }, [data, filters]);

  const filtersActive =
    globalFilter !== "" ||
    Object.values(filters).some((v) => v !== ALL);

  function resetFilters() {
    setFilters(INITIAL_FILTERS);
    setGlobalFilter("");
  }

  const columns = useMemo<ColumnDef<CcssListItem>[]>(
    () => [
      {
        id: "empresa",
        header: "Empresa",
        accessorFn: (row) => row.empresa?.nombre ?? "",
      },
      {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) =>
          row.original.id ? (
            <Link
              href={`/cambios-servicio/${row.original.id}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {row.original.nombre}
            </Link>
          ) : (
            row.original.nombre
          ),
      },
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
      {
        id: "acciones",
        header: "",
        enableGlobalFilter: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <CcssRowActions
              id={row.original.id ?? ""}
              nombre={row.original.nombre ?? ""}
              empresas={empresas}
              editable={
                row.original.id
                  ? editableById.get(row.original.id)
                  : undefined
              }
            />
          </div>
        ),
      },
    ],
    [empresas, editableById],
  );

  // @tanstack/react-table maneja su propio estado interno; el plugin del React
  // Compiler lo marca como librería incompatible (falso positivo).
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
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
          placeholder="Buscar por empresa o nombre…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <CcssFormDialog
          mode="create"
          empresas={empresas}
          trigger={<Button>Nuevo cambio de servicio</Button>}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Empresa"
          value={filters.empresa}
          onValueChange={(v) => setFilters((f) => ({ ...f, empresa: v }))}
          options={empresaOptions}
        />
        <FilterSelect
          label="Fase"
          value={filters.fase}
          onValueChange={(v) => setFilters((f) => ({ ...f, fase: v }))}
          options={Object.entries(FASE_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <FilterSelect
          label="Financiamiento"
          value={filters.tipo}
          onValueChange={(v) => setFilters((f) => ({ ...f, tipo: v }))}
          options={Object.entries(TIPO_FINANCIAMIENTO_LABEL).map(
            ([value, label]) => ({ value, label }),
          )}
        />
        <FilterSelect
          label="Estado"
          value={filters.estado}
          onValueChange={(v) => setFilters((f) => ({ ...f, estado: v }))}
          options={Object.entries(ESTADO_CCSS).map(([value, cfg]) => ({
            value,
            label: cfg.label,
          }))}
        />
        <FilterSelect
          label="Sector"
          value={filters.sector}
          onValueChange={(v) => setFilters((f) => ({ ...f, sector: v }))}
          options={Object.entries(SECTOR_LABEL).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
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
        {table.getFilteredRowModel().rows.length} cambio(s) de servicio
      </p>
    </div>
  );
}
