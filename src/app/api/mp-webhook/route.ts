import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Fuerza que esta ruta sea siempre dinámica — nunca se evalúa en build time.
// Sin esto, Next.js intenta pre-renderizar la ruta durante "next build",
// lo que ejecuta el código del módulo (incluido el cliente de Mercado Pago)
// antes de que las variables de entorno de runtime estén disponibles.
export const dynamic = "force-dynamic";

const schemaBody = z.object({
  pedidoId: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    // Imports dinámicos: se cargan recién cuando la request llega,
    // no durante el build de Next.js
    const { crearPreferenciaPago } = await import("@/services/mp.service");
    const { prisma } = await import("@/lib/prisma");

    const body = await req.json();
    const { pedidoId } = schemaBody.parse(body);

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