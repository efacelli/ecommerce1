import type { Metadata } from "next";
import { getCategorias } from "@/services/categoria.service";
import { ProductoForm } from "@/components/admin/ProductoForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { crearProductoAction } from "@/actions/producto.admin.actions";

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
