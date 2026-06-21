"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { ccssPayloadSchema, type CcssPayload } from "@/lib/schemas";
import { mapDbError, type ActionResult } from "@/lib/action-utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

async function getProyectoId(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const { data } = await supabase
    .from("proyectos")
    .select("id")
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function createCcss(input: CcssPayload): Promise<ActionResult> {
  const parsed = ccssPayloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const proyectoId = await getProyectoId(supabase);
  if (!proyectoId) return { ok: false, error: "No hay proyecto configurado." };

  const { error } = await supabase
    .from("cambios_servicio")
    .insert({ ...parsed.data, proyecto_id: proyectoId });
  if (error) return { ok: false, error: mapDbError(error) };

  revalidatePath("/cambios-servicio");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateCcss(
  id: string,
  input: CcssPayload,
): Promise<ActionResult> {
  const parsed = ccssPayloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("cambios_servicio")
    .update(parsed.data)
    .eq("id", id);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidatePath("/cambios-servicio");
  revalidatePath(`/cambios-servicio/${id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteCcss(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("cambios_servicio").delete().eq("id", id);
  if (error) return { ok: false, error: mapDbError(error) };

  revalidatePath("/cambios-servicio");
  revalidatePath("/dashboard");
  return { ok: true };
}
