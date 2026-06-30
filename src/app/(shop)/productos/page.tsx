import type { Metadata } from "next";
import { getProductos } from "@/services/producto.service";
import { getCategoriasRaiz } from "@/services/categoria.service";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import { FiltrosCatalogo as FiltrosCatalogoUI } from "@/components/shop/FiltrosCatalogo";
import type { FiltrosCatalogo } from "@/types";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{
    categoriaSlug?: string;
    busqueda?: string;
    orden?: string;
    pagina?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explorá toda nuestra colección de ropa.",
};

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams;

  const filtros: FiltrosCatalogo = {
    categoriaSlug: params.categoriaSlug,
    busqueda: params.busqueda,
    orden: (params.orden as FiltrosCatalogo["orden"]) ?? "reciente",
    pagina: params.pagina ? parseInt(params.pagina, 10) : 1,
  };

  const [resultado, categorias] = await Promise.all([
    getProductos(filtros),
    getCategoriasRaiz(),
  ]);

  const titulo = filtros.busqueda
    ? `Resultados para "${filtros.busqueda}"`
    : "Todo el catálogo";

  return (
    <div className={styles.pagina}>
      <div className="container">

        {/* ── Encabezado ──────────────────────────── */}
        <div className={styles.encabezado}>
          <div>
            <h1 className={styles.titulo}>{titulo}</h1>
            <p className={styles.conteo}>
              {resultado.total === 0
                ? "Sin resultados"
                : `${resultado.total} ${resultado.total === 1 ? "prenda" : "prendas"}`}
            </p>
          </div>
        </div>

        {/* ── Layout con sidebar ───────────────────── */}
        <div className={styles.layout}>

          {/* Sidebar de filtros */}
          <aside className={styles.sidebar}>
            <FiltrosCatalogoUI categorias={categorias} filtrosActivos={filtros} />
          </aside>

          {/* Grilla de productos */}
          <div className={styles.contenido}>
            <ProductGrid productos={resultado.items} />
            <Pagination
              paginaActual={resultado.pagina}
              totalPaginas={resultado.totalPaginas}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
