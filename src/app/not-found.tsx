import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.pagina}>
      <p className={styles.codigo}>404</p>
      <h1 className={styles.titulo}>Página no encontrada</h1>
      <p className={styles.texto}>
        La página que buscás no existe o fue movida.
      </p>
      <div className={styles.acciones}>
        <Link href="/" className={styles.linkPrimario}>
          Ir al inicio
        </Link>
        <Link href="/productos" className={styles.linkSecundario}>
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
