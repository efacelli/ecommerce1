import type { Metadata } from "next";
import { getCategorias } from "@/services/categoria.service";
import { ProductoForm } from "@/components/admin/ProductoForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { crearProductoAction } from "@/actions/producto.admin.actions";

// Esta página consulta categorías directamente de la BD en cada visita.
// Sin esto, Vercel puede servir una versión cacheada del build inicial
// (cuando la base de datos todavía no tenía categorías cargadas).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = { title: "Nuevo producto" };

export default async function NuevoProductoPage() {
  const categorias = await getCategorias();

  return (
    <div>
      <PageHeader
        titulo="Nuevo producto"
        subtitulo="Completá los datos para agregar un producto al catálogo"
      />
      <ProductoForm categorias={categorias} action={crearProductoAction} />
    </div>
  );
}