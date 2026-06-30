import type { Metadata } from "next";
import Link from "next/link";
import { getProductoDestacados } from "@/services/producto.service";
import { getCategoriasRaiz } from "@/services/categoria.service";
import { ProductCard } from "@/components/shop/ProductCard";
import { HeroHome } from "@/components/shop/HeroHome";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Las últimas colecciones de la temporada.",
};

export default async function HomePage() {
  const [productos, categorias] = await Promise.all([
    getProductoDestacados(8),
    getCategoriasRaiz(),
  ]);

  return (
    <>
      {/* Hero grande */}
      <HeroHome />

      {/* Categorías */}
      {categorias.length > 0 && (
        <section className={styles.seccion}>
          <div className="container">
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Categorías</h2>
            </div>
            <div className={styles.categoriasGrid}>
              {categorias.map((cat) => (
                <Link key={cat.id} href={`/categorias/${cat.slug}`} className={styles.catCard}>
                  <div className={styles.catColor} data-cat={cat.slug} />
                  <p className={styles.catNombre}>{cat.nombre}</p>
                  {cat.hijas && cat.hijas.length > 0 && (
                    <p className={styles.catSub}>{cat.hijas.length} subcategorías</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destacados */}
      {productos.length > 0 && (
        <section className={styles.seccion}>
          <div className="container">
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Destacados</h2>
              <Link href="/productos?orden=destacado" className={styles.verTodos}>
                Ver todos →
              </Link>
            </div>
            <div className={styles.productosGrid}>
              {productos.map((p, i) => (
                <ProductCard key={p.id} producto={p} prioridad={i < 2} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner servicios */}
      <section className={styles.banner}>
        <div className="container">
          <div className={styles.bannerGrid}>
            {[
              { icono: "📦", titulo: "Envío a todo el país",   texto: "Por Correo Argentino y Andreani" },
              { icono: "🔄", titulo: "Cambios sin costo",       texto: "Hasta 30 días desde la compra"   },
              { icono: "🏪", titulo: "Retiro en local",         texto: "Lunes a sábado de 9 a 20 hs"     },
              { icono: "💬", titulo: "Atención por WhatsApp",   texto: "Respondemos al instante"          },
            ].map((item) => (
              <div key={item.titulo} className={styles.bannerItem}>
                <span className={styles.bannerIcono} aria-hidden="true">{item.icono}</span>
                <div>
                  <p className={styles.bannerTitulo}>{item.titulo}</p>
                  <p className={styles.bannerTexto}>{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
