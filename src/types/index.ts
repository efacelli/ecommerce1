// ─── Tipos base (reflejan el schema Prisma) ──────────────────────────────────

export type Categoria = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activa: boolean;
  orden: number;
  parentId: number | null;
};

export type Producto = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  precio: number;
  precioAnterior: number | null;
  imagenes: string[];
  activo: boolean;
  destacado: boolean;
  categoriaId: number;
  creadoEn: Date;
};

export type Variante = {
  id: number;
  sku: string;
  talle: string;
  color: string | null;
  stock: number;
  activa: boolean;
  productoId: number;
};

export type Etiqueta = {
  id: number;
  nombre: string;
  slug: string;
  color: string;
};

// ─── Tipos compuestos (con relaciones) ──────────────────────────────────────

export type ProductoConCategoria = Producto & {
  categoria: Categoria;
};

export type ProductoCompleto = Producto & {
  categoria: Categoria;
  variantes: Variante[];
  etiquetas: Array<{ etiqueta: Etiqueta }>;
};

export type CategoriaConHijas = Categoria & {
  hijas: Categoria[];
};

// ─── Carrito (estado cliente, sin BD) ────────────────────────────────────────

export type ItemCarrito = {
  productoId: number;
  varianteId: number;
  nombre: string;
  slug: string;
  imagen: string;
  talle: string;
  color: string | null;
  precio: number;
  cantidad: number;
  sku: string;
};

export type Carrito = {
  items: ItemCarrito[];
};

// ─── Filtros del catálogo ────────────────────────────────────────────────────

export type FiltrosCatalogo = {
  categoriaSlug?: string;
  busqueda?: string;
  orden?: "reciente" | "precio-asc" | "precio-desc" | "destacado";
  pagina?: number;
};

// ─── Respuestas de servicios ─────────────────────────────────────────────────

export type ResultadoPaginado<T> = {
  items: T[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
};
