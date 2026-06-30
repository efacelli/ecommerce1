import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPedidoAdminCompleto } from "@/services/admin.pedido.service";
import { BadgeEstadoPedido, BadgeEstadoPago } from "@/components/admin/ui/AdminBadge";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CambiarEstadoForm } from "@/components/admin/CambiarEstadoForm";
import { AgregarNotaForm } from "@/components/admin/AgregarNotaForm";
import { formatearPrecio } from "@/lib/utils";
import Link from "next/link";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getPedidoAdminCompleto(Number(id));
  return { title: p ? `Pedido ${p.numeroPedido}` : "Pedido no encontrado" };
}

const LABEL_ENVIO: Record<string, string> = {
  RETIRO_LOCAL:     "Retiro en local",
  CORREO_ARGENTINO: "Correo Argentino",
  ANDREANI:         "Andreani",
  ENVIO_DOMICILIO:  "Envío a domicilio",
  OTRO:             "Otro",
};

const LABEL_PAGO: Record<string, string> = {
  EFECTIVO:       "Efectivo",
  TRANSFERENCIA:  "Transferencia bancaria",
  MERCADO_PAGO:   "Mercado Pago",
  TARJETA_DEBITO: "Tarjeta de débito",
  TARJETA_CREDITO:"Tarjeta de crédito",
};

