"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./MercadoPagoButton.module.css";

declare global {
  interface Window {
    MercadoPago: new (
      publicKey: string,
      options?: { locale: string }
    ) => {
      bricks(): {
        create(
          brick: string,
          containerId: string,
          settings: object
        ): Promise<{ unmount(): void }>;
      };
    };
  }
}

type Props = {
  pedidoId: number;
  onError?: (mensaje: string) => void;
};

type Estado =
  | "idle"
  | "cargando-preferencia"
  | "renderizando"
  | "listo"
  | "error";

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

export function MercadoPagoButton({ pedidoId, onError }: Props) {
  const [estado, setEstado]         = useState<Estado>("idle");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const brickControllerRef = useRef<{ unmount(): void } | null>(null);
  const containerRef       = useRef<HTMLDivElement>(null);

  // 1. Obtener preferencia al montar el componente
  useEffect(() => {
    async function obtenerPreferencia() {
      setEstado("cargando-preferencia");
      try {
        const res = await fetch("/api/mp-preference", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ pedidoId }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Error al crear la preferencia");
        }

        const data = await res.json();
        setPreferenceId(data.preferenceId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error inesperado";
        setMensajeError(msg);
        setEstado("error");
        onError?.(msg);
      }
    }

    obtenerPreferencia();
  }, [pedidoId, onError]);

  // 2. Cargar SDK de MP e inicializar el Wallet Brick cuando hay preferenceId
  useEffect(() => {
    if (!preferenceId || !MP_PUBLIC_KEY) return;

    let mounted = true;

    async function inicializarBrick() {
      setEstado("renderizando");

      // Cargar el SDK de MP dinámicamente (no hay paquete npm oficial para el Wallet Brick)
      await cargarScriptMP();
      if (!mounted) return;

      try {
        const mp = new window.MercadoPago(MP_PUBLIC_KEY, { locale: "es-AR" });
        const bricksBuilder = mp.bricks();

        if (brickControllerRef.current) {
          brickControllerRef.current.unmount();
        }

        const controller = await bricksBuilder.create(
          "wallet",
          "mp-wallet-brick-container",
          {
            initialization: { preferenceId },
            customization: {
              texts: {
                valueProp: "smart_option",
                // action: "buy",       // "buy" | "pay"
                // actionComplement: "", // texto adicional bajo el botón
              },
              visual: {
                // buttonBackground: "default" | "black" | "white" | "blue"
                buttonBackground: "default",
                borderRadius: "4px",
              },
            },
            callbacks: {
              onReady: () => {
                if (mounted) setEstado("listo");
              },
              onError: (err: unknown) => {
                console.error("[MP Brick] Error:", err);
                if (mounted) {
                  setEstado("error");
                  setMensajeError("Error al inicializar el botón de pago");
                }
              },
            },
          }
        );

        if (mounted) {
          brickControllerRef.current = controller;
        }
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : "Error al renderizar el botón";
          setMensajeError(msg);
          setEstado("error");
          onError?.(msg);
        }
      }
    }

    inicializarBrick();

    return () => {
      mounted = false;
      brickControllerRef.current?.unmount();
    };
  }, [preferenceId, onError]);

  if (estado === "error") {
    return (
      <div className={styles.error} role="alert">
        <p className={styles.errorTitulo}>No se pudo inicializar Mercado Pago</p>
        <p className={styles.errorTexto}>
          {mensajeError ?? "Intentá de nuevo o elegí otro método de pago."}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {/* Skeleton mientras carga */}
      {(estado === "idle" || estado === "cargando-preferencia" || estado === "renderizando") && (
        <div className={styles.skeleton} aria-label="Cargando Mercado Pago…" />
      )}

      {/* Contenedor donde MP inyecta el botón */}
      <div
        id="mp-wallet-brick-container"
        className={[
          styles.brickContainer,
          estado !== "listo" ? styles.brickOculto : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
}

// ─── Carga dinámica del SDK de MP ────────────────────────────────────────────

let scriptPromise: Promise<void> | null = null;

function cargarScriptMP(): Promise<void> {
  // Si ya está cargado, resolver inmediatamente
  if (typeof window !== "undefined" && window.MercadoPago) {
    return Promise.resolve();
  }

  // Si ya hay una carga en progreso, reutilizarla
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src   = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de Mercado Pago"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}
