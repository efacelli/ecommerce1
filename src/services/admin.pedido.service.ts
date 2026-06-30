import { prisma } from "@/lib/prisma";
import type {
  AdminPedido,
  AdminPedidoCompleto,
  FiltrosPedidos,
  EstadoPedido,
} from "@/types/admin";
import type { ResultadoPaginado } from "@/types";

const POR_PAGINA = 20;

export async function getPedidosAdmin(
  filtros: FiltrosPedidos = {}
): Promise<ResultadoPaginado<AdminPedido>> {
  const { estado, busqueda, pagina = 1, desde, hasta } = filtros;
  const skip = (pagina - 1) * POR_PAGINA;

  const where: Record<string, unknown> = {};
  if (estado) where.estado = estado;
  if (busqueda) {
    where.OR = [
      { numeroPedido: { contains: busqueda, mode: "insensitive" } },
      { clienteNombre: { contains: busqueda, mode: "insensitive" } },
      { clienteEmail: { contains: busqueda, mode: "insensitive" } },
    ];
  }
  if (desde || hasta) {
    where.creadoEn = {
      ...(desde ? { gte: new Date(desde) } : {}),
      ...(hasta ? { lte: new Date(hasta + "T23:59:59") } : {}),
    };
  }

  const [rawItems, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      orderBy: { creadoEn: "desc" },
      skip,
      take: POR_PAGINA,
    }),
    prisma.pedido.count({ where }),
  ]);

  const items = rawItems.map((p) => ({
    ...p,
    subtotal: Number(p.subtotal),
    costoEnvio: Number(p.costoEnvio),
    descuento: Number(p.descuento),
    total: Number(p.total),
  })) as unknown as AdminPedido[];

  return {
    items,
    total,
    pagina,
    totalPaginas: Math.ceil(total / POR_PAGINA),
    porPagina: POR_PAGINA,
  };
}

export async function getPedidoAdminCompleto(
  id: number
): Promise<AdminPedidoCompleto | null> {
  const p = await prisma.pedido.findUnique({
    where: { id },
    include: {
      detalles: true,
      historial: {
        orderBy: { creadoEn: "desc" },
        include: { admin: { select: { nombre: true } } },
      },
      notas: {
        orderBy: { creadoEn: "desc" },
        include: { admin: { select: { nombre: true } } },
      },
    },
  });
  if (!p) return null;

  return {
    ...p,
    subtotal: Number(p.subtotal),
    costoEnvio: Number(p.costoEnvio),
    descuento: Number(p.descuento),
    total: Number(p.total),
    detalles: p.detalles.map((d) => ({
      ...d,
      precioUnitario: Number(d.precioUnitario),
      subtotal: Number(d.subtotal),
    })),
  } as unknown as AdminPedidoCompleto;
}

export async function actualizarEstadoPedido(
  pedidoId: number,
  estado: EstadoPedido,
  nota?: string,
  adminId?: number
) {
  return prisma.$transaction([
    prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado: estado as any },
    }),
    prisma.historialEstado.create({
      data: {
        pedidoId,
        estado: estado as any,
        nota: nota ?? null,
        adminId: adminId ?? null,
      },
    }),
  ]);
}
