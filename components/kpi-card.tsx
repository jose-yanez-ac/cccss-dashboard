import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="relative gap-0 overflow-hidden">
      {accentColor && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <CardContent className="pt-1">
        <div className="flex items-center gap-2">
          {accentColor && (
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          )}
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {title}
          </p>
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
