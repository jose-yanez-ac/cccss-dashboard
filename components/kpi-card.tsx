import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Tarjeta KPI del dashboard. El `value` ya debe venir formateado (UF/%) desde
 * `lib/format.ts`; este componente no calcula ni formatea cifras.
 */
export function KpiCard({
  title,
  value,
  hint,
  accentColor,
}: {
  title: string;
  value: string;
  hint?: string;
  accentColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {accentColor && (
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {hint && (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
