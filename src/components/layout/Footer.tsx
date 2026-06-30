import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>

          {/* Marca */}
          <div className={styles.col}>
            <p className={styles.logo}>La Tienda</p>
            <p className={styles.tagline}>
              Ropa de calidad para cada momento.
            </p>
          </div>

          {/* Navegación */}
          <div className={styles.col}>
            <p className={styles.colTitulo}>Tienda</p>
            <ul className={styles.lista}>
              <li><Link href="/productos" className={styles.link}>Todo</Link></li>
              <li><Link href="/categorias/mujer" className={styles.link}>Mujer</Link></li>
              <li><Link href="/categorias/hombre" className={styles.link}>Hombre</Link></li>
              <li><Link href="/categorias/ninos" className={styles.link}>Niños</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div className={styles.col}>
            <p className={styles.colTitulo}>Información</p>
            <ul className={styles.lista}>
              <li><Link href="/envios" className={styles.link}>Envíos</Link></li>
              <li><Link href="/cambios" className={styles.link}>Cambios y devoluciones</Link></li>
              <li><Link href="/talles" className={styles.link}>Guía de talles</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className={styles.col}>
            <p className={styles.colTitulo}>Contacto</p>
            <ul className={styles.lista}>
              <li>
                <a
                  href="https://wa.me/5491100000000"
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/latienda"
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a href="mailto:hola@latienda.com" className={styles.link}>
                  hola@latienda.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} La Tienda. Todos los derechos reservados.
          </p>
          <p className={styles.legal}>
            <Link href="/privacidad" className={styles.linkLegal}>Privacidad</Link>
            <span aria-hidden="true">·</span>
            <Link href="/terminos" className={styles.linkLegal}>Términos</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
