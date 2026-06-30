import { prisma } from "@/lib/prisma";
import type {
  AdminProducto,
  FiltrosProductosAdmin,
} from "@/types/admin";
import type { ResultadoPaginado } from "@/types";

const POR_PAGINA = 20;
const UMBRAL_STOCK_BAJO = 5;

export async function getProductosAdmin(
  filtros: FiltrosProductosAdmin = {}
): Promise<ResultadoPaginado<AdminProducto>> {
  const { busqueda, categoriaId, activo, stockBajo, pagina = 1 } = filtros;
  const skip = (pagina - 1) * POR_PAGINA;

  const where: Record<string, unknown> = {};

  if (busqueda) {
    where.OR = [
      { nombre: { contains: busqueda, mode: "insensitive" } },
      { slug: { contains: busqueda, mode: "insensitive" } },
    ];
  }
  if (categoriaId) where.categoriaId = categoriaId;
  if (activo !== undefined) where.activo = activo;
  if (stockBajo) {
    where.variantes = {
      some: { stock: { lte: UMBRAL_STOCK_BAJO }, activa: true },
    };
  }

  const [rawItems, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: {
        categoria: { select: { id: true, nombre: true, slug: true } },
        variantes: { orderBy: [{ talle: "asc" }, { color: "asc" }] },
      },
      orderBy: { actualizadoEn: "desc" },
      skip,
      take: POR_PAGINA,
    }),
    prisma.producto.count({ where }),
  ]);

  const items = rawItems.map((p) => ({
    ...p,
    precio: Number(p.precio),
    precioAnterior: p.precioAnterior ? Number(p.precioAnterior) : null,
  })) as unknown as AdminProducto[];

  return {
    items,
    total,
    pagina,
    totalPaginas: Math.ceil(total / POR_PAGINA),
    porPagina: POR_PAGINA,
  };
}

export async function getProductoAdminPorId(
  id: number
): Promise<AdminProducto | null> {
  const p = await prisma.producto.findUnique({
    where: { id },
    include: {
      categoria: { select: { id: true, nombre: true, slug: true } },
      variantes: {
        orderBy: [{ talle: "asc" }, { color: "asc" }],
      },
    },
  });
  if (!p) return null;
  return {
    ...p,
    precio: Number(p.precio),
    precioAnterior: p.precioAnterior ? Number(p.precioAnterior) : null,
  } as unknown as AdminProducto;
}

export async function getStockBajo(): Promise<AdminProducto[]> {
  const items = await prisma.producto.findMany({
    where: {
      variantes: {
        some: { stock: { lte: UMBRAL_STOCK_BAJO }, activa: true },
      },
    },
    include: {
      categoria: { select: { id: true, nombre: true, slug: true } },
      variantes: { orderBy: [{ talle: "asc" }] },
    },
    orderBy: { nombre: "asc" },
    take: 10,
  });
  return items.map((p) => ({
    ...p,
    precio: Number(p.precio),
    precioAnterior: p.precioAnterior ? Number(p.precioAnterior) : null,
  })) as unknown as AdminProducto[];
}
