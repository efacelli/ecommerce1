import { prisma } from "@/lib/prisma";
import type { Categoria, CategoriaConHijas } from "@/types";

export async function getCategorias(): Promise<Categoria[]> {
  return prisma.categoria.findMany({
    where: { activa: true },
    orderBy: { orden: "asc" },
  });
}

export async function getCategoriasRaiz(): Promise<CategoriaConHijas[]> {
  return prisma.categoria.findMany({
    where: { activa: true, parentId: null },
    include: {
      hijas: {
        where: { activa: true },
        orderBy: { orden: "asc" },
      },
    },
    orderBy: { orden: "asc" },
  }) as unknown as CategoriaConHijas[];
}

export async function getCategoriaPorSlug(
  slug: string
): Promise<CategoriaConHijas | null> {
  return prisma.categoria.findUnique({
    where: { slug },
    include: {
      hijas: {
        where: { activa: true },
        orderBy: { orden: "asc" },
      },
    },
  }) as unknown as CategoriaConHijas | null;
}
