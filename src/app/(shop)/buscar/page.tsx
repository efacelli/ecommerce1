import type { Metadata } from "next";
import { Suspense } from "react";
import { getProductos } from "@/services/producto.service";
import { SearchBar } from "@/components/shop/SearchBar";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/ui/Pagination";
import styles from "./page.module.css";

// Esta página depende de searchParams (query de búsqueda) en cada request,
// por lo que nunca debe pre-renderizarse de forma estática en el build.
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; pagina?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Resultados para "${q}"` : "Buscar",
  };
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q, pagina } = await searchParams;
  const query = q?.trim() ?? "";

  const resultado = query
    ? await getProductos({
        busqueda: query,
        pagina: pagina ? parseInt(pagina, 10) : 1,
      })
    : null;

  return (
    <div className={styles.pagina}>
      <div className="container">

        {/* Buscador */}
        <div className={styles.buscadorWrapper}>
          <h1 className={styles.titulo}>Buscar</h1>
          <Suspense>
            <SearchBar placeholder="Buscá una prenda, color o talle…" />
          </Suspense>
        </div>

        {/* Resultados */}
        {query && resultado && (
          <div className={styles.resultados}>
            <p className={styles.resumenBusqueda}>
              {resultado.total === 0 ? (
                <>Sin resultados para <strong>"{query}"</strong></>
              ) : (
                <>
                  <strong>{resultado.total}</strong>{" "}
                  {resultado.total === 1 ? "resultado" : "resultados"} para{" "}
                  <strong>"{query}"</strong>
                </>
              )}
            </p>

            <ProductGrid
              productos={resultado.items}
              vacio={
                <div className={styles.sinResultados}>
                  <p className={styles.sinResultadosTitulo}>
                    No encontramos "{query}"
                  </p>
                  <p className={styles.sinResultadosTexto}>
                    Probá con otras palabras o navegá el catálogo.
                  </p>
                </div>
              }
            />

            <Pagination
              paginaActual={resultado.pagina}
              totalPaginas={resultado.totalPaginas}
            />
          </div>
        )}

        {/* Estado inicial (sin query) */}
        {!query && (
          <div className={styles.sugerencias}>
            <p className={styles.sugerenciasTitulo}>Búsquedas frecuentes</p>
            <div className={styles.chips}>
              {[
                "Remeras", "Pantalones", "Jeans", "Vestidos",
                "Buzos", "Camperas", "Sale", "Novedades",
              ].map((s) => (
                <a
                  key={s}
                  href={`/buscar?q=${encodeURIComponent(s)}`}
                  className={styles.chip}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}