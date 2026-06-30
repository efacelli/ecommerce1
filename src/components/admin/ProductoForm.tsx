"use client";

import { useActionState, useState, useCallback } from "react";
import { toSlug } from "@/lib/utils";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import type { AdminProducto, VarianteFormData } from "@/types/admin";
import type { Categoria } from "@/types";
import styles from "./ProductoForm.module.css";

type AccionEstado =
  | { tipo: "idle" }
  | { tipo: "error"; errores: Record<string, string>; mensajeGeneral?: string }
  | { tipo: "exito"; id: number };

type Props = {
  categorias: Categoria[];
  producto?: AdminProducto; // undefined = modo crear
  action: (prev: AccionEstado, fd: FormData) => Promise<AccionEstado>;
};

const TALLAS_COMUNES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "ÚNICA",
  "34","36","38","40","42","44","46","48"];

export function ProductoForm({ categorias, producto, action }: Props) {
  const esEdicion = !!producto;

  // Variantes en estado local (se serializan al submit)
  const [variantes, setVariantes] = useState<VarianteFormData[]>(
    producto?.variantes.map((v) => ({
      id: v.id,
      sku: v.sku,
      talle: v.talle,
      color: v.color ?? "",
      stock: v.stock,
      activa: v.activa,
    })) ?? [{ sku: "", talle: "", color: "", stock: 0, activa: true }]
  );

  // Imágenes en estado local
  const [imagenes, setImagenes] = useState<string[]>(
    producto?.imagenes ?? [""]
  );

  // Nombre → auto-generar slug
  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [slug, setSlug] = useState(producto?.slug ?? "");
  const [slugManual, setSlugManual] = useState(esEdicion);

  const [estado, accion, isPending] = useActionState(action, { tipo: "idle" });

  const errores =
    estado.tipo === "error" ? estado.errores : ({} as Record<string, string>);

  // ── Handlers variantes ────────────────────────────
  const agregarVariante = useCallback(() => {
    setVariantes((prev) => [
      ...prev,
      { sku: "", talle: "", color: "", stock: 0, activa: true },
    ]);
  }, []);

  const actualizarVariante = useCallback(
    (i: number, campo: keyof VarianteFormData, valor: unknown) => {
      setVariantes((prev) =>
        prev.map((v, idx) => (idx === i ? { ...v, [campo]: valor } : v))
      );
    },
    []
  );

  const eliminarVariante = useCallback((i: number) => {
    setVariantes((prev) => {
      const v = prev[i];
      if (v.id) return prev.map((x, idx) => (idx === i ? { ...x, _eliminar: true } : x));
      return prev.filter((_, idx) => idx !== i);
    });
  }, []);

  // ── Submit ────────────────────────────────────────
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    fd.set("variantes", JSON.stringify(variantes));
    fd.set("imagenes", JSON.stringify(imagenes.filter((u) => u.trim())));
    fd.set("activo", (e.currentTarget.activo as HTMLInputElement).checked ? "true" : "false");
    fd.set("destacado", (e.currentTarget.destacado as HTMLInputElement).checked ? "true" : "false");
    // Dejar que el action procese
    return fd;
  }

  const variantesVisibles = variantes.filter((v) => !v._eliminar);

  return (
    <form
      action={accion}
      className={styles.form}
      onSubmit={(e) => {
        // Inyectar JSON antes de que el form action lo procese
        const fd = new FormData(e.currentTarget);
        fd.set("variantes", JSON.stringify(variantes));
        fd.set("imagenes", JSON.stringify(imagenes.filter((u) => u.trim())));
      }}
    >
      {/* Campos ocultos para arrays */}
      <input type="hidden" name="variantes" value={JSON.stringify(variantes)} />
      <input type="hidden" name="imagenes" value={JSON.stringify(imagenes.filter((u) => u.trim()))} />

      {estado.tipo === "error" && estado.mensajeGeneral && (
        <div className={styles.errorGeneral} role="alert">
          ⚠️ {estado.mensajeGeneral}
        </div>
      )}

      <div className={styles.grid}>
        {/* ── Columna principal ───────────────────── */}
        <div className={styles.colPrincipal}>

          {/* Info básica */}
          <section className={styles.seccion}>
            <h3 className={styles.seccionTitulo}>Información básica</h3>

            <div className={styles.campo}>
              <label className={styles.label}>Nombre *</label>
              <input
                name="nombre"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (!slugManual) setSlug(toSlug(e.target.value));
                }}
                className={[styles.input, errores.nombre ? styles.inputError : ""].join(" ")}
                placeholder="Remera Básica Blanca"
                required
              />
              {errores.nombre && <p className={styles.error}>{errores.nombre}</p>}
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Slug (URL) *</label>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManual(true);
                }}
                className={[styles.input, errores.slug ? styles.inputError : ""].join(" ")}
                placeholder="remera-basica-blanca"
                required
              />
              {errores.slug && <p className={styles.error}>{errores.slug}</p>}
              <p className={styles.ayuda}>
                URL: /productos/<strong>{slug || "…"}</strong>
              </p>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Descripción</label>
              <textarea
                name="descripcion"
                defaultValue={producto?.descripcion ?? ""}
                className={styles.textarea}
                rows={4}
                placeholder="Descripción del producto…"
              />
            </div>

            <div className={styles.camposFila}>
              <div className={styles.campo}>
                <label className={styles.label}>Categoría *</label>
                <select
                  name="categoriaId"
                  defaultValue={producto?.categoriaId ?? ""}
                  className={[styles.select, errores.categoriaId ? styles.inputError : ""].join(" ")}
                  required
                >
                  <option value="">Seleccioná…</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                {errores.categoriaId && <p className={styles.error}>{errores.categoriaId}</p>}
              </div>
            </div>
          </section>

          {/* Precios */}
          <section className={styles.seccion}>
            <h3 className={styles.seccionTitulo}>Precios</h3>
            <div className={styles.camposFila}>
              <div className={styles.campo}>
                <label className={styles.label}>Precio actual *</label>
                <div className={styles.inputMoneda}>
                  <span>$</span>
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={producto?.precio ?? ""}
                    className={[styles.inputNum, errores.precio ? styles.inputError : ""].join(" ")}
                    placeholder="9500"
                    required
                  />
                </div>
                {errores.precio && <p className={styles.error}>{errores.precio}</p>}
              </div>

              <div className={styles.campo}>
                <label className={styles.label}>Precio anterior</label>
                <div className={styles.inputMoneda}>
                  <span>$</span>
                  <input
                    name="precioAnterior"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={producto?.precioAnterior ?? ""}
                    className={styles.inputNum}
                    placeholder="12000"
                  />
                </div>
                <p className={styles.ayuda}>Para mostrar el descuento tachado</p>
              </div>
            </div>
          </section>

          {/* Imágenes */}
          <section className={styles.seccion}>
            <h3 className={styles.seccionTitulo}>Imágenes</h3>
            <p className={styles.ayuda} style={{ marginBottom: "var(--a-space-3)" }}>
              Ingresá las URLs de las imágenes (la primera será la principal)
            </p>

            {imagenes.map((url, i) => (
              <div key={i} className={styles.imagenFila}>
                <input
                  type="url"
                  value={url}
                  onChange={(e) =>
                    setImagenes((prev) =>
                      prev.map((x, idx) => (idx === i ? e.target.value : x))
                    )
                  }
                  className={styles.input}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {imagenes.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setImagenes((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className={styles.btnQuitarImagen}
                    aria-label="Quitar imagen"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {errores.imagenes && (
              <p className={styles.error}>{errores.imagenes}</p>
            )}

            <button
              type="button"
              onClick={() => setImagenes((prev) => [...prev, ""])}
              className={styles.btnAgregarImagen}
            >
              + Agregar imagen
            </button>
          </section>

          {/* Variantes */}
          <section className={styles.seccion}>
            <div className={styles.seccionHeaderRow}>
              <h3 className={styles.seccionTitulo}>
                Variantes ({variantesVisibles.length})
              </h3>
              <button
                type="button"
                onClick={agregarVariante}
                className={styles.btnAgregarVariante}
              >
                + Agregar variante
              </button>
            </div>

            {errores.variantes && (
              <p className={styles.error} style={{ marginBottom: "var(--a-space-3)" }}>
                {errores.variantes}
              </p>
            )}

            <div className={styles.variantesHeader}>
              <span>SKU</span>
              <span>Talle</span>
              <span>Color</span>
              <span>Stock</span>
              <span>Activa</span>
              <span></span>
            </div>

            {variantes.map((v, i) => {
              if (v._eliminar) return null;
              return (
                <div key={i} className={styles.varianteFila}>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => actualizarVariante(i, "sku", e.target.value.toUpperCase())}
                    className={styles.inputSm}
                    placeholder="REM-001-M"
                  />

                  <input
                    list={`talles-${i}`}
                    value={v.talle}
                    onChange={(e) => actualizarVariante(i, "talle", e.target.value)}
                    className={styles.inputSm}
                    placeholder="M"
                  />
                  <datalist id={`talles-${i}`}>
                    {TALLAS_COMUNES.map((t) => <option key={t} value={t} />)}
                  </datalist>

                  <input
                    type="text"
                    value={v.color ?? ""}
                    onChange={(e) => actualizarVariante(i, "color", e.target.value)}
                    className={styles.inputSm}
                    placeholder="Azul"
                  />

                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => actualizarVariante(i, "stock", Number(e.target.value))}
                    className={[styles.inputSm, styles.inputNum].join(" ")}
                    placeholder="0"
                  />

                  <input
                    type="checkbox"
                    checked={v.activa}
                    onChange={(e) => actualizarVariante(i, "activa", e.target.checked)}
                    className={styles.checkbox}
                    aria-label="Variante activa"
                  />

                  <button
                    type="button"
                    onClick={() => eliminarVariante(i)}
                    className={styles.btnEliminarVariante}
                    aria-label="Eliminar variante"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </section>
        </div>

        {/* ── Columna sidebar ──────────────────────── */}
        <div className={styles.colSidebar}>

          {/* Publicación */}
          <section className={styles.seccion}>
            <h3 className={styles.seccionTitulo}>Publicación</h3>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                name="activo"
                defaultChecked={producto?.activo ?? true}
                className={styles.checkbox}
              />
              <div>
                <p className={styles.checkLabel}>Producto activo</p>
                <p className={styles.ayuda}>Visible en la tienda</p>
              </div>
            </label>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                name="destacado"
                defaultChecked={producto?.destacado ?? false}
                className={styles.checkbox}
              />
              <div>
                <p className={styles.checkLabel}>Destacado en home</p>
                <p className={styles.ayuda}>Aparece en la sección destacados</p>
              </div>
            </label>
          </section>

          {/* Acciones */}
          <div className={styles.acciones}>
            <AdminButton
              type="submit"
              cargando={isPending}
              disabled={isPending}
              style={{ width: "100%" }}
            >
              {isPending
                ? "Guardando…"
                : esEdicion
                ? "Guardar cambios"
                : "Crear producto"}
            </AdminButton>

            <a href="/admin/productos" className={styles.btnCancelar}>
              Cancelar
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}
