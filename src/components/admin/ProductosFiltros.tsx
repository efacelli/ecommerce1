"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Categoria } from "@/types";
import styles from "./ProductosFiltros.module.css";

type Props = { categorias: Categoria[] };

export function ProductosFiltros({ categorias }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, start] = useTransition();

  function update(key: string, val: string | null) {
    const p = new URLSearchParams(sp.toString());
    p.delete("pagina");
    if (val) p.set(key, val); else p.delete(key);
    start(() => router.push(`/admin/productos?${p.toString()}`));
  }

  return (
    <div className={styles.barra}>
      <input
        type="search"
        placeholder="Buscar producto o slug…"
        defaultValue={sp.get("busqueda") ?? ""}
        className={styles.busqueda}
        onChange={(e) => update("busqueda", e.target.value || null)}
      />

      <select
        className={styles.select}
        value={sp.get("categoriaId") ?? ""}
        onChange={(e) => update("categoriaId", e.target.value || null)}
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>

      <select
        className={styles.select}
        value={sp.get("activo") ?? ""}
        onChange={(e) => update("activo", e.target.value || null)}
      >
        <option value="">Todos</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>

      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={sp.get("stockBajo") === "true"}
          onChange={(e) => update("stockBajo", e.target.checked ? "true" : null)}
        />
        Stock bajo
      </label>

      {(sp.get("busqueda") || sp.get("categoriaId") || sp.get("activo") || sp.get("stockBajo")) && (
        <button
          className={styles.limpiar}
          onClick={() => router.push("/admin/productos")}
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
