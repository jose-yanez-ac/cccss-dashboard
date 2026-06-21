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
