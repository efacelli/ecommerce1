import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoriaPorSlug } from "@/services/categoria.service";
import { getProductos } from "@/services/producto.service";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import type { FiltrosCatalogo } from "@/types";
import styles from "./page.module.css";

// Esta página depende de la categoría (params) y de filtros (searchParams)
// en cada request — nunca debe pre-renderizarse de forma estática en el build.
export const dynamic = "force-dynamic";

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

  // Si la categoría no tiene productos directos pero tiene subcategorías,
  // buscar productos de todas las subcategorías
  let productosFinales = resultado;
  if (resultado.total === 0 && categoria.hijas && categoria.hijas.length > 0) {
    const promesas = categoria.hijas.map((hija) =>
      getProductos({ ...filtros, categoriaSlug: hija.slug })
    );
    const resultados = await Promise.all(promesas);
    const todosItems = resultados.flatMap((r) => r.items);
    productosFinales = {
      items: todosItems,
      total: todosItems.length,
      pagina: 1,
      totalPaginas: 1,
      porPagina: todosItems.length,
    };
  }

  return (
    <div className={styles.pagina}>
      <div className="container">
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
            {productosFinales.total} {productosFinales.total === 1 ? "prenda" : "prendas"}
          </p>
        </div>

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

        <ProductGrid productos={productosFinales.items} />
        <Pagination
          paginaActual={productosFinales.pagina}
          totalPaginas={productosFinales.totalPaginas}
        />
      </div>
    </div>
  );
}