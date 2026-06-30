"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./Pagination.module.css";

type Props = {
  paginaActual: number;
  totalPaginas: number;
};

export function Pagination({ paginaActual, totalPaginas }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPaginas <= 1) return null;

  function irAPagina(pagina: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (pagina === 1) {
      params.delete("pagina");
    } else {
      params.set("pagina", String(pagina));
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Generar números de página con elipsis
  function getPaginas(): (number | "...")[] {
    const paginas: (number | "...")[] = [];
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }
    paginas.push(1);
    if (paginaActual > 3) paginas.push("...");
    for (
      let i = Math.max(2, paginaActual - 1);
      i <= Math.min(totalPaginas - 1, paginaActual + 1);
      i++
    ) {
      paginas.push(i);
    }
    if (paginaActual < totalPaginas - 2) paginas.push("...");
    paginas.push(totalPaginas);
    return paginas;
  }

  return (
    <nav className={styles.nav} aria-label="Paginación">
      <button
        onClick={() => irAPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className={styles.btnNav}
        aria-label="Página anterior"
      >
        ←
      </button>

      <div className={styles.paginas}>
        {getPaginas().map((p, i) =>
          p === "..." ? (
            <span key={`elipsis-${i}`} className={styles.elipsis}>
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => irAPagina(p)}
              aria-label={`Página ${p}`}
              aria-current={p === paginaActual ? "page" : undefined}
              className={[
                styles.btnPagina,
                p === paginaActual ? styles.activa : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => irAPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className={styles.btnNav}
        aria-label="Página siguiente"
      >
        →
      </button>
    </nav>
  );
}
