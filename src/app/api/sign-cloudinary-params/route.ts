import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

/**
 * POST /api/sign-cloudinary-params
 *
 * Requerido por CldUploadWidget para uploads firmados (signed).
 * Recibe los parámetros del widget y devuelve una firma HMAC
 * generada con el API Secret (que nunca sale del servidor).
 *
 * Documentación: https://next.cloudinary.dev/clduploadwidget/signed-uploads
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paramsToSign } = body as { paramsToSign: Record<string, string> };

    if (!paramsToSign || typeof paramsToSign !== "object") {
      return NextResponse.json(
        { error: "paramsToSign es requerido" },
        { status: 400 }
      );
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      console.error("[Cloudinary] CLOUDINARY_API_SECRET no configurado");
      return NextResponse.json(
        { error: "Configuración de Cloudinary incompleta" },
        { status: 500 }
      );
    }

    // Generar la firma usando el SDK oficial
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret
    );

    return NextResponse.json({ signature });
  } catch (err) {
    console.error("[sign-cloudinary-params]", err);
    return NextResponse.json(
      { error: "Error al firmar la solicitud" },
      { status: 500 }
    );
  }
}
