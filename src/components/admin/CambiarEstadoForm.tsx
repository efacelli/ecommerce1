"use client";

import { useState, useTransition } from "react";
import { cambiarEstadoPedidoAction } from "@/actions/pedido.admin.actions";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import type { EstadoPedido } from "@/types/admin";
import styles from "./CambiarEstadoForm.module.css";

const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE:        ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO:       ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION:   ["LISTO_PARA_ENVIO", "CANCELADO"],
  LISTO_PARA_ENVIO: ["EN_CAMINO", "ENTREGADO"],
  EN_CAMINO:        ["ENTREGADO"],
  ENTREGADO:        ["REEMBOLSADO"],
  CANCELADO:        ["PENDIENTE"],
  REEMBOLSADO:      [],
};

const LABEL: Record<EstadoPedido, string> = {
  PENDIENTE:        "Marcar pendiente",
  CONFIRMADO:       "Confirmar pedido",
  EN_PREPARACION:   "Iniciar preparación",
  LISTO_PARA_ENVIO: "Listo para envío",
  EN_CAMINO:        "Marcar en camino",
  ENTREGADO:        "Marcar entregado",
  CANCELADO:        "Cancelar pedido",
  REEMBOLSADO:      "Marcar reembolsado",
};

type Props = {
  pedidoId: number;
  estadoActual: EstadoPedido;
};

export function CambiarEstadoForm({ pedidoId, estadoActual }: Props) {
  const [nota, setNota] = useState("");
  const [isPending, start] = useTransition();
  const [ok, setOk] = useState(false);

  const siguientes = TRANSICIONES[estadoActual] ?? [];

  if (siguientes.length === 0) {
    return (
      <p className={styles.sinAcciones}>
        No hay más cambios de estado posibles.
      </p>
    );
  }

  async function handleCambio(estado: EstadoPedido) {
    start(async () => {
      await cambiarEstadoPedidoAction(pedidoId, estado, nota || undefined);
      setNota("");
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    });
  }

  return (
    <div className={styles.form}>
      <div className={styles.campo}>
        <label className={styles.label} htmlFor={`nota-${pedidoId}`}>
          Nota de cambio (opcional)
        </label>
        <textarea
          id={`nota-${pedidoId}`}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className={styles.textarea}
          rows={2}
          placeholder="Ej: Nro. de seguimiento: AR123456"
        />
      </div>

      <div className={styles.botones}>
        {siguientes.map((s) => {
          const esCancelar = s === "CANCELADO" || s === "REEMBOLSADO";
          return (
            <AdminButton
              key={s}
              variante={esCancelar ? "danger" : "primary"}
              tamaño="sm"
              cargando={isPending}
              onClick={() => handleCambio(s)}
              style={{ flex: 1 }}
            >
              {LABEL[s]}
            </AdminButton>
          );
        })}
      </div>

      {ok && (
        <p className={styles.ok} role="status">
          ✓ Estado actualizado
        </p>
      )}
    </div>
  );
}
