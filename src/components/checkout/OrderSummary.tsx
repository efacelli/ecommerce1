import Image from "next/image";
import { formatearPrecio } from "@/lib/utils";
import type { ItemCarrito } from "@/types";
import styles from "./OrderSummary.module.css";

type Props = {
  items: ItemCarrito[];
  subtotal: number;
  costoEnvio: number | null; // null = "a calcular"
};

export function OrderSummary({ items, subtotal, costoEnvio }: Props) {
  const total = subtotal + (costoEnvio ?? 0);

  return (
    <div className={styles.resumen}>
      <h2 className={styles.titulo}>Tu pedido</h2>

      {/* Lista de ítems */}
      <ul className={styles.lista}>
        {items.map((item) => (
          <li key={item.varianteId} className={styles.item}>
            <div className={styles.imagenWrapper}>
              <Image
                src={item.imagen || "/images/placeholder.png"}
                alt={item.nombre}
                fill
                sizes="64px"
                className={styles.imagen}
              />
              {item.cantidad > 1 && (
                <span className={styles.cantidad}>{item.cantidad}</span>
              )}
            </div>

            <div className={styles.itemInfo}>
              <p className={styles.itemNombre}>{item.nombre}</p>
              <p className={styles.itemVariante}>
                {item.talle}
                {item.color ? ` · ${item.color}` : ""}
              </p>
            </div>

            <p className={styles.itemPrecio}>
              {formatearPrecio(item.precio * item.cantidad)}
            </p>
          </li>
        ))}
      </ul>

      {/* Totales */}
      <div className={styles.totales}>
        <div className={styles.linea}>
          <span className={styles.lineaLabel}>Subtotal</span>
          <span>{formatearPrecio(subtotal)}</span>
        </div>

        <div className={styles.linea}>
          <span className={styles.lineaLabel}>Envío</span>
          {costoEnvio === null ? (
            <span className={styles.aCAlcular}>A calcular</span>
          ) : costoEnvio === 0 ? (
            <span className={styles.gratis}>Gratis</span>
          ) : (
            <span>{formatearPrecio(costoEnvio)}</span>
          )}
        </div>

        <div className={styles.totalLinea}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalValor}>{formatearPrecio(total)}</span>
        </div>
      </div>

      {/* Badge de seguridad */}
      <div className={styles.seguridad}>
        <span aria-hidden="true">🔒</span>
        <p>Tus datos están protegidos y tu compra es segura.</p>
      </div>
    </div>
  );
}
