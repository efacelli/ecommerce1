"use client";

import Link from "next/link";
import styles from "./HeroHome.module.css";

export function HeroHome() {
  return (
    <section className={styles.hero}>
      <div className={styles.contenido}>
        <p className={styles.eyebrow}>Nueva colección 2026</p>
        <h1 className={styles.titulo}>
          Prendas que<br />
          <em>te definen</em>
        </h1>
        <p className={styles.subtitulo}>
          Diseños atemporales para cada ocasión.
          Calidad que se nota en cada detalle.
        </p>
        <div className={styles.ctas}>
          <Link href="/productos" className={styles.ctaPrimario}>
            Ver colección
          </Link>
          <Link href="/categorias/mujer" className={styles.ctaSecundario}>
            Mujer
          </Link>
          <Link href="/categorias/hombre" className={styles.ctaSecundario}>
            Hombre
          </Link>
        </div>
      </div>

      {/* Carrousel simple de tarjetas de color */}
      <div className={styles.visual}>
        <div className={styles.card1}>
          <div className={styles.cardInner}>
            <span className={styles.cardLabel}>Mujer</span>
          </div>
        </div>
        <div className={styles.card2}>
          <div className={styles.cardInner}>
            <span className={styles.cardLabel}>Hombre</span>
          </div>
        </div>
        <div className={styles.card3}>
          <div className={styles.cardInner}>
            <span className={styles.cardLabel}>Accesorios</span>
          </div>
        </div>
      </div>
    </section>
  );
}
