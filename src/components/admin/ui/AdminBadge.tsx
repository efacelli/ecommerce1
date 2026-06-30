import styles from "./AdminBadge.module.css";
import type { EstadoPedido, EstadoPago } from "@/types/admin";

type Variante = "default" | "success" | "warning" | "error" | "info" | "neutral";

type Props = {
  texto: string;
  variante?: Variante;
};

export function AdminBadge({ texto, variante = "default" }: Props) {
  return (
    <span className={[styles.badge, styles[variante]].join(" ")}>
      {texto}
    </span>
  );
}

// ─── Helpers para convertir enums a badges ────────────────────────────────────

const ESTADO_PEDIDO_CONFIG: Record<
  EstadoPedido,
  { label: string; variante: Variante }
> = {
  PENDIENTE:          { label: "Pendiente",           variante: "warning"  },
  CONFIRMADO:         { label: "Confirmado",           variante: "info"     },
  EN_PREPARACION:     { label: "En preparación",       variante: "info"     },
  LISTO_PARA_ENVIO:   { label: "Listo para envío",     variante: "success"  },
  EN_CAMINO:          { label: "En camino",             variante: "success"  },
  ENTREGADO:          { label: "Entregado",             variante: "success"  },
  CANCELADO:          { label: "Cancelado",             variante: "error"    },
  REEMBOLSADO:        { label: "Reembolsado",           variante: "neutral"  },
};

const ESTADO_PAGO_CONFIG: Record<
  EstadoPago,
  { label: string; variante: Variante }
> = {
  PENDIENTE:   { label: "Pago pendiente", variante: "warning" },
  APROBADO:    { label: "Pago aprobado",  variante: "success" },
  RECHAZADO:   { label: "Pago rechazado", variante: "error"   },
  REEMBOLSADO: { label: "Reembolsado",    variante: "neutral" },
  EN_PROCESO:  { label: "En proceso",     variante: "info"    },
};

export function BadgeEstadoPedido({ estado }: { estado: EstadoPedido }) {
  const cfg = ESTADO_PEDIDO_CONFIG[estado] ?? {
    label: estado,
    variante: "neutral" as Variante,
  };
  return <AdminBadge texto={cfg.label} variante={cfg.variante} />;
}

export function BadgeEstadoPago({ estado }: { estado: EstadoPago }) {
  const cfg = ESTADO_PAGO_CONFIG[estado] ?? {
    label: estado,
    variante: "neutral" as Variante,
  };
  return <AdminBadge texto={cfg.label} variante={cfg.variante} />;
}
