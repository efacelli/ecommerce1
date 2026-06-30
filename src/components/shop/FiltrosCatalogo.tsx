"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { CategoriaConHijas, FiltrosCatalogo } from "@/types";
import styles from "./FiltrosCatalogo.module.css";

type Props = {
  categorias: CategoriaConHijas[];
  filtrosActivos: FiltrosCatalogo;
};

const ORDENES = [
  { valor: "reciente", label: "Más recientes" },
  { valor: "destacado", label: "Destacados" },
  { valor: "precio-asc", label: "Precio: menor a mayor" },
  { valor: "precio-desc", label: "Precio: mayor a menor" },
] as const;

export function FiltrosCatalogo({ categorias, filtrosActivos }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function actualizarFiltro(clave: string, valor: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("pagina"); // Reset paginación al filtrar
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function limpiarFiltros() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hayFiltros =
    filtrosActivos.categoriaSlug ||
    filtrosActivos.orden !== "reciente";

  return (
    <div className={[styles.sidebar, isPending ? styles.cargando : ""].join(" ")}>

      {/* Ordenar */}
      <div className={styles.grupo}>
        <p className={styles.grupoTitulo}>Ordenar</p>
        <div className={styles.opciones}>
          {ORDENES.map((o) => (
            <button
              key={o.valor}
              onClick={() => actualizarFiltro("orden", o.valor)}
              className={[
                styles.opcion,
                filtrosActivos.orden === o.valor ? styles.opcionActiva : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categorías */}
      {categorias.length > 0 && (
        <div className={styles.grupo}>
          <p className={styles.grupoTitulo}>Categorías</p>
          <div className={styles.opciones}>
            <button
              onClick={() => actualizarFiltro("categoriaSlug", null)}
              className={[
                styles.opcion,
                !filtrosActivos.categoriaSlug ? styles.opcionActiva : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Todas
            </button>
            {categorias.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => actualizarFiltro("categoriaSlug", cat.slug)}
                  className={[
                    styles.opcion,
                    filtrosActivos.categoriaSlug === cat.slug
                      ? styles.opcionActiva
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {cat.nombre}
                </button>
                {/* Subcategorías */}
                {cat.hijas?.map((hija) => (
                  <button
                    key={hija.id}
                    onClick={() =>
                      actualizarFiltro("categoriaSlug", hija.slug)
                    }
                    className={[
                      styles.opcion,
                      styles.opcionHija,
                      filtrosActivos.categoriaSlug === hija.slug
                        ? styles.opcionActiva
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {hija.nombre}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limpiar filtros */}
      {hayFiltros && (
        <button onClick={limpiarFiltros} className={styles.btnLimpiar}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
