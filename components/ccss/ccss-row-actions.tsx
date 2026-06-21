"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import type { CcssEditable, Empresa } from "@/lib/queries";
import { deleteCcss } from "@/app/(app)/cambios-servicio/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { CcssFormDialog } from "@/components/ccss/ccss-form-dialog";

export function CcssRowActions({
  id,
  nombre,
  empresas,
  editable,
}: {
  id: string;
  nombre: string;
  empresas: Empresa[];
  editable?: CcssEditable;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  // Segunda barrera: el botón destructivo se habilita solo si el texto coincide.
  const canDelete = confirmText.trim() === nombre.trim() && !isPending;

  function onConfirmDelete() {
    if (!canDelete) return;
    startTransition(async () => {
      const result = await deleteCcss(id);
      if (!result.ok) {
        toast.error(result.error ?? "No se pudo eliminar.");
        return;
      }
      toast.success("CCSS eliminado.");
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
              <span className="sr-only">Acciones</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href={`/cambios-servicio/${id}`} />}>
            Ver detalle
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!editable}
            onClick={() => setEditOpen(true)}
          >
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editable && (
        <CcssFormDialog
          mode="edit"
          empresas={empresas}
          ccss={editable}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      <AlertDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cambio de servicio</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción elimina «{nombre}» junto con todas sus órdenes de
              compra y estados de pago asociados. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Para confirmar, escribe el nombre exacto del CCSS:
            </p>
            <p className="rounded bg-muted px-2 py-1 text-sm font-medium">
              {nombre}
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe el nombre del CCSS"
              autoComplete="off"
              aria-label="Confirmación del nombre del CCSS"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={!canDelete}
              onClick={onConfirmDelete}
            >
              {isPending ? "Eliminando…" : "Eliminar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
