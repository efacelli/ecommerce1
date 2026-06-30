import { prisma } from "@/lib/prisma";
import type { MetricasDashboard } from "@/types/admin";

export async function getMetricasDashboard(): Promise<MetricasDashboard> {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioDia = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  );

  const [
    ventasTotalesRaw,
    ventasMesRaw,
    pedidosTotales,
    pedidosPendientes,
    pedidosHoy,
    productosTotales,
    productosConStockBajo,
    topProductosRaw,
    ventasPorEstadoRaw,
  ] = await Promise.all([
    // Total histórico de ventas (pedidos entregados o confirmados)
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        estado: { in: ["CONFIRMADO", "EN_PREPARACION", "LISTO_PARA_ENVIO", "EN_CAMINO", "ENTREGADO"] as any[] },
      },
    }),

    // Ventas del mes actual
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        creadoEn: { gte: inicioMes },
        estado: { notIn: ["CANCELADO", "REEMBOLSADO"] as any[] },
      },
    }),

    // Total de pedidos
    prisma.pedido.count(),

    // Pedidos pendientes
    prisma.pedido.count({ where: { estado: "PENDIENTE" as any } }),

    // Pedidos de hoy
    prisma.pedido.count({ where: { creadoEn: { gte: inicioDia } } }),

    // Total de productos activos
    prisma.producto.count({ where: { activo: true } }),

    // Productos con stock bajo (alguna variante <= 5)
    prisma.producto.count({
      where: {
        variantes: { some: { stock: { lte: 5 }, activa: true } },
      },
    }),

    // Top 5 productos más vendidos
    prisma.detallePedido.groupBy({
      by: ["productoNombre"],
      _sum: { cantidad: true, subtotal: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 5,
    }),

    // Pedidos agrupados por estado
    prisma.pedido.groupBy({
      by: ["estado"],
      _count: { id: true },
      _sum: { total: true },
    }),
  ]);

  const topProductos = topProductosRaw.map((p) => ({
    nombre: p.productoNombre,
    slug: "",
    totalVendido: p._sum.cantidad ?? 0,
    ingresoTotal: Number(p._sum.subtotal ?? 0),
  }));

  const ventasPorEstado = ventasPorEstadoRaw.map((v) => ({
    estado: v.estado as any,
    cantidad: v._count.id,
    total: Number(v._sum.total ?? 0),
  }));

  return {
    ventasTotales: Number(ventasTotalesRaw._sum.total ?? 0),
    ventasMes: Number(ventasMesRaw._sum.total ?? 0),
    pedidosTotales,
    pedidosPendientes,
    pedidosHoy,
    productosTotales,
    productosConStockBajo,
    topProductos,
    ventasPorEstado,
  };
}
