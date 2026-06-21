"use client";

import { useState, useTransition, type ReactElement } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { Empresa } from "@/lib/queries";
import { empresaSchema, type EmpresaInput } from "@/lib/schemas";
import { createEmpresa, updateEmpresa } from "@/app/(app)/empresas/actions";
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

type Props = {
  mode: "create" | "edit";
  empresa?: Empresa;
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EmpresaFormDialog({
  mode,
  empresa,
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
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmpresaInput>({
    resolver: zodResolver(empresaSchema),
    defaultValues: { nombre: empresa?.nombre ?? "", tipo: empresa?.tipo ?? "" },
  });

  function onSubmit(values: EmpresaInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEmpresa(values)
          : await updateEmpresa(empresa!.id, values);

      if (!result.ok) {
        toast.error(result.error ?? "No se pudo guardar.");
        return;
      }

      toast.success(
        mode === "create" ? "Empresa creada." : "Empresa actualizada.",
      );
      setDialogOpen(false);
      if (mode === "create") reset({ nombre: "", tipo: "" });
    });
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(next) => {
        setDialogOpen(next);
        if (next) {
          reset({ nombre: empresa?.nombre ?? "", tipo: empresa?.tipo ?? "" });
        }
      }}
    >
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva empresa" : "Editar empresa"}
          </DialogTitle>
          <DialogDescription>
            Empresa prestadora de servicios del proyecto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="empresa-nombre">Nombre</Label>
            <Input id="empresa-nombre" {...register("nombre")} />
            {errors.nombre && (
              <p className="text-sm text-destructive">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa-tipo">Tipo (opcional)</Label>
            <Input
              id="empresa-tipo"
              placeholder="Eléctrica, Sanitaria, Telecom…"
              {...register("tipo")}
            />
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo.message}</p>
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
