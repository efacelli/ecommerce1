import { createHmac } from "crypto";

/**
 * Valida la firma HMAC del webhook de Mercado Pago.
 *
 * Documentación oficial:
 * https://www.mercadopago.com.br/developers/en/docs/checkout-pro/payment-notifications
 *
 * El header x-signature tiene el formato:
 *   ts=<timestamp>,v1=<hmac_sha256>
 *
 * El manifest que se firma es:
 *   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 *
 * Si alguno de los valores no está presente en la notificación,
 * se omite del manifest (documentado por MP).
 */
export function validarFirmaWebhook({
  xSignature,
  xRequestId,
  dataId,
  secret,
}: {
  xSignature: string;
  xRequestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  try {
    // 1. Parsear el header x-signature
    const partes = xSignature.split(",");
    let ts: string | null = null;
    let v1: string | null = null;

    for (const parte of partes) {
      const [clave, valor] = parte.split("=");
      if (clave?.trim() === "ts") ts = valor?.trim() ?? null;
      if (clave?.trim() === "v1") v1 = valor?.trim() ?? null;
    }

    if (!ts || !v1) {
      console.error("[MP Webhook] Formato de x-signature inválido:", xSignature);
      return false;
    }

    // 2. Construir el manifest — solo incluir partes presentes
    const parteManifest: string[] = [];
    if (dataId)    parteManifest.push(`id:${dataId}`);
    if (xRequestId) parteManifest.push(`request-id:${xRequestId}`);
    parteManifest.push(`ts:${ts}`);
    const manifest = parteManifest.join(";");

    // 3. Calcular HMAC-SHA256
    const firma = createHmac("sha256", secret).update(manifest).digest("hex");

    // 4. Comparación en tiempo constante (previene timing attacks)
    const firmaBuffer   = Buffer.from(firma, "hex");
    const v1Buffer      = Buffer.from(v1, "hex");

    if (firmaBuffer.length !== v1Buffer.length) return false;

    // crypto.timingSafeEqual lanza si los buffers tienen distinto largo
    const { timingSafeEqual } = await import("crypto");
    return timingSafeEqual(firmaBuffer, v1Buffer);
  } catch (err) {
    console.error("[MP Webhook] Error validando firma:", err);
    return false;
  }
}

// Versión síncrona (sin top-level await) para entornos que no lo soportan
export function validarFirmaWebhookSync({
  xSignature,
  xRequestId,
  dataId,
  secret,
}: {
  xSignature: string;
  xRequestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  try {
    const partes = xSignature.split(",");
    let ts: string | null = null;
    let v1: string | null = null;

    for (const parte of partes) {
      const [clave, valor] = parte.split("=");
      if (clave?.trim() === "ts") ts = valor?.trim() ?? null;
      if (clave?.trim() === "v1") v1 = valor?.trim() ?? null;
    }

    if (!ts || !v1) return false;

    const parteManifest: string[] = [];
    if (dataId)     parteManifest.push(`id:${dataId}`);
    if (xRequestId) parteManifest.push(`request-id:${xRequestId}`);
    parteManifest.push(`ts:${ts}`);
    const manifest = parteManifest.join(";");

    const firma = createHmac("sha256", secret).update(manifest).digest("hex");

    // Comparación segura sin timing leaks
    if (firma.length !== v1.length) return false;
    let diff = 0;
    for (let i = 0; i < firma.length; i++) {
      diff |= firma.charCodeAt(i) ^ v1.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}
