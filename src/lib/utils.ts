/**
 * Formatea un número como precio en pesos argentinos.
 * Ej: 9500 → "$9.500"
 */
export function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

/**
 * Calcula el porcentaje de descuento entre dos precios.
 * Ej: (12000, 9500) → 21
 */
export function calcularDescuento(
  precioOriginal: number,
  precioActual: number
): number {
  if (precioOriginal <= precioActual) return 0;
  return Math.round(((precioOriginal - precioActual) / precioOriginal) * 100);
}

/**
 * Convierte un texto a slug URL-friendly.
 * Ej: "Remera Básica" → "remera-basica"
 */
export function toSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Retorna la primera imagen de un producto o un placeholder.
 */
export function getImagenPrincipal(imagenes: string[]): string {
  return imagenes[0] ?? "/images/placeholder.png";
}

/**
 * Construye query string a partir de un objeto de parámetros,
 * omitiendo valores undefined/null/"".
 */
export function buildQueryString(
  params: Record<string, string | number | undefined | null>
): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

/**
 * Trunca un texto a un máximo de caracteres, agregando "…" al final.
 */
export function truncar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  return texto.slice(0, max).trimEnd() + "…";
}

/**
 * Genera un número de pedido con el formato ORD-AAAA-NNNNN.
 */
export function generarNumeroPedido(id: number): string {
  const año = new Date().getFullYear();
  const num = String(id).padStart(5, "0");
  return `ORD-${año}-${num}`;
}

/**
 * Calcula el total de ítems en el carrito.
 */
export function totalItemsCarrito(
  items: Array<{ cantidad: number }>
): number {
  return items.reduce((acc, item) => acc + item.cantidad, 0);
}

/**
 * Calcula el subtotal del carrito.
 */
export function subtotalCarrito(
  items: Array<{ precio: number; cantidad: number }>
): number {
  return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}
