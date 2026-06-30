import type { Metadata } from "next";
import Link from "next/link";
import { getMetricasDashboard } from "@/services/admin.dashboard.service";
import { getStockBajo } from "@/services/admin.producto.service";
import { getPedidosAdmin } from "@/services/admin.pedido.service";
import { StatCard } from "@/components/admin/ui/StatCard";
import { AdminTable, Tr, Td } from "@/components/admin/ui/AdminTable";
import { BadgeEstadoPedido, BadgeEstadoPago } from "@/components/admin/ui/AdminBadge";
import { formatearPrecio } from "@/lib/utils";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Dashboard" };

export const revalidate = 60; // revalidar cada minuto

export default async function DashboardPage() {
  const [metricas, stockBajo, pedidosRecientes] = await Promise.all([
    getMetricasDashboard(),
    getStockBajo(),
    getPedidosAdmin({ pagina: 1 }),
  ]);

  return (
    <div className={styles.pagina}>

      {/* ── KPIs ────────────────────────────────────── */}
      <div className={styles.kpis}>
        <StatCard
          titulo="Ventas del mes"
          valor={formatearPrecio(metricas.ventasMes)}
          subtexto="Pedidos confirmados"
          variante="primary"
          icono="💰"
        />
        <StatCard
          titulo="Pedidos hoy"
          valor={metricas.pedidosHoy}
          subtexto={`${metricas.pedidosTotales} totales`}
          variante="success"
          icono="📦"
        />
        <StatCard
          titulo="Pendientes de atención"
          valor={metricas.pedidosPendientes}
          subtexto="Requieren confirmación"
          variante={metricas.pedidosPendientes > 0 ? "warning" : "default"}
          icono="⏳"
        />
        <StatCard
          titulo="Stock bajo"
          valor={metricas.productosConStockBajo}
          subtexto={`de ${metricas.productosTotales} productos activos`}
          variante={metricas.productosConStockBajo > 0 ? "error" : "default"}
          icono="⚠️"
        />
      </div>

      <div className={styles.grid}>

        {/* ── Pedidos recientes ───────────────────────── */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>Pedidos recientes</h2>
            <Link href="/admin/pedidos" className={styles.verTodos}>
              Ver todos →
            </Link>
          </div>

          <AdminTable
            headers={["N°", "Cliente", "Total", "Estado", "Pago"]}
            sinFilas={pedidosRecientes.items.length === 0}
            vacio="No hay pedidos todavía"
          >
            {pedidosRecientes.items.slice(0, 8).map((p) => (
              <Tr
                key={p.id}
                onClick={() =>
                  (window.location.href = `/admin/pedidos/${p.id}`)
                }
              >
                <Td mono>{p.numeroPedido}</Td>
                <Td>
                  <div>
                    <p style={{ fontWeight: 500 }}>{p.clienteNombre}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--a-text-muted)" }}>
                      {p.clienteEmail}
                    </p>
                  </div>
                </Td>
                <Td mono>{formatearPrecio(p.total)}</Td>
                <Td><BadgeEstadoPedido estado={p.estado} /></Td>
                <Td><BadgeEstadoPago estado={p.estadoPago} /></Td>
              </Tr>
            ))}
          </AdminTable>
        </section>

        {/* ── Panel lateral ───────────────────────────── */}
        <div className={styles.lateral}>

          {/* Stock bajo */}
          {stockBajo.length > 0 && (
            <section className={styles.seccion}>
              <div className={styles.seccionHeader}>
                <h2 className={styles.seccionTitulo}>⚠️ Stock bajo</h2>
                <Link href="/admin/productos?stockBajo=true" className={styles.verTodos}>
                  Ver todos →
                </Link>
              </div>

              <div className={styles.stockLista}>
                {stockBajo.map((p) => {
                  const variantesCriticas = p.variantes.filter(
                    (v) => v.stock <= 5 && v.activa
                  );
                  return (
                    <Link
                      key={p.id}
                      href={`/admin/productos/${p.id}/stock`}
                      className={styles.stockItem}
                    >
                      <div>
                        <p className={styles.stockNombre}>{p.nombre}</p>
                        <p className={styles.stockVariantes}>
                          {variantesCriticas
                            .map(
                              (v) =>
                                `${v.talle}${v.color ? ` ${v.color}` : ""}: ${v.stock}`
                            )
                            .join(" · ")}
                        </p>
                      </div>
                      <span className={styles.stockEditar}>Gestionar →</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Ventas por estado */}
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo} style={{ marginBottom: "var(--a-space-4)" }}>
              Pedidos por estado
            </h2>
            <div className={styles.estadosLista}>
              {metricas.ventasPorEstado
                .sort((a, b) => b.cantidad - a.cantidad)
                .map((v) => (
                  <div key={v.estado} className={styles.estadoFila}>
                    <BadgeEstadoPedido estado={v.estado} />
                    <span className={styles.estadoCantidad}>{v.cantidad}</span>
                  </div>
                ))}
            </div>
          </section>

          {/* Top productos */}
          {metricas.topProductos.length > 0 && (
            <section className={styles.seccion}>
              <h2 className={styles.seccionTitulo} style={{ marginBottom: "var(--a-space-4)" }}>
                Top productos vendidos
              </h2>
              <div className={styles.topLista}>
                {metricas.topProductos.map((p, i) => (
                  <div key={p.nombre} className={styles.topItem}>
                    <span className={styles.topNum}>{i + 1}</span>
                    <div className={styles.topInfo}>
                      <p className={styles.topNombre}>{p.nombre}</p>
                      <p className={styles.topDato}>
                        {p.totalVendido} unidades ·{" "}
                        {formatearPrecio(p.ingresoTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
