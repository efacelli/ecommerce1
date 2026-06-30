"use server";

import { revalidatePath } from "next/cache";
import { actualizarEstadoPedido } from "@/services/admin.pedido.service";
import { prisma } from "@/lib/prisma";
import type { EstadoPedido } from "@/types/admin";

export async function cambiarEstadoPedidoAction(
  pedidoId: number,
  estado: EstadoPedido,
  nota?: string
) {
  await actualizarEstadoPedido(pedidoId, estado, nota);
  revalidatePath(`/admin/pedidos/${pedidoId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/dashboard");
}

export async function agregarNotaAdminAction(
  pedidoId: number,
  mensaje: string,
  esPublica: boolean
) {
  if (!mensaje.trim()) throw new Error("La nota no puede estar vacía");
  await prisma.notaPedido.create({
    data: { pedidoId, mensaje: mensaje.trim(), esPublica },
  });
  revalidatePath(`/admin/pedidos/${pedidoId}`);
}
