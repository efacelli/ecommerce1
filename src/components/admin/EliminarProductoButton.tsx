"use client";

import { useTransition } from "react";
import { eliminarProductoAction } from "@/actions/producto.admin.actions";
import { AdminButton } from "./ui/AdminButton";

export function EliminarProductoButton({
  id,
  nombre,
}: {
  id: number;
  nombre: string;
}) {
  const [isPending, start] = useTransition();

  function handleEliminar() {
    const confirmado = window.confirm(
      `¿Eliminar "${nombre}"?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmado) return;
    start(() => eliminarProductoAction(id));
  }

  return (
    <AdminButton
      variante="danger"
      tamaño="sm"
      cargando={isPending}
      onClick={handleEliminar}
    >
      Eliminar
    </AdminButton>
  );
}
