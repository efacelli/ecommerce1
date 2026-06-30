"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { schemaProducto } from "@/lib/validations/producto.admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parsearFormProducto(formData: FormData) {
  return {
    nombre:         String(formData.get("nombre") ?? ""),
    slug:           String(formData.get("slug") ?? ""),
    descripcion:    String(formData.get("descripcion") ?? ""),
    precio:         String(formData.get("precio") ?? ""),
    precioAnterior: String(formData.get("precioAnterior") ?? ""),
    categoriaId:    String(formData.get("categoriaId") ?? ""),
    activo:         formData.get("activo") === "true",
    destacado:      formData.get("destacado") === "true",
    imagenes:       JSON.parse(String(formData.get("imagenes") ?? "[]")),
    variantes:      JSON.parse(String(formData.get("variantes") ?? "[]")),
  };
}

type AccionEstado =
  | { tipo: "idle" }
  | { tipo: "error"; errores: Record<string, string>; mensajeGeneral?: string }
  | { tipo: "exito"; id: number };

// ─── Crear producto ───────────────────────────────────────────────────────────

export async function crearProductoAction(
  _prev: AccionEstado,
  formData: FormData
): Promise<AccionEstado> {
  const raw = parsearFormProducto(formData);
  const resultado = schemaProducto.safeParse(raw);

  if (!resultado.success) {
    const errores: Record<string, string> = {};
    for (const issue of resultado.error.issues) {
      const campo = issue.path.join(".");
      if (!errores[campo]) errores[campo] = issue.message;
    }
    return { tipo: "error", errores };
  }

  const d = resultado.data;

  try {
    const slugExiste = await prisma.producto.findUnique({
      where: { slug: d.slug },
      select: { id: true },
    });
    if (slugExiste) {
      return {
        tipo: "error",
        errores: { slug: "Este slug ya está en uso por otro producto" },
      };
    }

    const producto = await prisma.producto.create({
      data: {
        nombre:         d.nombre,
        slug:           d.slug,
        descripcion:    d.descripcion || null,
        precio:         Number(d.precio),
        precioAnterior: d.precioAnterior ? Number(d.precioAnterior) : null,
        categoriaId:    Number(d.categoriaId),
        activo:         d.activo,
        destacado:      d.destacado,
        imagenes:       d.imagenes,
        variantes: {
          create: d.variantes.map((v) => ({
            sku:    v.sku,
            talle:  v.talle,
            color:  v.color || null,
            stock:  v.stock,
            activa: v.activa,
          })),
        },
      },
    });

    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return { tipo: "exito", id: producto.id };
  } catch (err) {
    console.error(err);
    return {
      tipo: "error",
      errores: {},
      mensajeGeneral: "Error al guardar el producto. Intentá de nuevo.",
    };
  }
}

// ─── Editar producto ──────────────────────────────────────────────────────────

export async function editarProductoAction(
  id: number,
  _prev: AccionEstado,
  formData: FormData
): Promise<AccionEstado> {
  const raw = parsearFormProducto(formData);
  const resultado = schemaProducto.safeParse(raw);

  if (!resultado.success) {
    const errores: Record<string, string> = {};
    for (const issue of resultado.error.issues) {
      const campo = issue.path.join(".");
      if (!errores[campo]) errores[campo] = issue.message;
    }
    return { tipo: "error", errores };
  }

  const d = resultado.data;

  try {
    const slugExiste = await prisma.producto.findFirst({
      where: { slug: d.slug, NOT: { id } },
      select: { id: true },
    });
    if (slugExiste) {
      return {
        tipo: "error",
        errores: { slug: "Este slug ya está en uso" },
      };
    }

    // Separar variantes: nuevas / actualizar / eliminar
    const variantesEliminar = d.variantes
      .filter((v) => v._eliminar && v.id)
      .map((v) => v.id!);
    const variantesActualizar = d.variantes.filter(
      (v) => v.id && !v._eliminar
    );
    const variantesNuevas = d.variantes.filter((v) => !v.id && !v._eliminar);

    await prisma.$transaction(async (tx) => {
      // Actualizar producto base
      await tx.producto.update({
        where: { id },
        data: {
          nombre:         d.nombre,
          slug:           d.slug,
          descripcion:    d.descripcion || null,
          precio:         Number(d.precio),
          precioAnterior: d.precioAnterior ? Number(d.precioAnterior) : null,
          categoriaId:    Number(d.categoriaId),
          activo:         d.activo,
          destacado:      d.destacado,
          imagenes:       d.imagenes,
        },
      });

      // Eliminar variantes marcadas
      if (variantesEliminar.length) {
        await tx.variante.deleteMany({
          where: { id: { in: variantesEliminar }, productoId: id },
        });
      }

      // Actualizar variantes existentes
      for (const v of variantesActualizar) {
        await tx.variante.update({
          where: { id: v.id },
          data: {
            sku:    v.sku,
            talle:  v.talle,
            color:  v.color || null,
            stock:  v.stock,
            activa: v.activa,
          },
        });
      }

      // Crear variantes nuevas
      if (variantesNuevas.length) {
        await tx.variante.createMany({
          data: variantesNuevas.map((v) => ({
            sku:        v.sku,
            talle:      v.talle,
            color:      v.color || null,
            stock:      v.stock,
            activa:     v.activa,
            productoId: id,
          })),
        });
      }
    });

    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${id}/editar`);
    revalidatePath(`/productos/${d.slug}`);
    revalidatePath("/productos");
    return { tipo: "exito", id };
  } catch (err) {
    console.error(err);
    return {
      tipo: "error",
      errores: {},
      mensajeGeneral: "Error al actualizar el producto.",
    };
  }
}

// ─── Eliminar producto ────────────────────────────────────────────────────────

export async function eliminarProductoAction(id: number) {
  await prisma.producto.delete({ where: { id } });
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
  redirect("/admin/productos");
}

// ─── Actualizar stock de una variante ────────────────────────────────────────

export async function actualizarStockAction(
  varianteId: number,
  nuevoStock: number
) {
  if (nuevoStock < 0) throw new Error("Stock no puede ser negativo");
  await prisma.variante.update({
    where: { id: varianteId },
    data: { stock: nuevoStock },
  });
  revalidatePath("/admin/productos");
  revalidatePath("/admin/dashboard");
}

// ─── Toggles rápidos ─────────────────────────────────────────────────────────

export async function toggleActivoAction(id: number, activo: boolean) {
  await prisma.producto.update({ where: { id }, data: { activo } });
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

export async function toggleDestacadoAction(id: number, destacado: boolean) {
  await prisma.producto.update({ where: { id }, data: { destacado } });
  revalidatePath("/admin/productos");
  revalidatePath("/");
}
