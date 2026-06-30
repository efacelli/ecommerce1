import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { formatearPrecio, calcularDescuento, getImagenPrincipal } from "@/lib/utils";
import type { ProductoConCategoria } from "@/types";
import styles from "./ProductCard.module.css";

type Props = {
  producto: ProductoConCategoria;
  prioridad?: boolean; // Para LCP — pasar true a las primeras 4 cards
};

export function ProductCard({ producto, prioridad = false }: Props) {
  const imagen = getImagenPrincipal(producto.imagenes);
  const descuento = producto.precioAnterior
    ? calcularDescuento(producto.precioAnterior, producto.precio)
    : 0;

  return (
    <Link href={`/productos/${producto.slug}`} className={styles.card}>
      <div className={styles.imagenWrapper}>
        <Image
          src={imagen}
          alt={producto.nombre}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={styles.imagen}
          priority={prioridad}
        />

        {/* Badges superpuestos */}
        <div className={styles.badges}>
          {descuento > 0 && (
            <Badge texto={`-${descuento}%`} variante="sale" />
          )}
          {producto.destacado && descuento === 0 && (
            <Badge texto="Destacado" />
          )}
        </div>

        {/* Overlay hover */}
        <div className={styles.overlay} aria-hidden="true">
          <span className={styles.overlayTexto}>Ver producto</span>
        </div>
      </div>

      <div className={styles.info}>
        <p className={styles.categoria}>{producto.categoria.nombre}</p>

        {/* Nombre en Cormorant grande — la inversión de jerarquía */}
        <h3 className={styles.nombre}>{producto.nombre}</h3>

        <div className={styles.precios}>
          <span className={styles.precio}>{formatearPrecio(producto.precio)}</span>
          {producto.precioAnterior && (
            <span className={styles.precioAnterior}>
              {formatearPrecio(producto.precioAnterior)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
