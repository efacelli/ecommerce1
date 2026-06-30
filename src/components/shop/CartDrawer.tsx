"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCarrito } from "@/context/CarritoContext";
import { Button } from "@/components/ui/Button";
import { formatearPrecio, getImagenPrincipal } from "@/lib/utils";
import styles from "./CartDrawer.module.css";

export function CartDrawer() {
  const { items, abierto, totalItems, subtotal, quitarItem, cambiarCantidad, cerrarDrawer } =
    useCarrito();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && abierto) cerrarDrawer();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [abierto, cerrarDrawer]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [abierto]);

  // Foco al drawer cuando se abre (accesibilidad)
  useEffect(() => {
    if (abierto) drawerRef.current?.focus();
  }, [abierto]);

  return (
    <>
      {/* Overlay */}
      <div
        className={[styles.overlay, abierto ? styles.overlayVisible : ""].join(" ")}
        onClick={cerrarDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        tabIndex={-1}
        className={[styles.drawer, abierto ? styles.drawerAbierto : ""].join(" ")}
      >
        {/* Header del drawer */}
        <div className={styles.header}>
          <h2 className={styles.titulo}>
            Carrito
            {totalItems > 0 && (
              <span className={styles.count}>{totalItems}</span>
            )}
          </h2>
          <button
            onClick={cerrarDrawer}
            className={styles.btnCerrar}
            aria-label="Cerrar carrito"
          >
            <IconoCerrar />
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className={styles.vacio}>
            <p className={styles.vacioTitulo}>Tu carrito está vacío</p>
            <p className={styles.vacioTexto}>
              Explorá el catálogo y agregá lo que te guste.
            </p>
            <Button
              variante="secondary"
              tamaño="sm"
              onClick={cerrarDrawer}
            >
              Ver catálogo
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de ítems */}
            <ul className={styles.lista}>
              {items.map((item) => (
                <li key={item.varianteId} className={styles.item}>
                  <div className={styles.itemImagen}>
                    <Image
                      src={item.imagen || "/images/placeholder.png"}
                      alt={item.nombre}
                      fill
                      sizes="80px"
                      className={styles.imagen}
                    />
                  </div>

                  <div className={styles.itemInfo}>
                    <p className={styles.itemNombre}>{item.nombre}</p>
                    <p className={styles.itemVariante}>
                      Talle: {item.talle}
                      {item.color ? ` · ${item.color}` : ""}
                    </p>

                    <div className={styles.itemAcciones}>
                      {/* Selector de cantidad */}
                      <div className={styles.cantidad}>
                        <button
                          onClick={() =>
                            cambiarCantidad(item.varianteId, item.cantidad - 1)
                          }
                          className={styles.cantidadBtn}
                          aria-label="Reducir cantidad"
                        >
                          −
                        </button>
                        <span className={styles.cantidadValor}>
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() =>
                            cambiarCantidad(item.varianteId, item.cantidad + 1)
                          }
                          className={styles.cantidadBtn}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => quitarItem(item.varianteId)}
                        className={styles.btnQuitar}
                        aria-label={`Quitar ${item.nombre}`}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  <p className={styles.itemPrecio}>
                    {formatearPrecio(item.precio * item.cantidad)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Footer del drawer */}
            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span className={styles.subtotalLabel}>Subtotal</span>
                <span className={styles.subtotalValor}>
                  {formatearPrecio(subtotal)}
                </span>
              </div>
              <p className={styles.subtotalNota}>
                Envío y total final en el siguiente paso
              </p>

              <Link href="/carrito" onClick={cerrarDrawer}>
                <Button fullWidth tamaño="lg">
                  Ir al carrito
                </Button>
              </Link>

              <button onClick={cerrarDrawer} className={styles.btnSeguir}>
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function IconoCerrar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
