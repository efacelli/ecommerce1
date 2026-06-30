import type { Metadata } from "next";
import Link from "next/link";
import { getPedidosAdmin } from "@/services/admin.pedido.service";
import { AdminTable, Tr, Td } from "@/components/admin/ui/AdminTable";
import { BadgeEstadoPedido, BadgeEstadoPago } from "@/components/admin/ui/AdminBadge";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { PedidosFiltros } from "@/components/admin/PedidosFiltros";
import { formatearPrecio } from "@/lib/utils";
import type { EstadoPedido } from "@/types/admin";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Pedidos" };

type Props = {
  searchParams: Promise<{
    estado?: string;
    busqueda?: string;
    desde?: string;
    hasta?: string;
    pagina?: string;
  }>;
};

const LABEL_ENVIO: Record<string, string> = {
  RETIRO_LOCAL:     "Retiro",
  CORREO_ARGENTINO: "Correo Arg.",
  ANDREANI:         "Andreani",
  ENVIO_DOMICILIO:  "Domicilio",
  OTRO:             "Otro",
};

export default async function PedidosAdminPage({ searchParams }: Props) {
  const sp = await searchParams;

  const filtros = {
    estado:   sp.estado as EstadoPedido | undefined,
    busqueda: sp.busqueda,
    desde:    sp.desde,
    hasta:    sp.hasta,
    pagina:   sp.pagina ? Number(sp.pagina) : 1,
  };

  const resultado = await getPedidosAdmin(filtros);

  return (
    <div>
      <PageHeader
        titulo={`Pedidos (${resultado.total})`}
        subtitulo="Gestioná todos los pedidos de la tienda"
      />

      <PedidosFiltros />

      <AdminTable
        headers={["N° Pedido", "Fecha", "Cliente", "Envío", "Total", "Estado", "Pago"]}
        sinFilas={resultado.items.length === 0}
        vacio="No hay pedidos que coincidan con los filtros"
      >
        {resultado.items.map((p) => (
          <Tr
            key={p.id}
            onClick={() =>
              (window.location.href = `/admin/pedidos/${p.id}`)
            }
          >
            <Td mono>
              <Link
                href={`/admin/pedidos/${p.id}`}
                className={styles.linkPedido}
                onClick={(e) => e.stopPropagation()}
              >
                {p.numeroPedido}
              </Link>
            </Td>
            <Td muted>
              {new Date(p.creadoEn).toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
            </Td>
            <Td>
              <div>
                <p className={styles.clienteNombre}>{p.clienteNombre}</p>
                <p className={styles.clienteEmail}>{p.clienteEmail}</p>
              </div>
            </Td>
            <Td muted>{LABEL_ENVIO[p.envioTipo] ?? p.envioTipo}</Td>
            <Td mono>{formatearPrecio(p.total)}</Td>
            <Td><BadgeEstadoPedido estado={p.estado} /></Td>
            <Td><BadgeEstadoPago estado={p.estadoPago} /></Td>
          </Tr>
        ))}
      </AdminTable>

      {/* Paginación */}
      {resultado.totalPaginas > 1 && (
        <div className={styles.paginacion}>
          {resultado.pagina > 1 && (
            <Link
              href={`/admin/pedidos?pagina=${resultado.pagina - 1}${sp.estado ? `&estado=${sp.estado}` : ""}`}
              className={styles.pagBtn}
            >
              ← Anterior
            </Link>
          )}
          <span className={styles.pagInfo}>
            Página {resultado.pagina} de {resultado.totalPaginas}
          </span>
          {resultado.pagina < resultado.totalPaginas && (
            <Link
              href={`/admin/pedidos?pagina=${resultado.pagina + 1}${sp.estado ? `&estado=${sp.estado}` : ""}`}
              className={styles.pagBtn}
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