export default async function PedidoAdminPage({ params }: Props) {
  const { id } = await params;
  const pedido = await getPedidoAdminCompleto(Number(id));
  if (!pedido) notFound();

  const esRetiro = pedido.envioTipo === "RETIRO_LOCAL";

  return (
    <div>
      <PageHeader
        titulo={pedido.numeroPedido}
        subtitulo={`Creado el ${new Date(pedido.creadoEn).toLocaleDateString("es-AR", {
          day: "numeric", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}`}
        acciones={
          <Link href="/admin/pedidos" className={styles.btnVolver}>
            ← Volver a pedidos
          </Link>
        }
      />

      <div className={styles.layout}>
        {/* ── Columna principal ───────────────────── */}
        <div className={styles.colPrincipal}>

          {/* Ítems del pedido */}
          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>
              Productos ({pedido.detalles.length})
            </h2>

            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th className={styles.th}>Producto</th>
                  <th className={styles.th}>Variante</th>
                  <th className={styles.th}>Precio u.</th>
                  <th className={styles.th}>Cant.</th>
                  <th className={styles.th}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedido.detalles.map((d) => (
                  <tr key={d.id} className={styles.fila}>
                    <td className={styles.td}>
                      <div className={styles.productoCell}>
                        {d.productoImagen && (
                          <div className={styles.productoImg}>
                            <Image
                              src={d.productoImagen}
                              alt={d.productoNombre}
                              fill
                              sizes="40px"
                              className={styles.img}
                            />
                          </div>
                        )}
                        <span className={styles.productoNombre}>
                          {d.productoNombre}
                        </span>
                      </div>
                    </td>
                    <td className={styles.tdMuted}>
                      {d.varianteTalle}
                      {d.varianteColor ? ` · ${d.varianteColor}` : ""}
                    </td>
                    <td className={styles.tdMono}>
                      {formatearPrecio(d.precioUnitario)}
                    </td>
                    <td className={styles.tdCentro}>{d.cantidad}</td>
                    <td className={styles.tdMono}>
                      {formatearPrecio(d.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales */}
            <div className={styles.totales}>
              <div className={styles.totalFila}>
                <span>Subtotal</span>
                <span>{formatearPrecio(pedido.subtotal)}</span>
              </div>
              <div className={styles.totalFila}>
                <span>Envío</span>
                <span>
                  {pedido.costoEnvio === 0
                    ? "Gratis"
                    : formatearPrecio(pedido.costoEnvio)}
                </span>
              </div>
              {pedido.descuento > 0 && (
                <div className={styles.totalFila}>
                  <span>Descuento</span>
                  <span className={styles.descuento}>
                    − {formatearPrecio(pedido.descuento)}
                  </span>
                </div>
              )}
              <div className={[styles.totalFila, styles.totalFinal].join(" ")}>
                <span>Total</span>
                <strong>{formatearPrecio(pedido.total)}</strong>
              </div>
            </div>
          </section>

          {/* Historial de estados */}
          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Historial</h2>
            {pedido.historial.length === 0 ? (
              <p className={styles.sinDatos}>Sin historial</p>
            ) : (
              <ol className={styles.historial}>
                {pedido.historial.map((h) => (
                  <li key={h.id} className={styles.historialItem}>
                    <div className={styles.historialPunto} />
                    <div className={styles.historialContenido}>
                      <div className={styles.historialTop}>
                        <BadgeEstadoPedido estado={h.estado} />
                        <span className={styles.historialFecha}>
                          {new Date(h.creadoEn).toLocaleString("es-AR", {
                            day: "2-digit", month: "2-digit",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {h.admin && (
                          <span className={styles.historialAdmin}>
                            por {h.admin.nombre}
                          </span>
                        )}
                      </div>
                      {h.nota && (
                        <p className={styles.historialNota}>{h.nota}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Notas */}
          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Notas</h2>

            {pedido.notas.length > 0 && (
              <div className={styles.notas}>
                {pedido.notas.map((n) => (
                  <div
                    key={n.id}
                    className={[
                      styles.nota,
                      n.esPublica ? styles.notaPublica : styles.notaInterna,
                    ].join(" ")}
                  >
                    <div className={styles.notaHeader}>
                      <span className={styles.notaTipo}>
                        {n.esPublica ? "🌐 Pública" : "🔒 Interna"}
                      </span>
                      <span className={styles.notaFecha}>
                        {new Date(n.creadoEn).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                    <p className={styles.notaTexto}>{n.mensaje}</p>
                  </div>
                ))}
              </div>
            )}

            <AgregarNotaForm pedidoId={pedido.id} />
          </section>
        </div>

        {/* ── Sidebar ─────────────────────────────── */}
        <div className={styles.sidebar}>

          {/* Estado actual */}
          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Estado del pedido</h2>
            <div className={styles.estadoActual}>
              <BadgeEstadoPedido estado={pedido.estado} />
              <BadgeEstadoPago estado={pedido.estadoPago} />
            </div>
            <CambiarEstadoForm
              pedidoId={pedido.id}
              estadoActual={pedido.estado}
            />
          </section>

          {/* Datos del cliente */}
          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Cliente</h2>
            <div className={styles.datosList}>
              <div className={styles.dato}>
                <span className={styles.datoLabel}>Nombre</span>
                <span>{pedido.clienteNombre}</span>
              </div>
              <div className={styles.dato}>
                <span className={styles.datoLabel}>Email</span>
                <a href={`mailto:${pedido.clienteEmail}`} className={styles.datoLink}>
                  {pedido.clienteEmail}
                </a>
              </div>
              {pedido.clienteTelefono && (
                <div className={styles.dato}>
                  <span className={styles.datoLabel}>Teléfono</span>
                  <a
                    href={`https://wa.me/${pedido.clienteTelefono.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.datoLink}
                  >
                    {pedido.clienteTelefono}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Entrega */}
          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Entrega</h2>
            <div className={styles.datosList}>
              <div className={styles.dato}>
                <span className={styles.datoLabel}>Modalidad</span>
                <span>{LABEL_ENVIO[pedido.envioTipo] ?? pedido.envioTipo}</span>
              </div>
              {!esRetiro && pedido.envioCalle && (
                <>
                  <div className={styles.dato}>
                    <span className={styles.datoLabel}>Dirección</span>
                    <span>
                      {pedido.envioCalle} {pedido.envioNumero}
                      {pedido.envioPiso ? `, ${pedido.envioPiso}` : ""}
                    </span>
                  </div>
                  {pedido.envioLocalidad && (
                    <div className={styles.dato}>
                      <span className={styles.datoLabel}>Localidad</span>
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
              {pedido.envioReferencia && (
                <div className={styles.dato}>
                  <span className={styles.datoLabel}>Referencia</span>
                  <span className={styles.datoMuted}>{pedido.envioReferencia}</span>
                </div>
              )}
            </div>
          </section>

          {/* Pago */}
          <section className={styles.card}>
            <h2 className={styles.cardTitulo}>Pago</h2>
            <div className={styles.datosList}>
              <div className={styles.dato}>
                <span className={styles.datoLabel}>Método</span>
                <span>{LABEL_PAGO[pedido.metodoPago] ?? pedido.metodoPago}</span>
              </div>
              <div className={styles.dato}>
                <span className={styles.datoLabel}>Estado</span>
                <BadgeEstadoPago estado={pedido.estadoPago} />
              </div>
              {pedido.pagoExternoId && (
                <div className={styles.dato}>
                  <span className={styles.datoLabel}>ID externo</span>
                  <span className={styles.mono}>{pedido.pagoExternoId}</span>
                </div>
              )}
              {pedido.pagoFecha && (
                <div className={styles.dato}>
                  <span className={styles.datoLabel}>Fecha pago</span>
                  <span>
                    {new Date(pedido.pagoFecha).toLocaleDateString("es-AR")}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
