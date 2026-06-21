"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import {
  ocPayloadSchema,
  epPayloadSchema,
  type OcPayload,
  type EpPayload,
} from "@/lib/schemas";
import { mapDbError, type ActionResult } from "@/lib/action-utils";

// Tolerancia para comparar montos UF (evita falsos positivos por flotantes).
const EPSILON = 0.005;

function revalidateCcss(ccssId: string) {
  revalidatePath(`/cambios-servicio/${ccssId}`);
  revalidatePath("/cambios-servicio");
  revalidatePath("/dashboard");
}

/* ── Órdenes de Compra ───────────────────────────────────────────────── */

export async function createOc(
  ccssId: string,
  input: OcPayload,
): Promise<ActionResult> {
  const parsed = ocPayloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ordenes_compra")
    .insert({ ...parsed.data, cambio_servicio_id: ccssId });
  if (error) return { ok: false, error: mapDbError(error) };

  revalidateCcss(ccssId);
  return { ok: true };
}

export async function updateOc(
  ccssId: string,
  ocId: string,
  input: OcPayload,
): Promise<ActionResult> {
  const parsed = ocPayloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("ordenes_compra")
    .update(parsed.data)
    .eq("id", ocId);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidateCcss(ccssId);
  return { ok: true };
}

export async function deleteOc(
  ccssId: string,
  ocId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ordenes_compra")
    .delete()
    .eq("id", ocId);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidateCcss(ccssId);
  return { ok: true };
}

/* ── Estados de Pago ─────────────────────────────────────────────────── */

/**
 * Regla de negocio (servidor, autoritativa): la suma de EP **cursados** de una
 * OC no puede exceder el monto de la OC. Devuelve un mensaje de error si se
 * infringe, o `null` si es válido.
 */
async function validarSaldoOc(
  supabase: SupabaseClient<Database>,
  ocId: string,
  payload: EpPayload,
  epIdExcluir?: string,
): Promise<string | null> {
  if (payload.estado !== "cursado") return null;

  const { data: oc, error: ocError } = await supabase
    .from("ordenes_compra")
    .select("monto_uf")
    .eq("id", ocId)
    .maybeSingle();
  if (ocError) return mapDbError(ocError);
  if (!oc) return "La orden de compra no existe.";

  const { data: eps, error: epsError } = await supabase
    .from("estados_pago")
    .select("id, monto_uf")
    .eq("orden_compra_id", ocId)
    .eq("estado", "cursado");
  if (epsError) return mapDbError(epsError);

  const sumOtros = (eps ?? [])
    .filter((e) => e.id !== epIdExcluir)
    .reduce((acc, e) => acc + e.monto_uf, 0);

  if (sumOtros + payload.monto_uf > oc.monto_uf + EPSILON) {
    return "La suma de EP cursados excede el monto de la OC.";
  }
  return null;
}

export async function createEp(
  ccssId: string,
  ocId: string,
  input: EpPayload,
): Promise<ActionResult> {
  const parsed = epPayloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const errorSaldo = await validarSaldoOc(supabase, ocId, parsed.data);
  if (errorSaldo) return { ok: false, error: errorSaldo };

  const { error } = await supabase
    .from("estados_pago")
    .insert({ ...parsed.data, orden_compra_id: ocId });
  if (error) return { ok: false, error: mapDbError(error) };

  revalidateCcss(ccssId);
  return { ok: true };
}

export async function updateEp(
  ccssId: string,
  ocId: string,
  epId: string,
  input: EpPayload,
): Promise<ActionResult> {
  const parsed = epPayloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const errorSaldo = await validarSaldoOc(supabase, ocId, parsed.data, epId);
  if (errorSaldo) return { ok: false, error: errorSaldo };

  const { error } = await supabase
    .from("estados_pago")
    .update(parsed.data)
    .eq("id", epId);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidateCcss(ccssId);
  return { ok: true };
}

export async function deleteEp(
  ccssId: string,
  ocId: string,
  epId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("estados_pago").delete().eq("id", epId);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidateCcss(ccssId);
  return { ok: true };
}
