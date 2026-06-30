import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProductosAdmin } from "@/services/admin.producto.service";
import { getCategorias } from "@/services/categoria.service";
import { AdminTable, Tr, Td } from "@/components/admin/ui/AdminTable";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminBadge } from "@/components/admin/ui/AdminBadge";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ProductosFiltros } from "@/components/admin/ProductosFiltros";
import { ToggleActivoButton } from "@/components/admin/ToggleActivoButton";
import { EliminarProductoButton } from "@/components/admin/EliminarProductoButton";
import { formatearPrecio } from "@/lib/utils";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Productos" };

type Props = {
  searchParams: Promise<{
    busqueda?: string;
    categoriaId?: string;
    activo?: string;
    stockBajo?: string;
    pagina?: string;
  }>;
};

export default async function ProductosAdminPage({ searchParams }: Props) {
  const sp = await searchParams;

  const filtros = {
    busqueda:    sp.busqueda,
    categoriaId: sp.categoriaId ? Number(sp.categoriaId) : undefined,
    activo:      sp.activo !== undefined ? sp.activo === "true" : undefined,
    stockBajo:   sp.stockBajo === "true",
    pagina:      sp.pagina ? Number(sp.pagina) : 1,
  };

  const [resultado, categorias] = await Promise.all([
    getProductosAdmin(filtros),
    getCategorias(),
  ]);

  return (
    <div>
      <PageHeader
        titulo={`Productos (${resultado.total})`}
        subtitulo="Gestioná el catálogo de la tienda"
        acciones={
          <Link href="/admin/productos/nuevo">
            <AdminButton icono={<span>+</span>}>Nuevo producto</AdminButton>
          </Link>
        }
      />

      <ProductosFiltros categorias={categorias} />

      <AdminTable
        headers={["Producto", "Categoría", "Precio", "Stock", "Estado", ""]}
        sinFilas={resultado.items.length === 0}
        vacio={`Sin productos${sp.busqueda ? ` para "${sp.busqueda}"` : ""}`}
      >
        {resultado.items.map((p) => {
          const stockTotal = p.variantes.reduce((s, v) => s + v.stock, 0);
          const stockCritico = p.variantes.some((v) => v.stock <= 5 && v.activa);

          return (
            <Tr key={p.id}>
              {/* Producto */}
              <Td>
                <div className={styles.productoCell}>
                  <div className={styles.productoImagen}>
                    {p.imagenes[0] ? (
                      <Image
                        src={p.imagenes[0]}
                        alt={p.nombre}
                        fill
                        sizes="40px"
                        className={styles.img}
                      />
                    ) : (
                      <span className={styles.imgPlaceholder}>📷</span>
                    )}
                  </div>
                  <div>
                    <p className={styles.productoNombre}>{p.nombre}</p>
                    <p className={styles.productoSlug}>{p.slug}</p>
                  </div>
                </div>
              </Td>

              <Td muted>{p.categoria.nombre}</Td>

              <Td mono>
                <div>
                  {formatearPrecio(p.precio)}
                  {p.precioAnterior && (
                    <p className={styles.precioAnterior}>
                      {formatearPrecio(p.precioAnterior)}
                    </p>
                  )}
                </div>
              </Td>

              {/* Stock */}
              <Td>
                <span className={stockCritico ? styles.stockCritico : ""}>
                  {stockTotal} ud.
                </span>
                <p className={styles.variantesCount}>
                  {p.variantes.length} variante{p.variantes.length !== 1 ? "s" : ""}
                </p>
              </Td>

              {/* Estado */}
              <Td>
                <div className={styles.estados}>
                  <AdminBadge
                    texto={p.activo ? "Activo" : "Inactivo"}
                    variante={p.activo ? "success" : "neutral"}
                  />
                  {p.destacado && (
                    <AdminBadge texto="Destacado" variante="default" />
                  )}
                </div>
              </Td>

              {/* Acciones */}
              <Td>
                <div className={styles.acciones}>
                  <Link href={`/admin/productos/${p.id}/editar`}>
                    <AdminButton variante="secondary" tamaño="sm">
                      Editar
                    </AdminButton>
                  </Link>
                  <Link href={`/admin/productos/${p.id}/stock`}>
                    <AdminButton variante="ghost" tamaño="sm">
                      Stock
                    </AdminButton>
                  </Link>
                  <ToggleActivoButton
                    id={p.id}
                    activo={p.activo}
                  />
                  <EliminarProductoButton id={p.id} nombre={p.nombre} />
                </div>
              </Td>
            </Tr>
          );
        })}
      </AdminTable>

      {/* Paginación simple */}
      {resultado.totalPaginas > 1 && (
        <div className={styles.paginacion}>
          {Array.from({ length: resultado.totalPaginas }, (_, i) => i + 1).map(
            (n) => (
              <Link
                key={n}
                href={`/admin/productos?pagina=${n}${sp.busqueda ? `&busqueda=${sp.busqueda}` : ""}`}
                className={[
                  styles.pagBtn,
                  n === resultado.pagina ? styles.pagBtnActivo : "",
                ].join(" ")}
              >
                {n}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
