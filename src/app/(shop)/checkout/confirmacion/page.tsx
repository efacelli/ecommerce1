import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPedidoPorNumero } from "@/services/pedido.service";
import { formatearPrecio } from "@/lib/utils";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

const LABEL_ENVIO: Record<string, string> = {
  RETIRO_LOCAL:     "Retiro en local",
  CORREO_ARGENTINO: "Correo Argentino",
  ANDREANI:         "Andreani",
  ENVIO_DOMICILIO:  "Envío a domicilio",
  OTRO:             "Otro",
};

const LABEL_PAGO: Record<string, string> = {
  EFECTIVO:         "Efectivo",
  TRANSFERENCIA:    "Transferencia bancaria",
  TARJETA_DEBITO:   "Tarjeta de débito",
  TARJETA_CREDITO:  "Tarjeta de crédito",
  MERCADO_PAGO:     "Mercado Pago",
};

type Props = {
  searchParams: Promise<{ pedido?: string }>;
};

export default async function ConfirmacionPage({ searchParams }: Props) {
  const { pedido: numeroPedido } = await searchParams;

  if (!numeroPedido) notFound();

  const pedido = await getPedidoPorNumero(numeroPedido);
  if (!pedido) notFound();

  const esRetiro = pedido.envioTipo === "RETIRO_LOCAL";
  const esTransferencia = pedido.metodoPago === "TRANSFERENCIA";

  return (
    <div className={styles.pagina}>
      <div className="container">
        <div className={styles.inner}>

          {/* ── Encabezado ──────────────────────── */}
          <div className={styles.exito}>
            <div className={styles.exitoIcono} aria-hidden="true">✓</div>
            <h1 className={styles.exitoTitulo}>¡Pedido confirmado!</h1>
            <p className={styles.exitoSubtitulo}>
              Gracias, <strong>{pedido.clienteNombre.split(" ")[0]}</strong>.
              Recibimos tu pedido y ya estamos en ello.
            </p>
          </div>

          {/* ── Número de pedido ────────────────── */}
          <div className={styles.numeroPedido}>
            <p className={styles.numeroPedidoLabel}>Número de pedido</p>
            <p className={styles.numeroPedidoValor}>{pedido.numeroPedido}</p>
            <p className={styles.numeroPedidoNota}>
              Guardá este número para hacer seguimiento
            </p>
          </div>

          {/* ── Grid de info ────────────────────── */}
          <div className={styles.infoGrid}>

            {/* Ítems */}
            <div className={styles.card}>
              <h2 className={styles.cardTitulo}>Tu pedido</h2>
              <ul className={styles.items}>
                {pedido.detalles.map((d) => (
                  <li key={d.id} className={styles.item}>
                    {d.productoImagen && (
                      <div className={styles.itemImagen}>
                        <Image
                          src={d.productoImagen}
                          alt={d.productoNombre}
                          fill
                          sizes="56px"
                          className={styles.imagen}
                        />
                      </div>
                    )}
                    <div className={styles.itemInfo}>
                      <p className={styles.itemNombre}>{d.productoNombre}</p>
                      <p className={styles.itemVariante}>
                        {d.varianteTalle}
                        {d.varianteColor ? ` · ${d.varianteColor}` : ""}
                        {` · x${d.cantidad}`}
                      </p>
                    </div>
                    <p className={styles.itemPrecio}>
                      {formatearPrecio(Number(d.subtotal))}
                    </p>
                  </li>
                ))}
              </ul>

              <div className={styles.totales}>
                <div className={styles.totalLinea}>
                  <span>Subtotal</span>
                  <span>{formatearPrecio(Number(pedido.subtotal))}</span>
                </div>
                <div className={styles.totalLinea}>
                  <span>Envío</span>
                  <span>
                    {Number(pedido.costoEnvio) === 0
                      ? "Gratis"
                      : formatearPrecio(Number(pedido.costoEnvio))}
                  </span>
                </div>
                <div className={[styles.totalLinea, styles.totalFinal].join(" ")}>
                  <span>Total</span>
                  <strong>{formatearPrecio(Number(pedido.total))}</strong>
                </div>
              </div>
            </div>

            {/* Info lateral */}
            <div className={styles.lateral}>

              {/* Datos de contacto */}
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Contacto</h2>
                <div className={styles.datosFila}>
                  <span className={styles.datosLabel}>Email</span>
                  <span>{pedido.clienteEmail}</span>
                </div>
                <div className={styles.datosFila}>
                  <span className={styles.datosLabel}>Teléfono</span>
                  <span>{pedido.clienteTelefono}</span>
                </div>
              </div>

              {/* Entrega */}
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Entrega</h2>
                <div className={styles.datosFila}>
                  <span className={styles.datosLabel}>Modalidad</span>
                  <span>{LABEL_ENVIO[pedido.envioTipo] ?? pedido.envioTipo}</span>
                </div>
                {esRetiro ? (
                  <div className={styles.retiroInfo}>
                    <p className={styles.retiroTitulo}>📍 Local</p>
                    <p className={styles.retiroTexto}>
                      Av. Ejemplo 1234, Ciudad<br />
                      Lunes a sábado, 9 a 20 hs
                    </p>
                  </div>
                ) : (
                  <>
                    <div className={styles.datosFila}>
                      <span className={styles.datosLabel}>Dirección</span>
                      <span>
                        {pedido.envioCalle} {pedido.envioNumero}
                        {pedido.envioPiso ? `, ${pedido.envioPiso}` : ""}
                      </span>
                    </div>
                    {pedido.envioLocalidad && (
                      <div className={styles.datosFila}>
                        <span className={styles.datosLabel}>Localidad</span>
                        <span>
                          {pedido.envioLocalidad}, {pedido.envioProvincia}
                          {pedido.envioCodigoPostal
                            ? ` (${pedido.envioCodigoPostal})`
                            : ""}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Pago */}
              <div className={styles.card}>
                <h2 className={styles.cardTitulo}>Pago</h2>
                <div className={styles.datosFila}>
                  <span className={styles.datosLabel}>Método</span>
                  <span>{LABEL_PAGO[pedido.metodoPago] ?? pedido.metodoPago}</span>
                </div>
                {esTransferencia && (
                  <div className={styles.pagoInfo}>
                    <p>
                      Transferí{" "}
                      <strong>{formatearPrecio(Number(pedido.total))}</strong> al
                      alias <strong>LA.TIENDA.ROPA</strong> y envianos el
                      comprobante por WhatsApp.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Próximos pasos ──────────────────── */}
          <div className={styles.proximosPasos}>
            <h2 className={styles.proximosTitulo}>¿Qué sigue?</h2>
            <ol className={styles.pasosList}>
              <li className={styles.pasoItem}>
                <span className={styles.pasoNum}>1</span>
                <div>
                  <p className={styles.pasoItemTitulo}>Confirmación por email</p>
                  <p className={styles.pasoItemTexto}>
                    Te mandamos un email a <strong>{pedido.clienteEmail}</strong> con
                    el resumen de tu pedido.
                  </p>
                </div>
              </li>
              {esTransferencia && (
                <li className={styles.pasoItem}>
                  <span className={styles.pasoNum}>2</span>
                  <div>
                    <p className={styles.pasoItemTitulo}>Envianos el comprobante</p>
                    <p className={styles.pasoItemTexto}>
                      Mandanos el comprobante de transferencia por WhatsApp para
                      confirmar el pago.
                    </p>
                  </div>
                </li>
              )}
              <li className={styles.pasoItem}>
                <span className={styles.pasoNum}>{esTransferencia ? "3" : "2"}</span>
                <div>
                  <p className={styles.pasoItemTitulo}>
                    {esRetiro ? "Avisamos cuando esté listo" : "Preparamos tu envío"}
                  </p>
                  <p className={styles.pasoItemTexto}>
                    {esRetiro
                      ? "Te avisamos por WhatsApp cuando tu pedido esté listo para retirar."
                      : "Preparamos tu pedido y te mandamos el número de seguimiento."}
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* ── Acciones ────────────────────────── */}
          <div className={styles.acciones}>
            <a
              href={`https://wa.me/5491100000000?text=${encodeURIComponent(
                `Hola, quiero consultar sobre mi pedido ${pedido.numeroPedido}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnWhatsapp}
            >
              💬 Consultar por WhatsApp
            </a>
            <Link href="/productos" className={styles.btnSeguir}>
              Seguir comprando
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
