"use client";

import { useState, useTransition } from "react";
import { agregarNotaAdminAction } from "@/actions/pedido.admin.actions";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import styles from "./AgregarNotaForm.module.css";

type Props = { pedidoId: number };

export function AgregarNotaForm({ pedidoId }: Props) {
  const [mensaje, setMensaje] = useState("");
  const [esPublica, setEsPublica] = useState(false);
  const [isPending, start] = useTransition();
  const [ok, setOk] = useState(false);

  function handleAgregar() {
    if (!mensaje.trim()) return;
    start(async () => {
      await agregarNotaAdminAction(pedidoId, mensaje, esPublica);
      setMensaje("");
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    });
  }

  return (
    <div className={styles.form}>
      <p className={styles.titulo}>Agregar nota</p>

      <textarea
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        className={styles.textarea}
        rows={3}
        placeholder="Escribí una nota sobre este pedido…"
      />

      <div className={styles.footer}>
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={esPublica}
            onChange={(e) => setEsPublica(e.target.checked)}
            className={styles.check}
          />
          Nota pública (visible al cliente)
        </label>

        <AdminButton
          tamaño="sm"
          variante="secondary"
          cargando={isPending}
          disabled={!mensaje.trim() || isPending}
          onClick={handleAgregar}
        >
          {ok ? "✓ Guardada" : "Agregar nota"}
        </AdminButton>
      </div>
    </div>
  );
}
