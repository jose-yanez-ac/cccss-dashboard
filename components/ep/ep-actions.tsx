"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import type { EstadoPago } from "@/lib/queries";
import { deleteEp } from "@/app/(app)/cambios-servicio/[id]/actions";
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
import { EpFormDialog } from "@/components/ep/ep-form-dialog";

export function EpActions({
  ccssId,
  ocId,
  montoOcUf,
  cursadoOtrosUf,
  ep,
}: {
  ccssId: string;
  ocId: string;
  montoOcUf: number;
  cursadoOtrosUf: number;
  ep: EstadoPago;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onConfirmDelete() {
    startTransition(async () => {
      const result = await deleteEp(ccssId, ocId, ep.id);
      if (!result.ok) {
        toast.error(result.error ?? "No se pudo eliminar.");
        return;
      }
      toast.success("EP eliminado.");
      setDeleteOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="size-7">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Acciones del EP</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
          >
            Editar EP
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Eliminar EP
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EpFormDialog
        mode="edit"
        ccssId={ccssId}
        ocId={ocId}
        montoOcUf={montoOcUf}
        cursadoOtrosUf={cursadoOtrosUf}
        ep={ep}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar estado de pago</DialogTitle>
            <DialogDescription>
              ¿Eliminar el EP N° {ep.numero_ep}? Esta acción no se puede
              deshacer.
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
