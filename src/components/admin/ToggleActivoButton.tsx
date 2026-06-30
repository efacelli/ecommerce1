"use client";

import { useTransition } from "react";
import { toggleActivoAction } from "@/actions/producto.admin.actions";
import { AdminButton } from "./ui/AdminButton";

export function ToggleActivoButton({
  id,
  activo,
}: {
  id: number;
  activo: boolean;
}) {
  const [isPending, start] = useTransition();
  return (
    <AdminButton
      variante="ghost"
      tamaño="sm"
      cargando={isPending}
      onClick={() => start(() => toggleActivoAction(id, !activo))}
      title={activo ? "Desactivar producto" : "Activar producto"}
    >
      {activo ? "Desactivar" : "Activar"}
    </AdminButton>
  );
}
