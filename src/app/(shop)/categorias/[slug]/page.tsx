import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoriaPorSlug } from "@/services/categoria.service";
import { getProductos } from "@/services/producto.service";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import type { FiltrosCatalogo } from "@/types";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ orden?: string; pagina?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoriaPorSlug(slug);
  if (!cat) return { title: "Categoría no encontrada" };
  return {
    title: cat.nombre,
    description: cat.descripcion ?? `Explorá toda la colección de ${cat.nombre}.`,
  };
}

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const categoria = await getCategoriaPorSlug(slug);
  if (!categoria) notFound();

  const filtros: FiltrosCatalogo = {
    categoriaSlug: slug,
    orden: (sp.orden as FiltrosCatalogo["orden"]) ?? "reciente",
    pagina: sp.pagina ? parseInt(sp.pagina, 10) : 1,
  };

  const resultado = await getProductos(filtros);

  return (
    <div className={styles.pagina}>
      <div className="container">

        {/* ── Encabezado de categoría ──────────────── */}
        <div className={styles.header}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/" className={styles.breadLink}>Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link href="/productos" className={styles.breadLink}>Catálogo</Link>
            <span aria-hidden="true">›</span>
            <span className={styles.breadCurrent}>{categoria.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>{categoria.nombre}</h1>
          {categoria.descripcion && (
            <p className={styles.descripcion}>{categoria.descripcion}</p>
          )}
          <p className={styles.conteo}>
            {resultado.total} {resultado.total === 1 ? "prenda" : "prendas"}
          </p>
        </div>

        {/* ── Subcategorías ───────────────────────── */}
        {categoria.hijas && categoria.hijas.length > 0 && (
          <div className={styles.subcategorias}>
            {categoria.hijas.map((hija) => (
              <Link
                key={hija.id}
                href={`/categorias/${hija.slug}`}
                className={styles.subcatLink}
              >
                {hija.nombre}
              </Link>
            ))}
          </div>
        )}

        {/* ── Productos ───────────────────────────── */}
        <ProductGrid productos={resultado.items} />
        <Pagination
          paginaActual={resultado.pagina}
          totalPaginas={resultado.totalPaginas}
        />
      </div>
    </div>
  );
}
