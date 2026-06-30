import { prisma } from "@/lib/prisma";
import type { DatosCheckout } from "@/lib/validations/checkout";
import type { ItemCarrito } from "@/types";

// ─── Generar número de pedido único ──────────────────────────────────────────

async function generarNumeroPedido(): Promise<string> {
  const año = new Date().getFullYear();
  // Conta pedidos del año actual para el secuencial
  const count = await prisma.pedido.count({
    where: {
      creadoEn: {
        gte: new Date(`${año}-01-01`),
        lt: new Date(`${año + 1}-01-01`),
      },
    },
  });
  return `ORD-${año}-${String(count + 1).padStart(5, "0")}`;
}

// ─── Crear pedido ─────────────────────────────────────────────────────────────

type CrearPedidoInput = {
  datos: DatosCheckout;
  items: ItemCarrito[];
};

export async function crearPedido(input: CrearPedidoInput) {
  const { datos, items } = input;

  if (items.length === 0) {
    throw new Error("El carrito está vacío");
  }

  // Verificar stock de cada variante en la BD (no confiar solo en el cliente)
  const varianteIds = items.map((i) => i.varianteId);
  const variantes = await prisma.variante.findMany({
    where: { id: { in: varianteIds } },
    select: { id: true, stock: true, sku: true },
  });

  for (const item of items) {
    const variante = variantes.find((v) => v.id === item.varianteId);
    if (!variante) {
      throw new Error(`La variante ${item.sku} ya no está disponible`);
    }
    if (variante.stock < item.cantidad) {
      throw new Error(
        `Stock insuficiente para "${item.nombre}" (${item.talle}${item.color ? ` · ${item.color}` : ""}). Disponible: ${variante.stock}`
      );
    }
  }

  // Calcular totales
  const subtotal = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );
  const costoEnvio =
    datos.envioTipo === "RETIRO_LOCAL" ? 0 : calcularCostoEnvio(datos.envioTipo);
  const total = subtotal + costoEnvio;

  const numeroPedido = await generarNumeroPedido();

  // Transacción: crear pedido + descontar stock
  const pedido = await prisma.$transaction(async (tx) => {
    // 1. Crear el pedido con sus detalles
    const nuevoPedido = await tx.pedido.create({
      data: {
        numeroPedido,
        clienteNombre: datos.clienteNombre,
        clienteEmail: datos.clienteEmail,
        clienteTelefono: datos.clienteTelefono,
        clienteDni: datos.clienteDni || null,
        envioTipo: datos.envioTipo as any,
        envioCalle: datos.envioCalle || null,
        envioNumero: datos.envioNumero || null,
        envioPiso: datos.envioPiso || null,
        envioLocalidad: datos.envioLocalidad || null,
        envioProvincia: datos.envioProvincia || null,
        envioCodigoPostal: datos.envioCodigoPostal || null,
        envioReferencia: datos.envioReferencia || null,
        subtotal,
        costoEnvio,
        total,
        metodoPago: datos.metodoPago as any,
        detalles: {
          create: items.map((item) => ({
            cantidad: item.cantidad,
            precioUnitario: item.precio,
            subtotal: item.precio * item.cantidad,
            productoNombre: item.nombre,
            varianteTalle: item.talle,
            varianteColor: item.color || null,
            productoImagen: item.imagen || null,
            productoId: item.productoId,
            varianteId: item.varianteId,
          })),
        },
        historial: {
          create: {
            estado: "PENDIENTE",
            nota: "Pedido creado",
          },
        },
        ...(datos.notaCliente
          ? {
              notas: {
                create: {
                  mensaje: datos.notaCliente,
                  esPublica: true,
                },
              },
            }
          : {}),
      },
    });

    // 2. Descontar stock de cada variante
    for (const item of items) {
      await tx.variante.update({
        where: { id: item.varianteId },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    return nuevoPedido;
  });

  return pedido;
}

// ─── Obtener pedido por número (para la página de confirmación) ───────────────

export async function getPedidoPorNumero(numeroPedido: string) {
  return prisma.pedido.findUnique({
    where: { numeroPedido },
    include: {
      detalles: true,
    },
  });
}

// ─── Costo de envío estimado ──────────────────────────────────────────────────

function calcularCostoEnvio(tipo: string): number {
  const costos: Record<string, number> = {
    ENVIO_DOMICILIO: 2500,
    CORREO_ARGENTINO: 3200,
    ANDREANI: 3800,
    OTRO: 2500,
  };
  return costos[tipo] ?? 2500;
}
