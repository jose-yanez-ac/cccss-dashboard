"use client";

import { useState, useTransition, type ReactElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { CcssEditable, Empresa } from "@/lib/queries";
import {
  ccssFormSchema,
  ccssFormToPayload,
  type CcssFormValues,
} from "@/lib/schemas";
import {
  FASE_LABEL,
  SECTOR_LABEL,
  TIPO_FINANCIAMIENTO_LABEL,
} from "@/lib/constants";
import { createCcss, updateCcss } from "@/app/(app)/cambios-servicio/actions";
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

const NONE = "__none__";

function toFormValues(ccss?: CcssEditable): CcssFormValues {
  return {
    empresa_id: ccss?.empresa_id ?? "",
    nombre: ccss?.nombre ?? "",
    fase: ccss?.fase ?? "",
    tipo_financiamiento: ccss?.tipo_financiamiento ?? "",
    proyeccion_uf:
      ccss?.proyeccion_uf != null ? String(ccss.proyeccion_uf) : "",
    sector: ccss?.sector ?? "",
    ubicacion: ccss?.ubicacion ?? "",
    plazo_dias_habiles:
      ccss?.plazo_dias_habiles != null ? String(ccss.plazo_dias_habiles) : "",
    fecha_entrega_terreno: ccss?.fecha_entrega_terreno ?? "",
    observaciones: ccss?.observaciones ?? "",
  };
}

type Props = {
  mode: "create" | "edit";
  empresas: Empresa[];
  ccss?: CcssEditable;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CcssFormDialog({
  mode,
  empresas,
  ccss,
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

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CcssFormValues>({
    resolver: zodResolver(ccssFormSchema),
    defaultValues: toFormValues(ccss),
  });

  function onSubmit(values: CcssFormValues) {
    const payload = ccssFormToPayload(values);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCcss(payload)
          : await updateCcss(ccss!.id, payload);

      if (!result.ok) {
        toast.error(result.error ?? "No se pudo guardar.");
        return;
      }
      toast.success(mode === "create" ? "CCSS creado." : "CCSS actualizado.");
      setDialogOpen(false);
      if (mode === "create") reset(toFormValues());
    });
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(next) => {
        setDialogOpen(next);
        if (next) reset(toFormValues(ccss));
      }}
    >
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Nuevo cambio de servicio"
              : "Editar cambio de servicio"}
          </DialogTitle>
          <DialogDescription>
            Datos del CCSS. Los montos se expresan en UF.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="ccss-nombre">Nombre</Label>
            <Input id="ccss-nombre" {...register("nombre")} />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Empresa</Label>
            <Controller
              control={control}
              name="empresa_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.empresa_id && (
              <p className="text-sm text-destructive">
                {errors.empresa_id.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fase</Label>
              <Controller
                control={control}
                name="fase"
                render={({ field }) => (
                  <Select
                    value={field.value === "" ? NONE : field.value}
                    onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin especificar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sin especificar</SelectItem>
                      {Object.entries(FASE_LABEL).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Sector</Label>
              <Controller
                control={control}
                name="sector"
                render={({ field }) => (
                  <Select
                    value={field.value === "" ? NONE : field.value}
                    onValueChange={(v) => field.onChange(v === NONE ? "" : v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sin especificar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sin especificar</SelectItem>
                      {Object.entries(SECTOR_LABEL).map(([value, label]) => (
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
            <Label>Tipo de financiamiento</Label>
            <Controller
              control={control}
              name="tipo_financiamiento"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_FINANCIAMIENTO_LABEL).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo_financiamiento && (
              <p className="text-sm text-destructive">
                {errors.tipo_financiamiento.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ccss-proyeccion">Proyección UF</Label>
              <Input
                id="ccss-proyeccion"
                inputMode="decimal"
                placeholder="0"
                {...register("proyeccion_uf")}
              />
              {errors.proyeccion_uf && (
                <p className="text-sm text-destructive">
                  {errors.proyeccion_uf.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccss-plazo">Plazo (días hábiles)</Label>
              <Input
                id="ccss-plazo"
                inputMode="numeric"
                placeholder="—"
                {...register("plazo_dias_habiles")}
              />
              {errors.plazo_dias_habiles && (
                <p className="text-sm text-destructive">
                  {errors.plazo_dias_habiles.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ccss-ubicacion">Ubicación</Label>
            <Input id="ccss-ubicacion" {...register("ubicacion")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ccss-fecha">Fecha de entrega de terreno</Label>
            <Input
              id="ccss-fecha"
              type="date"
              {...register("fecha_entrega_terreno")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ccss-obs">Observaciones</Label>
            <textarea
              id="ccss-obs"
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              {...register("observaciones")}
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
