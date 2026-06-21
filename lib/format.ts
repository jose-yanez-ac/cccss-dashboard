/**
 * Utilidades de formato. Fuente única para mostrar UF y fechas en la UI.
 * Nunca formatear montos a mano: usar siempre `formatUF`.
 */

const UF_FORMATTER = new Intl.NumberFormat("es-CL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un monto en UF al estilo chileno: `76243.36` → `"76.243,36"`.
 * Acepta `null`/`undefined` y los muestra como `"0,00"`.
 */
export function formatUF(value: number | null | undefined): string {
  return UF_FORMATTER.format(value ?? 0);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/**
 * Formatea una fecha al estilo chileno `dd-mm-aaaa`. Acepta `Date`, ISO string
 * o `null`/`undefined` (devuelve cadena vacía).
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return DATE_FORMATTER.format(date);
}
