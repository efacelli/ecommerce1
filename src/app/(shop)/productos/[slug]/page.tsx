import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductoPorSlug, getProductosRelacionados, getSlugsProductos } from "@/services/producto.service";
import { ProductCard } from "@/components/shop/ProductCard";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Badge } from "@/components/ui/Badge";
import { formatearPrecio, calcularDescuento, getImagenPrincipal } from "@/lib/utils";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getSlugsProductos();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) return { title: "Producto no encontrado" };
  return {
    title: producto.nombre,
    description: producto.descripcion ?? `${producto.nombre} — Disponible en nuestra tienda.`,
    openGraph: {
      images: producto.imagenes[0] ? [{ url: producto.imagenes[0] }] : [],
    },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) notFound();

  const relacionados = await getProductosRelacionados(
    producto.categoriaId,
    producto.id,
    4
  );

  const descuento = producto.precioAnterior
    ? calcularDescuento(producto.precioAnterior, producto.precio)
    : 0;

  const imagenPrincipal = getImagenPrincipal(producto.imagenes);

  // Agrupar variantes por color
  const colores = [...new Set(producto.variantes.map((v) => v.color).filter(Boolean))];
  const talles = [...new Set(producto.variantes.map((v) => v.talle))];

  return (
    <div className={styles.pagina}>
      <div className="container">

        {/* ── Breadcrumb ──────────────────────────── */}
        <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
          <Link href="/" className={styles.breadLink}>Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href="/productos" className={styles.breadLink}>Catálogo</Link>
          <span aria-hidden="true">›</span>
          <Link
            href={`/categorias/${producto.categoria.slug}`}
            className={styles.breadLink}
          >
            {producto.categoria.nombre}
          </Link>
          <span aria-hidden="true">›</span>
          <span className={styles.breadCurrent}>{producto.nombre}</span>
        </nav>

        {/* ── Layout principal ─────────────────────── */}
        <div className={styles.layout}>

          {/* Galería */}
          <div className={styles.galeria}>
            <div className={styles.imagenPrincipal}>
              <Image
                src={imagenPrincipal}
                alt={producto.nombre}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className={styles.imagen}
                priority
              />
              {descuento > 0 && (
                <div className={styles.badgeGaleria}>
                  <Badge texto={`-${descuento}%`} variante="sale" />
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {producto.imagenes.length > 1 && (
              <div className={styles.miniaturas}>
                {producto.imagenes.map((img, i) => (
                  <div key={i} className={styles.miniatura}>
                    <Image
                      src={img}
                      alt={`${producto.nombre} — vista ${i + 1}`}
                      fill
                      sizes="80px"
                      className={styles.imagen}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info + acciones */}
          <div className={styles.info}>
            {/* Etiquetas */}
            {producto.etiquetas.length > 0 && (
              <div className={styles.etiquetas}>
                {producto.etiquetas.map(({ etiqueta }) => (
                  <Badge
                    key={etiqueta.id}
                    texto={etiqueta.nombre}
                    color={etiqueta.color}
                  />
                ))}
              </div>
            )}

            <p className={styles.categoria}>{producto.categoria.nombre}</p>
            <h1 className={styles.nombre}>{producto.nombre}</h1>

            {/* Precios */}
            <div className={styles.precios}>
              <span className={styles.precio}>
                {formatearPrecio(producto.precio)}
              </span>
              {producto.precioAnterior && (
                <span className={styles.precioAnterior}>
                  {formatearPrecio(producto.precioAnterior)}
                </span>
              )}
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <p className={styles.descripcion}>{producto.descripcion}</p>
            )}

            <div className={styles.separador} />

            {/* Selector de variante + botón agregar */}
            <AddToCartButton
              producto={{
                id: producto.id,
                nombre: producto.nombre,
                slug: producto.slug,
                imagen: imagenPrincipal,
                precio: producto.precio,
              }}
              variantes={producto.variantes}
              talles={talles}
              colores={colores as string[]}
            />

            {/* Info extra */}
            <div className={styles.extras}>
              <details className={styles.detalle}>
                <summary className={styles.detalleTitulo}>
                  Envío y retiro
                </summary>
                <div className={styles.detalleContenido}>
                  <p>Retiro gratis en local: Lunes a sábado 9–20 hs.</p>
                  <p>Envío a todo el país por Correo Argentino y Andreani.</p>
                </div>
              </details>
              <details className={styles.detalle}>
                <summary className={styles.detalleTitulo}>
                  Cambios y devoluciones
                </summary>
                <div className={styles.detalleContenido}>
                  <p>Cambios sin costo hasta 30 días desde la compra con etiqueta y ticket.</p>
                </div>
              </details>
              <details className={styles.detalle}>
                <summary className={styles.detalleTitulo}>
                  Guía de talles
                </summary>
                <div className={styles.detalleContenido}>
                  <p>
                    <Link href="/talles" className={styles.linkDetalle}>
                      Ver tabla de medidas →
                    </Link>
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* ── Relacionados ─────────────────────────── */}
        {relacionados.length > 0 && (
          <section className={styles.relacionados}>
            <h2 className={styles.relacionadosTitulo}>También te puede gustar</h2>
            <div className={styles.relacionadosGrid}>
              {relacionados.map((p) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
