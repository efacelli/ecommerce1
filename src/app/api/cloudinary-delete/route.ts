import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { z } from "zod";

const schema = z.object({
  publicId: z.string().min(1, "publicId es requerido"),
});

/**
 * DELETE /api/cloudinary-delete
 *
 * Elimina un asset de Cloudinary por su public_id.
 * La eliminación requiere autenticación con API Secret — nunca desde el cliente.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicId } = schema.parse(body);

    const resultado = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (resultado.result !== "ok" && resultado.result !== "not found") {
      return NextResponse.json(
        { error: `Cloudinary devolvió: ${resultado.result}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, resultado: resultado.result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      );
    }
    console.error("[cloudinary-delete]", err);
    return NextResponse.json(
      { error: "Error al eliminar la imagen" },
      { status: 500 }
    );
  }
}
