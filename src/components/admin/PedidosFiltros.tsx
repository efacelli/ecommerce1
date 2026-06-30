"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import styles from "./PedidosFiltros.module.css";

const ESTADOS = [
  { valor: "", label: "Todos los estados" },
  { valor: "PENDIENTE",        label: "Pendiente" },
  { valor: "CONFIRMADO",       label: "Confirmado" },
  { valor: "EN_PREPARACION",   label: "En preparación" },
  { valor: "LISTO_PARA_ENVIO", label: "Listo para envío" },
  { valor: "EN_CAMINO",        label: "En camino" },
  { valor: "ENTREGADO",        label: "Entregado" },
  { valor: "CANCELADO",        label: "Cancelado" },
  { valor: "REEMBOLSADO",      label: "Reembolsado" },
];

export function PedidosFiltros() {
  const router = useRouter();
  const sp = useSearchParams();
  const [, start] = useTransition();

  function update(key: string, val: string | null) {
    const p = new URLSearchParams(sp.toString());
    p.delete("pagina");
    if (val) p.set(key, val); else p.delete(key);
    start(() => router.push(`/admin/pedidos?${p.toString()}`));
  }

  return (
    <div className={styles.barra}>
      <input
        type="search"
        placeholder="N° pedido, nombre o email…"
        defaultValue={sp.get("busqueda") ?? ""}
        className={styles.busqueda}
        onChange={(e) => update("busqueda", e.target.value || null)}
      />

      <select
        className={styles.select}
        value={sp.get("estado") ?? ""}
        onChange={(e) => update("estado", e.target.value || null)}
      >
        {ESTADOS.map((e) => (
          <option key={e.valor} value={e.valor}>{e.label}</option>
        ))}
      </select>

      <div className={styles.fechas}>
        <input
          type="date"
          value={sp.get("desde") ?? ""}
          onChange={(e) => update("desde", e.target.value || null)}
          className={styles.fecha}
          aria-label="Desde"
        />
        <span className={styles.fechaSep}>—</span>
        <input
          type="date"
          value={sp.get("hasta") ?? ""}
          onChange={(e) => update("hasta", e.target.value || null)}
          className={styles.fecha}
          aria-label="Hasta"
        />
      </div>

      {(sp.get("busqueda") || sp.get("estado") || sp.get("desde") || sp.get("hasta")) && (
        <button className={styles.limpiar} onClick={() => router.push("/admin/pedidos")}>
          Limpiar
        </button>
      )}
    </div>
  );
}
