import "server-only";
import { mpPreference, mpPayment } from "@/lib/mp.client";
import { prisma } from "@/lib/prisma";
import type { PreferenceItem } from "mercadopago/dist/clients/preference/commonTypes";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

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

  // Armar los items de MP (un item por producto + envío si aplica)
  const mpItems: PreferenceItem[] = items.map((item) => ({
    id:           `item-${pedidoId}`,
    title:        item.nombre,
    quantity:     item.cantidad,
    unit_price:   Math.round(item.precioUnitario * 100) / 100, // 2 decimales exactos
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
      // Identificador de tu sistema para reconciliar con el webhook
      external_reference: numeroPedido,

      items: mpItems,

      payer: {
        email: clienteEmail,
        name:  clienteNombre,
      },

      // URLs de retorno tras el pago
      back_urls: {
        success: `${BASE_URL}/checkout/mp-retorno?estado=aprobado&pedido=${numeroPedido}`,
        failure: `${BASE_URL}/checkout/mp-retorno?estado=fallido&pedido=${numeroPedido}`,
        pending: `${BASE_URL}/checkout/mp-retorno?estado=pendiente&pedido=${numeroPedido}`,
      },

      // Retorno automático solo cuando el pago es aprobado
      auto_return: "approved",

      // URL donde MP envía las notificaciones (reemplaza la configurada en el panel
      // si se define aquí — útil para multi-tenant o testing con ngrok)
      // notification_url: `${BASE_URL}/api/mp-webhook`,

      // Vencimiento: el link de pago expira en 24 horas
      expiration_date_to: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),

      // Metadatos adicionales para debugging
      metadata: {
        pedido_id:    pedidoId,
        numero_pedido: numeroPedido,
      },

      // Configuración para Argentina
      payment_methods: {
        // Excluir métodos que no querés aceptar (opcional)
        // excluded_payment_methods: [{ id: "amex" }],
        // excluded_payment_types:   [{ id: "ticket" }],
        installments: 12, // Cuotas máximas
      },

      // Modo statement para que el cliente vea el nombre de tu negocio
      statement_descriptor: "LA TIENDA ROPA",
    },
  });

  if (!preferencia.id) {
    throw new Error("Mercado Pago no devolvió un ID de preferencia");
  }

  // Guardar el preference ID en el pedido para trazabilidad
  await prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      pagoExternoId: preferencia.id,
      metodoPago:    "MERCADO_PAGO",
    },
  });

  return {
    preferenceId: preferencia.id,
    initPoint:    preferencia.init_point,         // URL de producción
    sandboxUrl:   preferencia.sandbox_init_point,  // URL de testing
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

/**
 * Mapeo de estados de MP a los estados internos del sistema.
 * Documentación: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/payment-management/payment-statuses
 */
const ESTADO_PAGO_MAP: Record<
  EstadoPagoMP,
  { estadoPago: string; estadoPedido: string | null }
> = {
  approved:     { estadoPago: "APROBADO",    estadoPedido: "CONFIRMADO"       },
  pending:      { estadoPago: "PENDIENTE",   estadoPedido: null                },
  in_process:   { estadoPago: "EN_PROCESO",  estadoPedido: null                },
  rejected:     { estadoPago: "RECHAZADO",   estadoPedido: "CANCELADO"        },
  cancelled:    { estadoPago: "RECHAZADO",   estadoPedido: "CANCELADO"        },
  refunded:     { estadoPago: "REEMBOLSADO", estadoPedido: "REEMBOLSADO"      },
  charged_back: { estadoPago: "REEMBOLSADO", estadoPedido: "REEMBOLSADO"      },
};

export async function procesarPagoWebhook(paymentId: string) {
  // 1. Obtener datos actualizados del pago desde la API de MP
  const pago = await getPagoMP(paymentId);

  const estadoMP   = pago.status as EstadoPagoMP;
  const externalRef = pago.external_reference; // = numeroPedido

  if (!externalRef) {
    console.warn(`[MP Webhook] Pago ${paymentId} sin external_reference`);
    return { omitido: true };
  }

  const mapeo = ESTADO_PAGO_MAP[estadoMP];
  if (!mapeo) {
    console.warn(`[MP Webhook] Estado desconocido: ${estadoMP}`);
    return { omitido: true };
  }

  // 2. Buscar el pedido por numeroPedido (= external_reference)
  const pedido = await prisma.pedido.findUnique({
    where: { numeroPedido: externalRef },
    select: {
      id:         true,
      estadoPago: true,
      estado:     true,
    },
  });

  if (!pedido) {
    console.error(`[MP Webhook] Pedido no encontrado: ${externalRef}`);
    return { error: "pedido_no_encontrado" };
  }

  // 3. Actualizar en una transacción atómica
  await prisma.$transaction(async (tx) => {
    await tx.pedido.update({
      where: { id: pedido.id },
      data: {
        estadoPago:   mapeo.estadoPago as any,
        pagoExternoId: String(pago.id),
        pagoFecha:    estadoMP === "approved" ? new Date() : undefined,
        // Solo actualizar el estado del pedido si hay un cambio mapeado
        ...(mapeo.estadoPedido ? { estado: mapeo.estadoPedido as any } : {}),
      },
    });

    // Registrar en el historial si el estado del pedido cambió
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
