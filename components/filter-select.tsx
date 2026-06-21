"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const FILTER_ALL = "all";

export type FilterOption = { value: string; label: string };

/**
 * Select de filtro reutilizable. Cuando no hay filtro activo (valor `all`), el
 * trigger muestra el **nombre del filtro** (no "all"); al elegir una opción
 * muestra su etiqueta. El primer ítem limpia el filtro.
 */
export function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}) {
  const display =
    value === FILTER_ALL
      ? label
      : (options.find((o) => o.value === value)?.label ?? label);

  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as string)}>
      <SelectTrigger className={cn("w-full sm:w-[170px]", className)}>
        <SelectValue>{display}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={FILTER_ALL}>Todos · {label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
