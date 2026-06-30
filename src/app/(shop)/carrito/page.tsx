"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCarrito } from "@/context/CarritoContext";
import { Button } from "@/components/ui/Button";
import { formatearPrecio } from "@/lib/utils";
import styles from "./page.module.css";

function CarritoContenido() {
  const { items, subtotal, totalItems, quitarItem, cambiarCantidad, vaciarCarrito } =
    useCarrito();

  if (items.length === 0) {
    return (
      <div className={styles.vacio}>
        <div className={styles.vacioInner}>
          <p className={styles.vacioTitulo}>Tu carrito está vacío</p>
          <p className={styles.vacioTexto}>
            Explorá el catálogo y agregá las prendas que más te gusten.
          </p>
          <Link href="/productos">
            <Button tamaño="lg">Ver catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const costoEnvio = 0;
  const total = subtotal + costoEnvio;

  return (
    <div className={styles.pagina}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.titulo}>
            Carrito
            <span className={styles.count}>{totalItems} {totalItems === 1 ? "ítem" : "ítems"}</span>
          </h1>
          <button onClick={vaciarCarrito} className={styles.btnVaciar}>
            Vaciar carrito
          </button>
        </div>

        <div className={styles.layout}>
          <div className={styles.lista}>
            <div className={styles.tablaHeader}>
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Subtotal</span>
            </div>

            {items.map((item) => (
              <div key={item.varianteId} className={styles.item}>
                <div className={styles.itemImagen}>
                  <Image
                    src={item.imagen || "/images/placeholder.png"}
                    alt={item.nombre}
                    fill
                    sizes="100px"
                    className={styles.imagen}
                    unoptimized
                  />
                </div>

                <div className={styles.itemInfo}>
                  <Link href={`/productos/${item.slug}`} className={styles.itemNombre}>
                    {item.nombre}
                  </Link>
                  <p className={styles.itemVariante}>
                    Talle: {item.talle}
                    {item.color ? ` · ${item.color}` : ""}
                  </p>
                  <p className={styles.itemPrecioUnitario}>
                    {formatearPrecio(item.precio)} c/u
                  </p>
                  <button
                    onClick={() => quitarItem(item.varianteId)}
                    className={styles.btnQuitar}
                  >
                    Quitar
                  </button>
                </div>

                <div className={styles.cantidadWrapper}>
                  <div className={styles.cantidad}>
                    <button
                      onClick={() => cambiarCantidad(item.varianteId, item.cantidad - 1)}
                      className={styles.cantidadBtn}
                      aria-label="Reducir cantidad"
                    >
                      −
                    </button>
                    <span className={styles.cantidadValor}>{item.cantidad}</span>
                    <button
                      onClick={() => cambiarCantidad(item.varianteId, item.cantidad + 1)}
                      className={styles.cantidadBtn}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className={styles.itemSubtotal}>
                  {formatearPrecio(item.precio * item.cantidad)}
                </p>
              </div>
            ))}
          </div>

          <aside className={styles.resumen}>
            <h2 className={styles.resumenTitulo}>Resumen</h2>

            <div className={styles.resumenLineas}>
              <div className={styles.linea}>
                <span className={styles.lineaLabel}>Subtotal</span>
                <span>{formatearPrecio(subtotal)}</span>
              </div>
              <div className={styles.linea}>
                <span className={styles.lineaLabel}>Envío</span>
                <span className={styles.envioValor}>A calcular</span>
              </div>
            </div>

            <div className={styles.totalLinea}>
              <span className={styles.totalLabel}>Total estimado</span>
              <span className={styles.totalValor}>{formatearPrecio(total)}</span>
            </div>

            <p className={styles.totalNota}>
              El costo de envío se confirma al completar el pedido
            </p>

            <Link href="/checkout">
              <Button fullWidth tamaño="lg">
                Completar pedido
              </Button>
            </Link>

            <Link href="/productos" className={styles.seguirComprando}>
              ← Seguir comprando
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CarritoPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <CarritoContenido />
    </Suspense>
  );
}