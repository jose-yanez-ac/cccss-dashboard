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
