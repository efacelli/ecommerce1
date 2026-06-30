import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPedidoPorNumero } from "@/services/pedido.service";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Resultado del pago",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    estado?: string;
    pedido?: string;
    payment_id?: string;
    status?: string;
    merchant_order_id?: string;
  }>;
};

/**
 * Página de retorno de Mercado Pago.
 *
 * MP redirige aquí después del pago con los siguientes query params:
 * - collection_id: ID del pago
 * - collection_status: estado del pago
 * - payment_id: ID del pago (mismo que collection_id)
 * - status: approved | pending | rejected
 * - external_reference: tu numeroPedido
 * - payment_type: credit_card | debit_card | etc
 * - merchant_order_id: ID de la orden en MP
 *
 * IMPORTANTE: Esta página es solo UI. La lógica de actualización
 * del pedido la maneja el webhook en /api/mp-webhook.
 * No actualizar el estado del pedido aquí porque:
 * 1. El usuario podría manipular los query params
 * 2. El webhook es la fuente de verdad oficial de MP
 */
export default async function MpRetornoPage({ searchParams }: Props) {
  const sp = await searchParams;

  // MP puede enviar el estado en dos formatos distintos
  const estadoMp    = sp.estado ?? sp.status ?? "desconocido";
  const numeroPedido = sp.pedido ?? sp.merchant_order_id;

  // Si no hay número de pedido, redirigir al inicio
  if (!numeroPedido) redirect("/");

  // Cargar el pedido para mostrar información actualizada de la BD
  const pedido = await getPedidoPorNumero(numeroPedido);

  const esAprobado  = estadoMp === "aprobado"  || estadoMp === "approved";
  const esPendiente = estadoMp === "pendiente" || estadoMp === "pending" || estadoMp === "in_process";
  const esFallido   = estadoMp === "fallido"   || estadoMp === "rejected" || estadoMp === "cancelled";

  return (
    <div className={styles.pagina}>
      <div className={styles.inner}>

        {/* Ícono de estado */}
        <div
          className={[
            styles.icono,
            esAprobado  ? styles.iconoOk      : "",
            esPendiente ? styles.iconoPendiente : "",
            esFallido   ? styles.iconoError    : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          {esAprobado  ? "✓" : esPendiente ? "⏳" : "✕"}
        </div>

        {/* Título */}
        <h1 className={styles.titulo}>
          {esAprobado
            ? "¡Pago aprobado!"
            : esPendiente
            ? "Pago en proceso"
            : "El pago no se completó"}
        </h1>

        {/* Mensaje */}
        <p className={styles.mensaje}>
          {esAprobado && (
            <>
              Tu pago fue aprobado por Mercado Pago. Recibirás un email de
              confirmación en <strong>{pedido?.clienteEmail}</strong>.
            </>
          )}
          {esPendiente && (
            <>
              Tu pago está siendo procesado. Te avisamos por email cuando se
              confirme. Podés seguir tu pedido con el número{" "}
              <strong>{numeroPedido}</strong>.
            </>
          )}
          {esFallido && (
            <>
              El pago fue rechazado o cancelado. Podés intentarlo de nuevo o
              elegir otro método de pago.
            </>
          )}
        </p>

        {/* Número de pedido */}
        {pedido && (
          <div className={styles.pedidoBox}>
            <p className={styles.pedidoLabel}>Número de pedido</p>
            <p className={styles.pedidoNum}>{pedido.numeroPedido}</p>
          </div>
        )}

        {/* Nota sobre el webhook */}
        {esPendiente && (
          <div className={styles.nota}>
            <p>
              ⚠️ El estado del pedido se actualiza automáticamente cuando
              Mercado Pago confirme el pago. Esto puede tardar unos minutos.
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className={styles.acciones}>
          {(esAprobado || esPendiente) && pedido && (
            <Link
              href={`/checkout/confirmacion?pedido=${numeroPedido}`}
              className={styles.btnPrimario}
            >
              Ver detalle del pedido
            </Link>
          )}

          {esFallido && (
            <Link href="/carrito" className={styles.btnPrimario}>
              Volver al carrito
            </Link>
          )}

          <Link href="/productos" className={styles.btnSecundario}>
            Seguir comprando
          </Link>
        </div>

        {/* Contacto */}
        <p className={styles.ayuda}>
          ¿Tenés dudas?{" "}
          <a
            href={`https://wa.me/5491100000000?text=${encodeURIComponent(
              `Hola, quiero consultar sobre mi pedido ${numeroPedido}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkWa}
          >
            Escribinos por WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}
