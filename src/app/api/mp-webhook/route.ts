import { NextRequest, NextResponse } from "next/server";
import { validarFirmaWebhookSync } from "@/lib/mp.webhook";
import { procesarPagoWebhook } from "@/services/mp.service";

const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? "";

/**
 * Webhook de Mercado Pago — POST /api/mp-webhook
 *
 * MP envía notificaciones cuando un pago es creado o actualizado.
 * Siempre debemos responder 200 rápido y procesar de forma asíncrona.
 *
 * Estructura del request:
 * - Header x-signature: ts=<timestamp>,v1=<hmac_sha256>
 * - Header x-request-id: UUID único por notificación
 * - Query param data.id: ID del pago en MP
 * - Body: { action, api_version, data: { id }, type, ... }
 */
export async function POST(req: NextRequest) {
  // 1. Extraer headers y query params necesarios para la validación
  const xSignature  = req.headers.get("x-signature") ?? "";
  const xRequestId  = req.headers.get("x-request-id");
  const dataId      = req.nextUrl.searchParams.get("data.id");
  const tipo        = req.nextUrl.searchParams.get("type");

  // 2. Validar firma HMAC — rechazar si falla
  if (!WEBHOOK_SECRET) {
    console.error("[MP Webhook] MP_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
  }

  if (xSignature) {
    const firmaValida = validarFirmaWebhookSync({
      xSignature,
      xRequestId,
      dataId,
      secret: WEBHOOK_SECRET,
    });

    if (!firmaValida) {
      console.warn("[MP Webhook] Firma inválida — posible request fraudulenta");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  } else {
    // En testing/sandbox MP puede no enviar la firma
    // En producción esto nunca debería ocurrir
    if (process.env.NODE_ENV === "production") {
      console.error("[MP Webhook] x-signature ausente en producción");
      return NextResponse.json({ error: "Firma requerida" }, { status: 401 });
    }
    console.warn("[MP Webhook] x-signature ausente — aceptando en desarrollo");
  }

  // 3. Parsear el body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  console.log("[MP Webhook] Notificación recibida:", {
    tipo,
    dataId,
    action:  body.action,
    liveMode: body.live_mode,
  });

  // 4. Solo procesar eventos de tipo "payment"
  if (tipo !== "payment" && body.type !== "payment") {
    // Responder 200 para que MP no reintente notificaciones que no manejamos
    return NextResponse.json({ ok: true, omitido: true });
  }

  // 5. Obtener el payment ID (viene en query param o en el body)
  const paymentId = dataId ?? String((body.data as Record<string, unknown>)?.id ?? "");

  if (!paymentId) {
    console.error("[MP Webhook] paymentId no encontrado");
    return NextResponse.json({ error: "paymentId requerido" }, { status: 400 });
  }

  // 6. Procesar el pago de forma asíncrona
  // Respondemos 200 ANTES de procesar para evitar timeouts de MP
  // (MP espera respuesta en < 22 segundos o reintenta hasta 3 veces)
  procesarPagoWebhook(paymentId).catch((err) => {
    console.error("[MP Webhook] Error procesando pago:", err);
  });

  return NextResponse.json({ ok: true, paymentId });
}

// MP también puede enviar GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ status: "webhook activo" });
}
