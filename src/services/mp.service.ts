import "server-only";
import { mpPreference, mpPayment } from "@/lib/mp.client";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

// Tipo definido localmente — evita depender de rutas internas del SDK
// que pueden cambiar entre versiones de "mercadopago"
type MPPreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
  picture_url?: string;
  category_id?: string;
};

// ─── Crear preferencia de pago ────────────────────────────────────────────────

type CrearPreferenciaInput = {
  pedidoId: number;
  numeroPedido: string;
  clienteEmail: string;
  clienteNombre: string;
  items: Array<{
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    imagen?: string;
  }>;
  costoEnvio: number;
};

export async function crearPreferenciaPago(input: CrearPreferenciaInput) {
  const {
    pedidoId,
    numeroPedido,
    clienteEmail,
    clienteNombre,
    items,
    costoEnvio,
  } = input;

  const mpItems: MPPreferenceItem[] = items.map((item) => ({
    id:           `item-${pedidoId}`,
    title:        item.nombre,
    quantity:     item.cantidad,
    unit_price:   Math.round(item.precioUnitario * 100) / 100,
    currency_id:  "ARS",
    picture_url:  item.imagen,
    category_id:  "fashion",
  }));

  if (costoEnvio > 0) {
    mpItems.push({
      id:          `envio-${pedidoId}`,
      title:       "Costo de envío",
      quantity:    1,
      unit_price:  costoEnvio,
      currency_id: "ARS",
    });
  }

  const preferencia = await mpPreference.create({
    body: {
      external_reference: numeroPedido,
      items: mpItems,

      payer: {
        email: clienteEmail,
        name:  clienteNombre,
      },

      back_urls: {
        success: `${BASE_URL}/checkout/mp-retorno?estado=aprobado&pedido=${numeroPedido}`,
        failure: `${BASE_URL}/checkout/mp-retorno?estado=fallido&pedido=${numeroPedido}`,
        pending: `${BASE_URL}/checkout/mp-retorno?estado=pendiente&pedido=${numeroPedido}`,
      },

      auto_return: "approved",

      expiration_date_to: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),

      metadata: {
        pedido_id:     pedidoId,
        numero_pedido: numeroPedido,
      },

      payment_methods: {
        installments: 12,
      },

      statement_descriptor: "LA TIENDA ROPA",
    },
  });

  if (!preferencia.id) {
    throw new Error("Mercado Pago no devolvió un ID de preferencia");
  }

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      pagoExternoId: preferencia.id,
      metodoPago:    "MERCADO_PAGO",
    },
  });

  return {
    preferenceId: preferencia.id,
    initPoint:    preferencia.init_point,
    sandboxUrl:   preferencia.sandbox_init_point,
  };
}

// ─── Obtener datos de un pago desde la API de MP ──────────────────────────────

export async function getPagoMP(paymentId: string) {
  return mpPayment.get({ id: paymentId });
}

// ─── Procesar notificación de pago (lógica de negocio) ───────────────────────

type EstadoPagoMP =
  | "approved"
  | "pending"
  | "in_process"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

const ESTADO_PAGO_MAP: Record<
  EstadoPagoMP,
  { estadoPago: string; estadoPedido: string | null }
> = {
  approved:     { estadoPago: "APROBADO",    estadoPedido: "CONFIRMADO"  },
  pending:      { estadoPago: "PENDIENTE",   estadoPedido: null           },
  in_process:   { estadoPago: "EN_PROCESO",  estadoPedido: null           },
  rejected:     { estadoPago: "RECHAZADO",   estadoPedido: "CANCELADO"   },
  cancelled:    { estadoPago: "RECHAZADO",   estadoPedido: "CANCELADO"   },
  refunded:     { estadoPago: "REEMBOLSADO", estadoPedido: "REEMBOLSADO" },
  charged_back: { estadoPago: "REEMBOLSADO", estadoPedido: "REEMBOLSADO" },
};

export async function procesarPagoWebhook(paymentId: string) {
  const pago = await getPagoMP(paymentId);

  const estadoMP    = pago.status as EstadoPagoMP;
  const externalRef = pago.external_reference;

  if (!externalRef) {
    console.warn(`[MP Webhook] Pago ${paymentId} sin external_reference`);
    return { omitido: true };
  }

  const mapeo = ESTADO_PAGO_MAP[estadoMP];
  if (!mapeo) {
    console.warn(`[MP Webhook] Estado desconocido: ${estadoMP}`);
    return { omitido: true };
  }

  const pedido = await prisma.pedido.findUnique({
    where: { numeroPedido: externalRef },
    select: { id: true, estadoPago: true, estado: true },
  });

  if (!pedido) {
    console.error(`[MP Webhook] Pedido no encontrado: ${externalRef}`);
    return { error: "pedido_no_encontrado" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.pedido.update({
      where: { id: pedido.id },
      data: {
        estadoPago:    mapeo.estadoPago as any,
        pagoExternoId: String(pago.id),
        pagoFecha:     estadoMP === "approved" ? new Date() : undefined,
        ...(mapeo.estadoPedido ? { estado: mapeo.estadoPedido as any } : {}),
      },
    });

    if (mapeo.estadoPedido && mapeo.estadoPedido !== pedido.estado) {
      await tx.historialEstado.create({
        data: {
          pedidoId: pedido.id,
          estado:   mapeo.estadoPedido as any,
          nota:     `Pago ${estadoMP} vía Mercado Pago (ID: ${pago.id})`,
        },
      });
    }
  });

  console.log(
    `[MP Webhook] Pedido ${externalRef} → estadoPago: ${mapeo.estadoPago}` +
    (mapeo.estadoPedido ? `, estadoPedido: ${mapeo.estadoPedido}` : "")
  );

  return { procesado: true, numeroPedido: externalRef, estadoMP };
}