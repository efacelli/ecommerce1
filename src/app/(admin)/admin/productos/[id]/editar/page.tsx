import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductoAdminPorId } from "@/services/admin.producto.service";
import { getCategorias } from "@/services/categoria.service";
import { ProductoForm } from "@/components/admin/ProductoForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EliminarProductoButton } from "@/components/admin/EliminarProductoButton";
import { editarProductoAction } from "@/actions/producto.admin.actions";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductoAdminPorId(Number(id));
  return { title: p ? `Editar: ${p.nombre}` : "Producto no encontrado" };
}

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const [producto, categorias] = await Promise.all([
    getProductoAdminPorId(Number(id)),
    getCategorias(),
  ]);

  if (!producto) notFound();

  const actionConId = editarProductoAction.bind(null, producto.id);

  return (
    <div>
      <PageHeader
        titulo={`Editar: ${producto.nombre}`}
        subtitulo={`ID ${producto.id} · /productos/${producto.slug}`}
        acciones={
          <>
            <Link
              href={`/productos/${producto.slug}`}
              target="_blank"
              style={{ fontSize: "0.8125rem", color: "var(--a-primary)", textDecoration: "underline" }}
            >
              Ver en tienda ↗
            </Link>
            <Link href={`/admin/productos/${producto.id}/stock`}>
              <span style={{
                fontSize: "0.8125rem", padding: "5px 12px",
                border: "1px solid var(--a-border)", borderRadius: "var(--a-radius-sm)",
                color: "var(--a-text)",
              }}>
                Gestionar stock
              </span>
            </Link>
            <EliminarProductoButton id={producto.id} nombre={producto.nombre} />
          </>
        }
      />
      <ProductoForm categorias={categorias} producto={producto} action={actionConId} />
    </div>
  );
}