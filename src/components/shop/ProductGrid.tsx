import { ProductCard } from "./ProductCard";
import type { ProductoConCategoria } from "@/types";
import styles from "./ProductGrid.module.css";

type Props = {
  productos: ProductoConCategoria[];
  vacio?: React.ReactNode;
};

export function ProductGrid({ productos, vacio }: Props) {
  if (productos.length === 0) {
    return (
      <div className={styles.vacio}>
        {vacio ?? (
          <>
            <p className={styles.vacioTitulo}>Sin resultados</p>
            <p className={styles.vacioTexto}>
              Probá con otros filtros o volvé al catálogo completo.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {productos.map((producto, i) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          prioridad={i < 4}
        />
      ))}
    </div>
  );
}
