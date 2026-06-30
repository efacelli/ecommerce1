import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductoAdminPorId } from "@/services/admin.producto.service";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StockEditor } from "@/components/admin/StockEditor";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import Link from "next/link";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductoAdminPorId(Number(id));
  return { title: p ? `Stock: ${p.nombre}` : "Producto no encontrado" };
}

export default async function StockPage({ params }: Props) {
  const { id } = await params;
  const producto = await getProductoAdminPorId(Number(id));
  if (!producto) notFound();

  const stockTotal = producto.variantes.reduce((s, v) => s + v.stock, 0);
  const variantesActivas = producto.variantes.filter((v) => v.activa);
  const conStockBajo = variantesActivas.filter((v) => v.stock <= 5);

  return (
    <div>
      <PageHeader
        titulo={`Stock: ${producto.nombre}`}
        subtitulo={`${variantesActivas.length} variantes activas · ${stockTotal} unidades totales`}
        acciones={
          <Link href={`/admin/productos/${producto.id}/editar`}>
            <span className={styles.btnVolver}>← Volver a editar</span>
          </Link>
        }
      />

      {conStockBajo.length > 0 && (
        <div className={styles.alerta}>
          <span>⚠️</span>
          <p>
            <strong>{conStockBajo.length} variante{conStockBajo.length !== 1 ? "s" : ""}</strong>{" "}
            con stock bajo o en cero:{" "}
            {conStockBajo
              .map((v) => `${v.talle}${v.color ? ` ${v.color}` : ""} (${v.stock})`)
              .join(", ")}
          </p>
        </div>
      )}

      <div className={styles.seccion}>
        <div className={styles.seccionHeader}>
          <h2 className={styles.titulo}>Variantes</h2>
          <p className={styles.subtitulo}>
            Actualizá el stock de cada variante individualmente
          </p>
        </div>

        <StockEditor variantes={producto.variantes} productoId={producto.id} />
      </div>
    </div>
  );
}
