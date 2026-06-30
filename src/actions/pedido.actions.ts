"use server";

import { schemaCheckout } from "@/lib/validations/checkout";
import { crearPedido } from "@/services/pedido.service";
import type { ItemCarrito } from "@/types";
import type { ErroresFormulario } from "@/lib/validations/checkout";

// Estado extendido: ahora incluye numeroPedido para el flujo de Mercado Pago
type EstadoAccion =
  | { tipo: "idle" }
  | { tipo: "error"; errores: ErroresFormulario; mensajeGeneral?: string }
  | { tipo: "exito"; id: number; numeroPedido: string };

export async function crearPedidoAction(
  _estadoAnterior: EstadoAccion,
  formData: FormData
): Promise<EstadoAccion> {
  // 1. Extraer y validar items del carrito
  let items: ItemCarrito[] = [];
  try {
    const itemsRaw = formData.get("items");
    if (!itemsRaw || typeof itemsRaw !== "string") {
      return {
        tipo: "error",
        errores: {},
        mensajeGeneral: "El carrito está vacío. Agregá productos antes de continuar.",
      };
    }
    items = JSON.parse(itemsRaw);
    if (!Array.isArray(items) || items.length === 0) {
      return {
        tipo: "error",
        errores: {},
        mensajeGeneral: "El carrito está vacío. Agregá productos antes de continuar.",
      };
    }
  } catch {
    return {
      tipo: "error",
      errores: {},
      mensajeGeneral: "Error al leer el carrito. Intentá de nuevo.",
    };
  }

  // 2. Validar datos del formulario con Zod
  const datosRaw = {
    clienteNombre:      formData.get("clienteNombre"),
    clienteEmail:       formData.get("clienteEmail"),
    clienteTelefono:    formData.get("clienteTelefono"),
    clienteDni:         formData.get("clienteDni"),
    envioTipo:          formData.get("envioTipo"),
    envioCalle:         formData.get("envioCalle"),
    envioNumero:        formData.get("envioNumero"),
    envioPiso:          formData.get("envioPiso"),
    envioLocalidad:     formData.get("envioLocalidad"),
    envioProvincia:     formData.get("envioProvincia"),
    envioCodigoPostal:  formData.get("envioCodigoPostal"),
    envioReferencia:    formData.get("envioReferencia"),
    metodoPago:         formData.get("metodoPago"),
    notaCliente:        formData.get("notaCliente"),
  };

  const resultado = schemaCheckout.safeParse(datosRaw);

  if (!resultado.success) {
    const errores: ErroresFormulario = {};
    for (const issue of resultado.error.issues) {
      const campo = issue.path[0] as keyof ErroresFormulario;
      if (campo && !errores[campo]) errores[campo] = issue.message;
    }
    return { tipo: "error", errores };
  }

  // 3. Crear el pedido en la BD
  try {
    const pedido = await crearPedido({ datos: resultado.data, items });
    // Retornar tanto el id como el numeroPedido
    return { tipo: "exito", id: pedido.id, numeroPedido: pedido.numeroPedido };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : "Error al procesar el pedido";
    return { tipo: "error", errores: {}, mensajeGeneral: mensaje };
  }
}
