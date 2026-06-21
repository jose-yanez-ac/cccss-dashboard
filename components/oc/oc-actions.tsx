"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import type { OrdenCompra } from "@/lib/queries";
import { deleteOc } from "@/app/(app)/cambios-servicio/[id]/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OcFormDialog } from "@/components/oc/oc-form-dialog";

export function OcActions({
  ccssId,
  oc,
}: {
  ccssId: string;
  oc: OrdenCompra;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirmDelete() {
    startTransition(async () => {
      const result = await deleteOc(ccssId, oc.id);
      if (!result.ok) {
        toast.error(result.error ?? "No se pudo eliminar.");
        return;
      }
      toast.success("OC eliminada.");
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Acciones de la OC</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
          >
            Editar OC
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Eliminar OC
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <OcFormDialog
        mode="edit"
        ccssId={ccssId}
        oc={oc}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar orden de compra</DialogTitle>
            <DialogDescription>
              ¿Eliminar la OC «{oc.numero_oc}» y sus estados de pago? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
