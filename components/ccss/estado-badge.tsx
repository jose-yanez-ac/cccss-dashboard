import { Badge } from "@/components/ui/badge";
import { ESTADO_CCSS, type EstadoCcss } from "@/lib/constants";

/**
 * Badge de estado de un CCSS con color centralizado en `ESTADO_CCSS`.
 * Acepta el `estado` derivado de la vista (string); si no calza, lo muestra crudo.
 */
export function EstadoBadge({ estado }: { estado: string | null }) {
  if (!estado) return <span className="text-muted-foreground">—</span>;

  const config = ESTADO_CCSS[estado as EstadoCcss];
  if (!config) {
    return <Badge variant="outline">{estado}</Badge>;
  }

  return (
    <Badge
      variant="outline"
      style={{
        color: config.color,
        borderColor: config.color,
        backgroundColor: `${config.color}1A`,
      }}
    >
      {config.label}
    </Badge>
  );
}
