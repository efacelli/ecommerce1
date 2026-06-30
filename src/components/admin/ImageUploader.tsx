"use client";

import { useState, useCallback } from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import styles from "./ImageUploader.module.css";

type ImagenSubida = {
  publicId: string;
  url:      string;
  width:    number;
  height:   number;
};

type Props = {
  /** URLs actuales del producto (para edición) */
  imagenesActuales?: string[];
  /** Se llama cada vez que la lista de URLs cambia */
  onChange: (urls: string[]) => void;
  /** Máximo de imágenes permitidas */
  maxImagenes?: number;
  /** Carpeta destino en Cloudinary */
  carpeta?: string;
};

/**
 * Extrae el public_id a partir de una URL de Cloudinary.
 * Ej: "https://res.cloudinary.com/demo/image/upload/v123/tienda/abc.jpg"
 *   → "tienda/abc"
 */
function extraerPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function ImageUploader({
  imagenesActuales = [],
  onChange,
  maxImagenes = 10,
  carpeta = "tienda/productos",
}: Props) {
  // Inicializar desde URLs existentes
  const [imagenes, setImagenes] = useState<ImagenSubida[]>(
    imagenesActuales.map((url) => ({
      publicId: extraerPublicId(url) ?? url,
      url,
      width:  0,
      height: 0,
    }))
  );
  const [eliminando, setEliminando] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const puedeSubirMas = imagenes.length < maxImagenes;

  // Callback cuando el widget sube exitosamente una imagen
  const handleSuccess = useCallback(
    (result: unknown) => {
      const info = (result as { info: Record<string, unknown> }).info;
      if (!info || typeof info !== "object") return;

      const nueva: ImagenSubida = {
        publicId: String(info.public_id ?? ""),
        url:      String(info.secure_url ?? ""),
        width:    Number(info.width ?? 0),
        height:   Number(info.height ?? 0),
      };

      setImagenes((prev) => {
        const actualizadas = [...prev, nueva];
        onChange(actualizadas.map((i) => i.url));
        return actualizadas;
      });
      setError(null);
    },
    [onChange]
  );

  // Eliminar imagen de Cloudinary y del estado
  const handleEliminar = useCallback(
    async (publicId: string) => {
      setEliminando((prev) => new Set(prev).add(publicId));
      setError(null);

      try {
        const res = await fetch("/api/cloudinary-delete", {
          method:  "DELETE",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ publicId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Error al eliminar");
        }

        setImagenes((prev) => {
          const actualizadas = prev.filter((i) => i.publicId !== publicId);
          onChange(actualizadas.map((i) => i.url));
          return actualizadas;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al eliminar la imagen"
        );
      } finally {
        setEliminando((prev) => {
          const s = new Set(prev);
          s.delete(publicId);
          return s;
        });
      }
    },
    [onChange]
  );

  // Reordenar arrastrando (drag & drop simple con índices)
  const moverImagen = useCallback(
    (desde: number, hacia: number) => {
      setImagenes((prev) => {
        const arr = [...prev];
        const [movida] = arr.splice(desde, 1);
        arr.splice(hacia, 0, movida);
        onChange(arr.map((i) => i.url));
        return arr;
      });
    },
    [onChange]
  );

  return (
    <div className={styles.uploader}>
      {/* Grid de imágenes actuales */}
      {imagenes.length > 0 && (
        <div className={styles.grid}>
          {imagenes.map((img, i) => (
            <div
              key={img.publicId}
              className={[
                styles.item,
                eliminando.has(img.publicId) ? styles.itemEliminando : "",
                i === 0 ? styles.itemPrincipal : "",
              ]
                .filter(Boolean)
                .join(" ")}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const desde = Number(e.dataTransfer.getData("text/plain"));
                if (desde !== i) moverImagen(desde, i);
              }}
            >
              {/* Badge "Principal" en la primera imagen */}
              {i === 0 && (
                <span className={styles.badgePrincipal}>Principal</span>
              )}

              {/* Preview con CldImage (optimizada automáticamente) */}
              <div className={styles.preview}>
                {img.url.startsWith("http") ? (
                  <CldImage
                    src={img.publicId || img.url}
                    alt={`Imagen ${i + 1}`}
                    fill
                    sizes="120px"
                    crop="fill"
                    gravity="auto"
                    className={styles.img}
                  />
                ) : (
                  // Fallback para URLs no-Cloudinary (edición de productos existentes)
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={`Imagen ${i + 1}`} className={styles.img} />
                )}
              </div>

              {/* Controles */}
              <div className={styles.controles}>
                {/* Mover a principal */}
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moverImagen(i, 0)}
                    className={styles.btnControl}
                    title="Hacer principal"
                    disabled={eliminando.has(img.publicId)}
                  >
                    ★
                  </button>
                )}

                {/* Eliminar */}
                <button
                  type="button"
                  onClick={() => handleEliminar(img.publicId)}
                  className={[styles.btnControl, styles.btnEliminar].join(" ")}
                  title="Eliminar imagen"
                  disabled={eliminando.has(img.publicId)}
                  aria-label={`Eliminar imagen ${i + 1}`}
                >
                  {eliminando.has(img.publicId) ? "…" : "×"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className={styles.error} role="alert">
          ⚠️ {error}
        </p>
      )}

      {/* Botón de subida — Cloudinary Upload Widget (signed) */}
      {puedeSubirMas && (
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          options={{
            // Permite seleccionar múltiples imágenes en una apertura
            multiple:   true,
            maxFiles:   maxImagenes - imagenes.length,
            folder:     carpeta,
            // Solo imágenes
            resourceType: "image",
            // Optimizaciones automáticas al subir
            // (también configurables en el upload preset de Cloudinary)
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
            maxFileSize: 10_000_000, // 10 MB
            // Fuentes habilitadas
            sources: ["local", "url", "camera"],
            // Idioma español
            language: "es",
            text: {
              es: {
                or:           "o",
                back:         "Atrás",
                advanced:     "Avanzado",
                close:        "Cerrar",
                no_results:   "Sin resultados",
                search_placeholder: "Buscar archivos",
                about_uw:     "Acerca del widget",
                menu: {
                  files: "Mis archivos",
                  web:   "URL web",
                  camera:"Cámara",
                },
                selection_counter: {
                  selected: "Seleccionado",
                },
                actions: {
                  upload: "Subir",
                  clear_all: "Limpiar todo",
                  log_out:   "Salir",
                },
                notifications: {
                  general_error:   "Ha ocurrido un error.",
                  general_prompt:  "¿Estás seguro?",
                  limit_reached:   "No se pueden seleccionar más archivos.",
                  invalid_add_url: "La URL debe ser válida.",
                  invalid_public_id: "El Public ID no puede contener \\.",
                  no_new_files:    "Los archivos ya fueron cargados.",
                  image_purchased: "Imagen comprada.",
                  video_purchased: "Video comprado.",
                },
                queue: {
                  title:         "Cola de subida",
                  title_uploading: "Subiendo",
                  title_processing: "Procesando",
                  mini_title:    "Subidas",
                  mini_title_uploading: "Subiendo",
                  mini_title_processing: "Procesando",
                  show:          "Mostrar",
                  retry_failed:  "Reintentar",
                  abort_all:     "Cancelar todo",
                  upload_more:   "Subir más",
                  done:          "Listo",
                  mini_upload_count: "{{num}} archivo(s) subido(s)",
                  mini_failed:   "{{num}} fallido(s)",
                  statuses: {
                    uploading:  "Subiendo...",
                    error:      "Error",
                    uploaded:   "Listo",
                    aborted:    "Cancelado",
                    processing: "Procesando...",
                  },
                },
                crop: {
                  title:        "Recortar",
                  crop_btn:     "Recortar",
                  skip_btn:     "Saltar",
                  reset_btn:    "Restablecer",
                  close_prompt: "Cerrar cancelará todas las subidas. ¿Estás seguro?",
                  image_error:  "Error al cargar imagen",
                  frame_error:  "Error al cargar marco",
                  double_tap_instruction: "Doble toque para ampliar",
                  restore:      "Restaurar recorte",
                },
                local: {
                  browse:        "Explorar",
                  dd_title_single: "Arrastrá tu imagen aquí",
                  dd_title_multi:  "Arrastrá tus imágenes aquí",
                  drop_title_single: "Soltá el archivo aquí",
                  drop_title_multiple: "Soltá los archivos aquí",
                },
              },
            },
          }}
          onSuccess={handleSuccess}
          onError={(err) => {
            console.error("[Cloudinary Widget Error]", err);
            setError("Error al subir la imagen. Intentá de nuevo.");
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className={styles.btnSubir}
            >
              <span className={styles.btnSubirIcono}>↑</span>
              {imagenes.length === 0
                ? "Subir imágenes"
                : `Agregar más (${imagenes.length}/${maxImagenes})`}
            </button>
          )}
        </CldUploadWidget>
      )}

      {/* Contador y ayuda */}
      <div className={styles.ayuda}>
        <p>
          {imagenes.length === 0
            ? "Todavía no hay imágenes"
            : `${imagenes.length} de ${maxImagenes} imágenes`}
          {imagenes.length > 1 && " · Arrastrá para reordenar · La primera es la principal"}
        </p>
        <p>Formatos: JPG, PNG, WebP, AVIF · Máx. 10 MB por imagen</p>
      </div>
    </div>
  );
}
