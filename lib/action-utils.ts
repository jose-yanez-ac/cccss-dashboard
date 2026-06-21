/** Resultado uniforme de las Server Actions de mutación. */
export type ActionResult = { ok: boolean; error?: string };

type PostgrestLikeError = {
  code?: string;
  message?: string;
  details?: string | null;
};

/**
 * Traduce errores de PostgREST/Postgres a un mensaje claro en español.
 * No silencia los errores de RLS: los reporta como falta de permisos.
 */
export function mapDbError(error: PostgrestLikeError): string {
  const code = error.code ?? "";
  const message = error.message ?? "";

  // 42501: insufficient_privilege (RLS / GRANT)
  if (code === "42501" || /row-level security/i.test(message)) {
    return "No tienes permisos para realizar esta acción.";
  }
  // 23505: unique_violation
  if (code === "23505") {
    return "Ya existe un registro con esos datos (valor duplicado).";
  }
  // 23503: foreign_key_violation
  if (code === "23503") {
    return "No se puede completar: el registro está referenciado por otros datos.";
  }
  // 23514: check_violation (ej. saldo negativo)
  if (code === "23514") {
    return "Los datos infringen una regla de negocio (revisa montos y saldos).";
  }
  return message || "Ocurrió un error inesperado.";
}
