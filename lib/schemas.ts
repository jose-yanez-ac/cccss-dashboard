import { z } from "zod";

/**
 * Esquemas de validación zod compartidos entre formularios (cliente) y
 * Server Actions (servidor). Mensajes en español.
 */

export const empresaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  tipo: z.string().trim().max(80, "Máximo 80 caracteres").optional(),
});

export type EmpresaInput = z.infer<typeof empresaSchema>;

/* ── Cambios de Servicio ─────────────────────────────────────────────── */

const FASES = ["ingenieria", "construccion"] as const;
const TIPOS_FIN = ["con_oc", "proyeccion", "autofinanciamiento"] as const;
const SECTORES = ["AVN", "AGV", "otro"] as const;

const numeroNoNegativo = (msg: string) =>
  z
    .string()
    .refine(
      (v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0),
      msg,
    );

/** Esquema del formulario (campos string, pensado para react-hook-form). */
export const ccssFormSchema = z
  .object({
    empresa_id: z.string().min(1, "Selecciona una empresa"),
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    fase: z.enum(["", ...FASES]),
    tipo_financiamiento: z.enum(["", ...TIPOS_FIN]),
    proyeccion_uf: numeroNoNegativo("Monto UF inválido"),
    sector: z.enum(["", ...SECTORES]),
    ubicacion: z.string(),
    plazo_dias_habiles: z
      .string()
      .refine(
        (v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= 0),
        "Días hábiles inválidos",
      ),
    fecha_entrega_terreno: z.string(),
    observaciones: z.string(),
  })
  .refine((d) => d.tipo_financiamiento !== "", {
    path: ["tipo_financiamiento"],
    message: "Selecciona el tipo de financiamiento",
  });

export type CcssFormValues = z.infer<typeof ccssFormSchema>;

/** Esquema del payload normalizado (lo que recibe y revalida la Server Action). */
export const ccssPayloadSchema = z.object({
  empresa_id: z.string().min(1),
  nombre: z.string().trim().min(1),
  fase: z.enum(FASES).nullable(),
  tipo_financiamiento: z.enum(TIPOS_FIN),
  proyeccion_uf: z.number().min(0),
  sector: z.enum(SECTORES).nullable(),
  ubicacion: z.string().nullable(),
  plazo_dias_habiles: z.number().int().min(0).nullable(),
  fecha_entrega_terreno: z.string().nullable(),
  observaciones: z.string().nullable(),
});

export type CcssPayload = z.infer<typeof ccssPayloadSchema>;

/* ── Órdenes de Compra ───────────────────────────────────────────────── */

const ESTADOS_OC = [
  "emitida",
  "pagada_parcial",
  "pagada_total",
  "anulada",
] as const;

export const ocFormSchema = z.object({
  numero_oc: z.string().trim().min(1, "El número de OC es obligatorio"),
  monto_uf: numeroNoNegativo("Monto UF inválido").refine(
    (v) => v !== "",
    "El monto es obligatorio",
  ),
  fecha_emision: z.string(),
  estado: z.enum(ESTADOS_OC),
});

export type OcFormValues = z.infer<typeof ocFormSchema>;

export const ocPayloadSchema = z.object({
  numero_oc: z.string().trim().min(1),
  monto_uf: z.number().min(0),
  fecha_emision: z.string().nullable(),
  estado: z.enum(ESTADOS_OC),
});

export type OcPayload = z.infer<typeof ocPayloadSchema>;

export function ocFormToPayload(values: OcFormValues): OcPayload {
  return {
    numero_oc: values.numero_oc.trim(),
    monto_uf: Number(values.monto_uf),
    fecha_emision: values.fecha_emision === "" ? null : values.fecha_emision,
    estado: values.estado,
  };
}

/* ── Estados de Pago ─────────────────────────────────────────────────── */

const ESTADOS_EP = ["pendiente", "cursado"] as const;

export const epFormSchema = z.object({
  numero_ep: z
    .string()
    .refine(
      (v) => v !== "" && Number.isInteger(Number(v)) && Number(v) > 0,
      "N° de EP inválido",
    ),
  monto_uf: numeroNoNegativo("Monto UF inválido").refine(
    (v) => v !== "",
    "El monto es obligatorio",
  ),
  fecha: z.string(),
  estado: z.enum(ESTADOS_EP),
  factura_url: z.union([z.literal(""), z.string().url("URL inválida")]),
});

export type EpFormValues = z.infer<typeof epFormSchema>;

export const epPayloadSchema = z.object({
  numero_ep: z.number().int().positive(),
  monto_uf: z.number().min(0),
  fecha: z.string().nullable(),
  estado: z.enum(ESTADOS_EP),
  factura_url: z.string().nullable(),
});

export type EpPayload = z.infer<typeof epPayloadSchema>;

export function epFormToPayload(values: EpFormValues): EpPayload {
  return {
    numero_ep: Number(values.numero_ep),
    monto_uf: Number(values.monto_uf),
    fecha: values.fecha === "" ? null : values.fecha,
    estado: values.estado,
    factura_url: values.factura_url === "" ? null : values.factura_url,
  };
}

/** Convierte los valores string del formulario al payload normalizado. */
export function ccssFormToPayload(values: CcssFormValues): CcssPayload {
  return {
    empresa_id: values.empresa_id,
    nombre: values.nombre.trim(),
    fase: values.fase === "" ? null : values.fase,
    // Garantizado no-vacío por la validación del formulario.
    tipo_financiamiento:
      values.tipo_financiamiento as CcssPayload["tipo_financiamiento"],
    proyeccion_uf: values.proyeccion_uf === "" ? 0 : Number(values.proyeccion_uf),
    sector: values.sector === "" ? null : values.sector,
    ubicacion: values.ubicacion.trim() === "" ? null : values.ubicacion.trim(),
    plazo_dias_habiles:
      values.plazo_dias_habiles === ""
        ? null
        : Number(values.plazo_dias_habiles),
    fecha_entrega_terreno:
      values.fecha_entrega_terreno === "" ? null : values.fecha_entrega_terreno,
    observaciones:
      values.observaciones.trim() === "" ? null : values.observaciones.trim(),
  };
}
