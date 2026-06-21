"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { EstadoPago } from "@/lib/queries";
import {
  epFormSchema,
  epFormToPayload,
  type EpFormValues,
} from "@/lib/schemas";
import { ESTADO_EP_LABEL } from "@/lib/constants";
import { formatUF } from "@/lib/format";
import { createEp, updateEp } from "@/app/(app)/cambios-servicio/[id]/actions";
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

const EPSILON = 0.005;

function toFormValues(ep?: EstadoPago): EpFormValues {
  return {
    numero_ep: ep?.numero_ep != null ? String(ep.numero_ep) : "",
    monto_uf: ep?.monto_uf != null ? String(ep.monto_uf) : "",
    fecha: ep?.fecha ?? "",
    estado: ep?.estado ?? "pendiente",
    factura_url: ep?.factura_url ?? "",
  };
}

type Props = {
  mode: "create" | "edit";
  /** OC padre y su CCSS. Si se omiten en create, se eligen desde `ocOptions`. */
  ccssId?: string;
  ocId?: string;
  /** Monto de la OC (para validar el tope de EP cursados). */
  montoOcUf?: number;
  /** Suma de EP ya cursados de la OC, excluyendo el EP en edición. */
  cursadoOtrosUf?: number;
  /** Opciones de OC para crear un EP desde la lista global. */
  ocOptions?: OcOption[];
  ep?: EstadoPago;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type OcOption = {
  id: string;
  ccssId: string;
  label: string;
  montoUf: number;
  cursadoUf: number;
};

export function EpFormDialog({
  mode,
  ccssId,
  ocId,
  montoOcUf,
  cursadoOtrosUf,
  ocOptions,
  ep,
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
  // Selección de OC padre cuando se crea un EP desde la lista global.
  const [selectedOc, setSelectedOc] = useState("");
  const [ocError, setOcError] = useState<string | null>(null);
  const showOcPicker = mode === "create" && !ocId && !!ocOptions;
  const selectedOption = ocOptions?.find((o) => o.id === selectedOc);

  const effectiveOcId = ocId ?? selectedOption?.id ?? "";
  const effectiveCcssId = ccssId ?? selectedOption?.ccssId ?? "";
  const effectiveMonto = montoOcUf ?? selectedOption?.montoUf ?? 0;
  const effectiveCursado = cursadoOtrosUf ?? selectedOption?.cursadoUf ?? 0;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EpFormValues>({
    resolver: zodResolver(epFormSchema),
    defaultValues: toFormValues(ep),
  });

  const cursableUf = effectiveMonto - effectiveCursado;
  const hasOcContext = Boolean(effectiveOcId);

  function onSubmit(values: EpFormValues) {
    if (!effectiveOcId || !effectiveCcssId) {
      setOcError("Selecciona la orden de compra.");
      return;
    }

    // Validación de negocio en cliente: Σ EP cursados ≤ monto OC.
    if (
      values.estado === "cursado" &&
      Number(values.monto_uf) > cursableUf + EPSILON
    ) {
      setError("monto_uf", {
        message: `Excede el saldo cursable de la OC (${formatUF(cursableUf)} UF).`,
      });
      return;
    }

    const payload = epFormToPayload(values);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEp(effectiveCcssId, effectiveOcId, payload)
          : await updateEp(effectiveCcssId, effectiveOcId, ep!.id, payload);

      if (!result.ok) {
        toast.error(result.error ?? "No se pudo guardar.");
        return;
      }
      toast.success(mode === "create" ? "EP creado." : "EP actualizado.");
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
          reset(toFormValues(ep));
          setSelectedOc("");
          setOcError(null);
        }
      }}
    >
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nuevo estado de pago" : "Editar EP"}
          </DialogTitle>
          <DialogDescription>
            {hasOcContext
              ? `Saldo cursable de la OC: ${formatUF(cursableUf)} UF.`
              : "Selecciona la OC para ver su saldo cursable."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {showOcPicker && (
            <div className="space-y-2">
              <Label>Orden de compra</Label>
              <Select
                value={selectedOc}
                onValueChange={(v) => {
                  setSelectedOc(v as string);
                  setOcError(null);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona la OC padre" />
                </SelectTrigger>
                <SelectContent>
                  {ocOptions!.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {ocError && (
                <p className="text-sm text-destructive">{ocError}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ep-numero">N° EP</Label>
              <Input
                id="ep-numero"
                inputMode="numeric"
                {...register("numero_ep")}
              />
              {errors.numero_ep && (
                <p className="text-sm text-destructive">
                  {errors.numero_ep.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-monto">Monto UF</Label>
              <Input
                id="ep-monto"
                inputMode="decimal"
                {...register("monto_uf")}
              />
              {errors.monto_uf && (
                <p className="text-sm text-destructive">
                  {errors.monto_uf.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ep-fecha">Fecha</Label>
              <Input id="ep-fecha" type="date" {...register("fecha")} />
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
                      {Object.entries(ESTADO_EP_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ep-factura">URL de factura (opcional)</Label>
            <Input
              id="ep-factura"
              placeholder="https://…"
              {...register("factura_url")}
            />
            {errors.factura_url && (
              <p className="text-sm text-destructive">
                {errors.factura_url.message}
              </p>
            )}
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
