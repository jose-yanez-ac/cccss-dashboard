/**
 * Paleta y mapa de estados — única fuente de verdad para colores de la UI.
 * Úsalos en badges y gráficos para mantener coherencia con la presentación
 * del comité. No hardcodear colores en componentes.
 */

/** Colores corporativos generales (marca). */
export const CORPORATE = {
  teal: "#003c4b",
  orange: "#eb8316",
} as const;

export const COLORS = {
  navy: "#12243B",
  petrol: "#0E5A82",
  teal: "#1C7293",
  green: "#1E8E5A",
  amber: "#D98E04",
  orange: "#C0532B",
  blue: "#2D6CB0",
  slate: "#5E6E82",
  violet: "#6E59A5",
} as const;

export const ESTADO_CCSS = {
  pagado_total: { label: "Pagado total", color: COLORS.green },
  pagado_parcial: { label: "Pagado parcial", color: COLORS.amber },
  pendiente: { label: "Pendiente", color: COLORS.orange },
  proyeccion: { label: "Proyección", color: COLORS.blue },
  autofinanciamiento: { label: "Autofinanciamiento", color: COLORS.slate },
} as const;

export type EstadoCcss = keyof typeof ESTADO_CCSS;

export const FASE_LABEL = {
  ingenieria: "Ingeniería",
  construccion: "Construcción",
} as const;

export const TIPO_FINANCIAMIENTO_LABEL = {
  con_oc: "Con OC",
  proyeccion: "Proyección",
  autofinanciamiento: "Autofinanciamiento",
} as const;

export const SECTOR_LABEL = {
  AVN: "AVN",
  AGV: "AGV",
  otro: "Otro",
} as const;

export const ESTADO_OC_LABEL = {
  emitida: "Emitida",
  pagada_parcial: "Pagada parcial",
  pagada_total: "Pagada total",
  anulada: "Anulada",
} as const;

export const ESTADO_EP_LABEL = {
  pendiente: "Pendiente",
  cursado: "Cursado",
} as const;
