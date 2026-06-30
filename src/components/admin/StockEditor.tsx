"use client";

import { useState, useTransition } from "react";
import { actualizarStockAction } from "@/actions/producto.admin.actions";
import type { AdminVariante } from "@/types/admin";
import styles from "./StockEditor.module.css";

type Props = {
  variantes: AdminVariante[];
  productoId: number;
};

export function StockEditor({ variantes }: Props) {
  const [stocks, setStocks] = useState<Record<number, number>>(
    Object.fromEntries(variantes.map((v) => [v.id, v.stock]))
  );
  const [guardando, setGuardando] = useState<Record<number, boolean>>({});
  const [guardado, setGuardado] = useState<Record<number, boolean>>({});
  const [, start] = useTransition();

  function handleChange(id: number, valor: number) {
    setStocks((prev) => ({ ...prev, [id]: Math.max(0, valor) }));
  }

  async function handleGuardar(id: number) {
    setGuardando((prev) => ({ ...prev, [id]: true }));
    start(async () => {
      await actualizarStockAction(id, stocks[id]);
      setGuardando((prev) => ({ ...prev, [id]: false }));
      setGuardado((prev) => ({ ...prev, [id]: true }));
      setTimeout(
        () => setGuardado((prev) => ({ ...prev, [id]: false })),
        2000
      );
    });
  }

  const activas  = variantes.filter((v) => v.activa);
  const inactivas = variantes.filter((v) => !v.activa);

  return (
    <div className={styles.editor}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th className={styles.th}>SKU</th>
            <th className={styles.th}>Talle</th>
            <th className={styles.th}>Color</th>
            <th className={styles.th}>Stock actual</th>
            <th className={styles.th}>Nuevo stock</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {activas.map((v) => {
            const cambio = stocks[v.id] - v.stock;
            const esCritico = stocks[v.id] <= 5;

            return (
              <tr key={v.id} className={styles.fila}>
                <td className={styles.tdMono}>{v.sku}</td>
                <td className={styles.td}>{v.talle}</td>
                <td className={styles.td}>{v.color ?? "—"}</td>
                <td className={[styles.td, esCritico ? styles.critico : ""].join(" ")}>
                  {v.stock}
                  {esCritico && (
                    <span className={styles.critTag}>bajo</span>
                  )}
                </td>
                <td className={styles.td}>
                  <div className={styles.inputWrapper}>
                    <button
                      type="button"
                      onClick={() => handleChange(v.id, stocks[v.id] - 1)}
                      className={styles.stepBtn}
                      aria-label="Restar 1"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={stocks[v.id]}
                      onChange={(e) => handleChange(v.id, Number(e.target.value))}
                      className={styles.input}
                      aria-label={`Stock de ${v.talle}${v.color ? ` ${v.color}` : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleChange(v.id, stocks[v.id] + 1)}
                      className={styles.stepBtn}
                      aria-label="Sumar 1"
                    >
                      +
                    </button>
                  </div>
                  {cambio !== 0 && (
                    <span
                      className={[
                        styles.delta,
                        cambio > 0 ? styles.deltaPos : styles.deltaNeg,
                      ].join(" ")}
                    >
                      {cambio > 0 ? `+${cambio}` : cambio}
                    </span>
                  )}
                </td>
                <td className={styles.td}>
                  {guardado[v.id] ? (
                    <span className={styles.ok}>✓ Guardado</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleGuardar(v.id)}
                      disabled={guardando[v.id] || stocks[v.id] === v.stock}
                      className={styles.btnGuardar}
                    >
                      {guardando[v.id] ? "…" : "Guardar"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}

          {inactivas.length > 0 && (
            <>
              <tr>
                <td colSpan={6} className={styles.separador}>
                  Variantes inactivas
                </td>
              </tr>
              {inactivas.map((v) => (
                <tr key={v.id} className={[styles.fila, styles.inactiva].join(" ")}>
                  <td className={styles.tdMono}>{v.sku}</td>
                  <td className={styles.td}>{v.talle}</td>
                  <td className={styles.td}>{v.color ?? "—"}</td>
                  <td className={styles.td}>{v.stock}</td>
                  <td className={styles.td} colSpan={2}>
                    <span className={styles.inactivaTag}>Inactiva</span>
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
