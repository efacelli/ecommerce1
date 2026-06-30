"use client";

import { useState } from "react";
import { useCarrito } from "@/context/CarritoContext";
import { Button } from "@/components/ui/Button";
import type { Variante } from "@/types";
import styles from "./AddToCartButton.module.css";

type Props = {
  producto: {
    id: number;
    nombre: string;
    slug: string;
    imagen: string;
    precio: number;
  };
  variantes: Variante[];
  talles: string[];
  colores: string[];
};

export function AddToCartButton({ producto, variantes, talles, colores }: Props) {
  const { agregarItem, abrirDrawer } = useCarrito();
  const [talleSeleccionado, setTalleSeleccionado] = useState<string | null>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(
    colores.length > 0 ? null : "__sin_color__"
  );
  const [error, setError] = useState<string | null>(null);
  const [agregado, setAgregado] = useState(false);

  const hayColores = colores.length > 0;

  // Variante que coincide con la selección actual
  const varianteActual = variantes.find((v) => {
    const talleOk = v.talle === talleSeleccionado;
    const colorOk = hayColores
      ? v.color === colorSeleccionado
      : true;
    return talleOk && colorOk;
  });

  const sinStock = varianteActual ? varianteActual.stock === 0 : false;

  // Talles disponibles para el color seleccionado (o todos si no hay colores)
  function talleDisponible(talle: string): boolean {
    const candidatas = variantes.filter((v) =>
      hayColores ? v.color === colorSeleccionado : true
    );
    const v = candidatas.find((v) => v.talle === talle);
    return !!v && v.stock > 0;
  }

  function handleAgregar() {
    setError(null);

    if (!talleSeleccionado) {
      setError("Seleccioná un talle");
      return;
    }
    if (hayColores && !colorSeleccionado) {
      setError("Seleccioná un color");
      return;
    }
    if (!varianteActual) {
      setError("Combinación no disponible");
      return;
    }
    if (varianteActual.stock === 0) {
      setError("Sin stock para esta selección");
      return;
    }

    agregarItem({
      productoId: producto.id,
      varianteId: varianteActual.id,
      nombre: producto.nombre,
      slug: producto.slug,
      imagen: producto.imagen,
      talle: varianteActual.talle,
      color: varianteActual.color,
      precio: producto.precio,
      cantidad: 1,
      sku: varianteActual.sku,
    });

    setAgregado(true);
    abrirDrawer();

    // Reset del feedback después de 2.5s
    setTimeout(() => setAgregado(false), 2500);
  }

  return (
    <div className={styles.wrapper}>
      {/* Selector de color */}
      {hayColores && (
        <div className={styles.selector}>
          <p className={styles.selectorLabel}>
            Color
            {colorSeleccionado && (
              <span className={styles.selectorValor}> — {colorSeleccionado}</span>
            )}
          </p>
          <div className={styles.colores}>
            {colores.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setColorSeleccionado(color);
                  setTalleSeleccionado(null);
                  setError(null);
                }}
                className={[
                  styles.colorBtn,
                  colorSeleccionado === color ? styles.colorBtnActivo : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`Color: ${color}`}
                aria-pressed={colorSeleccionado === color}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de talle */}
      <div className={styles.selector}>
        <div className={styles.selectorHeader}>
          <p className={styles.selectorLabel}>
            Talle
            {talleSeleccionado && (
              <span className={styles.selectorValor}> — {talleSeleccionado}</span>
            )}
          </p>
          <a href="/talles" className={styles.guiaTalles}>
            Guía de talles
          </a>
        </div>
        <div className={styles.talles}>
          {talles.map((talle) => {
            const disponible = talleDisponible(talle);
            return (
              <button
                key={talle}
                onClick={() => {
                  if (!disponible) return;
                  setTalleSeleccionado(talle);
                  setError(null);
                }}
                disabled={!disponible}
                className={[
                  styles.talleBtn,
                  talleSeleccionado === talle ? styles.talleBtnActivo : "",
                  !disponible ? styles.talleBtnAgotado : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`Talle ${talle}${!disponible ? " — sin stock" : ""}`}
                aria-pressed={talleSeleccionado === talle}
              >
                {talle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {/* Botón */}
      <Button
        onClick={handleAgregar}
        fullWidth
        tamaño="lg"
        disabled={sinStock}
      >
        {agregado
          ? "✓ Agregado al carrito"
          : sinStock
          ? "Sin stock"
          : "Agregar al carrito"}
      </Button>

      {/* WhatsApp fallback */}
      <a
        href={`https://wa.me/5491100000000?text=${encodeURIComponent(
          `Hola, quiero consultar sobre: ${producto.nombre} (${producto.slug})`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsapp}
      >
        <IconoWA />
        Consultar por WhatsApp
      </a>
    </div>
  );
}

function IconoWA() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49" />
    </svg>
  );
}
