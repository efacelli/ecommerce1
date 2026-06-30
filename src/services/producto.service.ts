import { prisma } from "@/lib/prisma";
import type { FiltrosCatalogo, ResultadoPaginado, ProductoCompleto, ProductoConCategoria } from "@/types";

const POR_PAGINA = 12;

export async function getProductos(
  filtros: FiltrosCatalogo = {}
): Promise<ResultadoPaginado<ProductoConCategoria>> {
  const { categoriaSlug, busqueda, orden = "reciente", pagina = 1 } = filtros;
  const skip = (pagina - 1) * POR_PAGINA;

  const where = {
    activo: true,
    ...(categoriaSlug && { categoria: { slug: categoriaSlug } }),
    ...(busqueda && {
      OR: [
        { nombre: { contains: busqueda, mode: "insensitive" as const } },
        { descripcion: { contains: busqueda, mode: "insensitive" as const } },
      ],
    }),
  };

  const orderBy = {
    reciente:     { creadoEn: "desc" as const },
    "precio-asc": { precio: "asc" as const },
    "precio-desc":{ precio: "desc" as const },
    destacado:    { destacado: "desc" as const },
  }[orden];

  const [items, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy,
      skip,
      take: POR_PAGINA,
    }),
    prisma.producto.count({ where }),
  ]);

  return {
    items: items.map((p) => ({
      ...p,
      precio: Number(p.precio),
      precioAnterior: p.precioAnterior ? Number(p.precioAnterior) : null,
    })) as ProductoConCategoria[],
    total,
    pagina,
    totalPaginas: Math.ceil(total / POR_PAGINA),
    porPagina: POR_PAGINA,
  };
}

export async function getProductoDestacados(
  limite = 8
): Promise<ProductoConCategoria[]> {
  const items = await prisma.producto.findMany({
    where: { activo: true, destacado: true },
    include: { categoria: true },
    orderBy: { creadoEn: "desc" },
    take: limite,
  });

  return items.map((p) => ({
    ...p,
    precio: Number(p.precio),
    precioAnterior: p.precioAnterior ? Number(p.precioAnterior) : null,
  })) as ProductoConCategoria[];
}

export async function getProductoPorSlug(
  slug: string
): Promise<ProductoCompleto | null> {
  const p = await prisma.producto.findUnique({
    where: { slug },
    include: {
      categoria: true,
      variantes: { where: { activa: true }, orderBy: { talle: "asc" } },
      etiquetas: { include: { etiqueta: true } },
    },
  });

  if (!p) return null;

  return {
    ...p,
    precio: Number(p.precio),
    precioAnterior: p.precioAnterior ? Number(p.precioAnterior) : null,
  } as unknown as ProductoCompleto;
}

export async function getProductosRelacionados(
  categoriaId: number,
  excluirId: number,
  limite = 4
): Promise<ProductoConCategoria[]> {
  const items = await prisma.producto.findMany({
    where: {
      activo: true,
      categoriaId,
      id: { not: excluirId },
    },
    include: { categoria: true },
    take: limite,
    orderBy: { creadoEn: "desc" },
  });

  return items.map((p) => ({
    ...p,
    precio: Number(p.precio),
    precioAnterior: p.precioAnterior ? Number(p.precioAnterior) : null,
  })) as ProductoConCategoria[];
}

export async function buscarProductos(
  q: string,
  limite = 6
): Promise<ProductoConCategoria[]> {
  if (!q.trim()) return [];

  const items = await prisma.producto.findMany({
    where: {
      activo: true,
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { descripcion: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { categoria: true },
    take: limite,
    orderBy: { destacado: "desc" },
  });

  return items.map((p) => ({
    ...p,
    precio: Number(p.precio),
    precioAnterior: p.precioAnterior ? Number(p.precioAnterior) : null,
  })) as ProductoConCategoria[];
}

export async function getSlugsProductos(): Promise<string[]> {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { slug: true },
  });
  return productos.map((p) => p.slug);
}
