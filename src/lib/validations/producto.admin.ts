import { z } from "zod";

export const schemaVariante = z.object({
  id: z.number().optional(),
  sku: z
    .string()
    .min(1, "El SKU es requerido")
    .max(100, "SKU demasiado largo")
    .regex(/^[A-Z0-9\-]+$/, "Solo mayúsculas, números y guiones")
    .trim(),
  talle: z
    .string()
    .min(1, "El talle es requerido")
    .max(10, "Talle demasiado largo")
    .trim(),
  color: z.string().max(50).trim().optional().or(z.literal("")),
  stock: z
    .number({ invalid_type_error: "El stock debe ser un número" })
    .int("El stock debe ser entero")
    .min(0, "El stock no puede ser negativo"),
  activa: z.boolean().default(true),
  _eliminar: z.boolean().optional(),
});

export const schemaProducto = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(200, "Nombre demasiado largo")
    .trim(),

  slug: z
    .string()
    .min(2, "El slug es requerido")
    .max(220, "Slug demasiado largo")
    .regex(/^[a-z0-9\-]+$/, "Solo minúsculas, números y guiones")
    .trim(),

  descripcion: z.string().max(2000).trim().optional().or(z.literal("")),

  precio: z
    .string()
    .min(1, "El precio es requerido")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "El precio debe ser mayor a 0",
    }),

  precioAnterior: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "El precio anterior debe ser un número válido",
    }),

  categoriaId: z
    .string()
    .min(1, "Seleccioná una categoría")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "Seleccioná una categoría válida",
    }),

  activo: z.boolean().default(true),
  destacado: z.boolean().default(false),

  imagenes: z
    .array(z.string().url("Cada imagen debe ser una URL válida"))
    .min(1, "Agregá al menos una imagen")
    .max(10, "Máximo 10 imágenes"),

  variantes: z
    .array(schemaVariante)
    .min(1, "Agregá al menos una variante")
    .refine(
      (variantes) => {
        const activas = variantes.filter((v) => !v._eliminar);
        const claves = activas.map((v) => `${v.talle}|${v.color ?? ""}`.toLowerCase());
        return new Set(claves).size === claves.length;
      },
      { message: "Hay variantes con talle y color duplicados" }
    ),
});

export type DatosProducto = z.infer<typeof schemaProducto>;
export type DatosVariante = z.infer<typeof schemaVariante>;
