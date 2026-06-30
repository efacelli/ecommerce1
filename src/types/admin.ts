// ─── Tipos admin derivados del schema Prisma ─────────────────────────────────

export type AdminProducto = {
  id: number;
  nombre: string;
  slug: string;
  precio: number;
  precioAnterior: number | null;
  activo: boolean;
  destacado: boolean;
  imagenes: string[];
  descripcion: string | null;
  categoriaId: number;
  categoria: { id: number; nombre: string; slug: string };
  variantes: AdminVariante[];
  creadoEn: Date;
  actualizadoEn: Date;
};

export type AdminVariante = {
  id: number;
  sku: string;
  talle: string;
  color: string | null;
  stock: number;
  activa: boolean;
  productoId: number;
};

export type AdminPedido = {
  id: number;
  numeroPedido: string;
  estado: EstadoPedido;
  estadoPago: EstadoPago;
  metodoPago: MetodoPago;
  envioTipo: TipoEnvio;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string | null;
  subtotal: number;
  costoEnvio: number;
  descuento: number;
  total: number;
  pagoExternoId: string | null;
  pagoFecha: Date | null;
  notas_internas: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type AdminPedidoCompleto = AdminPedido & {
  detalles: {
    id: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    productoNombre: string;
    varianteTalle: string;
    varianteColor: string | null;
    productoImagen: string | null;
    productoId: number | null;
    varianteId: number | null;
  }[];
  historial: {
    id: number;
    estado: EstadoPedido;
    nota: string | null;
    creadoEn: Date;
    admin: { nombre: string } | null;
  }[];
  notas: {
    id: number;
    mensaje: string;
    esPublica: boolean;
    creadoEn: Date;
    admin: { nombre: string } | null;
  }[];
};

// ─── Enums replicados (Prisma los genera, estos son para el cliente) ──────────

export type EstadoPedido =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREPARACION"
  | "LISTO_PARA_ENVIO"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO"
  | "REEMBOLSADO";

export type EstadoPago =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO"
  | "REEMBOLSADO"
  | "EN_PROCESO";

export type MetodoPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "MERCADO_PAGO"
  | "TARJETA_DEBITO"
  | "TARJETA_CREDITO";

export type TipoEnvio =
  | "RETIRO_LOCAL"
  | "ENVIO_DOMICILIO"
  | "CORREO_ARGENTINO"
  | "ANDREANI"
  | "OTRO";

// ─── Métricas del dashboard ───────────────────────────────────────────────────

export type MetricasDashboard = {
  ventasTotales: number;
  ventasMes: number;
  pedidosTotales: number;
  pedidosPendientes: number;
  pedidosHoy: number;
  productosTotales: number;
  productosConStockBajo: number;
  topProductos: {
    nombre: string;
    slug: string;
    totalVendido: number;
    ingresoTotal: number;
  }[];
  ventasPorEstado: { estado: EstadoPedido; cantidad: number; total: number }[];
};

// ─── Filtros ──────────────────────────────────────────────────────────────────

export type FiltrosPedidos = {
  estado?: EstadoPedido;
  busqueda?: string;
  pagina?: number;
  desde?: string;
  hasta?: string;
};

export type FiltrosProductosAdmin = {
  busqueda?: string;
  categoriaId?: number;
  activo?: boolean;
  stockBajo?: boolean;
  pagina?: number;
};

// ─── Formulario producto ──────────────────────────────────────────────────────

export type VarianteFormData = {
  id?: number;       // undefined = nueva variante
  sku: string;
  talle: string;
  color: string;
  stock: number;
  activa: boolean;
  _eliminar?: boolean;
};

export type ProductoFormData = {
  nombre: string;
  slug: string;
  descripcion: string;
  precio: string;
  precioAnterior: string;
  categoriaId: string;
  activo: boolean;
  destacado: boolean;
  imagenes: string[];
  variantes: VarianteFormData[];
};
