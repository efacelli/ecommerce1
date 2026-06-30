import { NextRequest, NextResponse } from "next/server";
import { crearPreferenciaPago } from "@/services/mp.service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación de la request
const schemaBody = z.object({
  pedidoId: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pedidoId } = schemaBody.parse(body);

    // Cargar el pedido con sus detalles desde la BD
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { detalles: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Solo crear preferencia para pedidos pendientes
    if (pedido.estado !== "PENDIENTE") {
      return NextResponse.json(
        { error: "El pedido ya fue procesado" },
        { status: 409 }
      );
    }

    const resultado = await crearPreferenciaPago({
      pedidoId:      pedido.id,
      numeroPedido:  pedido.numeroPedido,
      clienteEmail:  pedido.clienteEmail,
      clienteNombre: pedido.clienteNombre,
      items: pedido.detalles.map((d) => ({
        nombre:         d.productoNombre,
        cantidad:       d.cantidad,
        precioUnitario: Number(d.precioUnitario),
        imagen:         d.productoImagen ?? undefined,
      })),
      costoEnvio: Number(pedido.costoEnvio),
    });

    return NextResponse.json(resultado);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: err.errors },
        { status: 400 }
      );
    }
    console.error("[/api/mp-preference]", err);
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago" },
      { status: 500 }
    );
  }
}
