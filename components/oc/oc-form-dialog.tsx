"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { OrdenCompra } from "@/lib/queries";
import {
  ocFormSchema,
  ocFormToPayload,
  type OcFormValues,
} from "@/lib/schemas";
import { ESTADO_OC_LABEL } from "@/lib/constants";
import { createOc, updateOc } from "@/app/(app)/cambios-servicio/[id]/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toFormValues(oc?: OrdenCompra): OcFormValues {
  return {
    numero_oc: oc?.numero_oc ?? "",
    monto_uf: oc?.monto_uf != null ? String(oc.monto_uf) : "",
    fecha_emision: oc?.fecha_emision ?? "",
    estado: oc?.estado ?? "emitida",
  };
}

type Props = {
  mode: "create" | "edit";
  /** CCSS padre. Si se omite en modo create, se elige desde `ccssOptions`. */
  ccssId?: string;
  /** Opciones de CCSS para crear una OC desde la lista global. */
  ccssOptions?: { id: string; nombre: string }[];
  oc?: OrdenCompra;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function OcFormDialog({
  mode,
  ccssId,
  ccssOptions,
  oc,
  trigger,
  open,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled
    ? (onOpenChange ?? (() => {}))
    : setInternalOpen;

  const [isPending, startTransition] = useTransition();
  // Selección del CCSS padre cuando se crea una OC desde la lista global.
  const [selectedCcss, setSelectedCcss] = useState("");
  const [ccssError, setCcssError] = useState<string | null>(null);
  const showCcssPicker = mode === "create" && !ccssId && !!ccssOptions;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OcFormValues>({
    resolver: zodResolver(ocFormSchema),
    defaultValues: toFormValues(oc),
  });

  function onSubmit(values: OcFormValues) {
    const effectiveCcssId = ccssId ?? selectedCcss;
    if (!effectiveCcssId) {
      setCcssError("Selecciona el cambio de servicio.");
      return;
    }

    const payload = ocFormToPayload(values);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createOc(effectiveCcssId, payload)
          : await updateOc(effectiveCcssId, oc!.id, payload);

      if (!result.ok) {
        toast.error(result.error ?? "No se pudo guardar.");
        return;
      }
      toast.success(mode === "create" ? "OC creada." : "OC actualizada.");
      setDialogOpen(false);
      if (mode === "create") reset(toFormValues());
    });
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(next) => {
        setDialogOpen(next);
        if (next) {
          reset(toFormValues(oc));
          setSelectedCcss("");
          setCcssError(null);
        }
      }}
    >
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva orden de compra" : "Editar OC"}
          </DialogTitle>
          <DialogDescription>Montos en UF.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {showCcssPicker && (
            <div className="space-y-2">
              <Label>Cambio de servicio</Label>
              <Select
                value={selectedCcss}
                onValueChange={(v) => {
                  setSelectedCcss(v as string);
                  setCcssError(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el CCSS padre" />
                </SelectTrigger>
                <SelectContent>
                  {ccssOptions!.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ccssError && (
                <p className="text-sm text-destructive">{ccssError}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="oc-numero">Número de OC</Label>
            <Input id="oc-numero" {...register("numero_oc")} />
            {errors.numero_oc && (
              <p className="text-sm text-destructive">
                {errors.numero_oc.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="oc-monto">Monto UF</Label>
              <Input
                id="oc-monto"
                inputMode="decimal"
                {...register("monto_uf")}
              />
              {errors.monto_uf && (
                <p className="text-sm text-destructive">
                  {errors.monto_uf.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="oc-fecha">Fecha de emisión</Label>
              <Input id="oc-fecha" type="date" {...register("fecha_emision")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Controller
              control={control}
              name="estado"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ESTADO_OC_LABEL).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
