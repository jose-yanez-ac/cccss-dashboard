"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { empresaSchema, type EmpresaInput } from "@/lib/schemas";
import { mapDbError, type ActionResult } from "@/lib/action-utils";

function normalize(input: EmpresaInput) {
  const parsed = empresaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Datos inválidos." };
  }
  return {
    ok: true as const,
    values: {
      nombre: parsed.data.nombre,
      tipo: parsed.data.tipo && parsed.data.tipo.length > 0 ? parsed.data.tipo : null,
    },
  };
}

export async function createEmpresa(input: EmpresaInput): Promise<ActionResult> {
  const result = normalize(input);
  if (!result.ok) return result;

  const supabase = await createClient();
  const { error } = await supabase.from("empresas").insert(result.values);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidatePath("/empresas");
  return { ok: true };
}

export async function updateEmpresa(
  id: string,
  input: EmpresaInput,
): Promise<ActionResult> {
  const result = normalize(input);
  if (!result.ok) return result;

  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update(result.values)
    .eq("id", id);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidatePath("/empresas");
  return { ok: true };
}

export async function deleteEmpresa(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("empresas").delete().eq("id", id);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidatePath("/empresas");
  return { ok: true };
}
