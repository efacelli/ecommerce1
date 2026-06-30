"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCarrito } from "@/context/CarritoContext";
import { crearPedidoAction } from "@/actions/pedido.actions";
import { FormField } from "./FormField";
import { SelectField } from "./SelectField";
import { RadioGroup } from "./RadioGroup";
import { OrderSummary } from "./OrderSummary";
import { Button } from "@/components/ui/Button";
import { formatearPrecio } from "@/lib/utils";
import styles from "./CheckoutForm.module.css";

const OPCIONES_ENVIO = [
  {
    valor: "RETIRO_LOCAL",
    label: "Retiro en local",
    descripcion: "Lunes a sábado de 9 a 20 hs · Gratis",
    icono: "🏪",
  },
  {
    valor: "CORREO_ARGENTINO",
    label: "Correo Argentino",
    descripcion: "5 a 10 días hábiles · $3.200",
    icono: "📮",
  },
  {
    valor: "ANDREANI",
    label: "Andreani",
    descripcion: "3 a 7 días hábiles · $3.800",
    icono: "📦",
  },
  {
    valor: "ENVIO_DOMICILIO",
    label: "Envío a domicilio",
    descripcion: "Coordinar por WhatsApp · $2.500",
    icono: "🛵",
  },
];

const OPCIONES_PAGO = [
  {
    valor: "EFECTIVO",
    label: "Efectivo",
    descripcion: "Al retirar en local o al recibir el envío",
    icono: "💵",
  },
  {
    valor: "TRANSFERENCIA",
    label: "Transferencia bancaria",
    descripcion: "CBU / Alias — te mandamos los datos por email",
    icono: "🏦",
  },
  {
    valor: "TARJETA_DEBITO",
    label: "Tarjeta de débito",
    descripcion: "Solo en local físico",
    icono: "💳",
  },
  {
    valor: "TARJETA_CREDITO",
    label: "Tarjeta de crédito",
    descripcion: "Solo en local físico",
    icono: "💳",
  },
];

const PROVINCIAS = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
].map((p) => ({ valor: p, label: p }));

const ESTADO_INICIAL = { tipo: "idle" as const };

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, vaciarCarrito } = useCarrito();
  const [envioTipo, setEnvioTipo] = useState("RETIRO_LOCAL");
  const [metodoPago, setMetodoPago] = useState("TRANSFERENCIA");

  const [estado, accion, isPending] = useActionState(
    crearPedidoAction,
    ESTADO_INICIAL
  );

  // Redirigir a confirmación cuando el pedido se crea con éxito
  useEffect(() => {
    if (estado.tipo === "exito") {
      vaciarCarrito();
      router.push(`/checkout/confirmacion?pedido=${estado.numeroPedido}`);
    }
  }, [estado, router, vaciarCarrito]);

  // Costo de envío según selección
  const costoEnvio =
    envioTipo === "RETIRO_LOCAL"
      ? 0
      : envioTipo === "CORREO_ARGENTINO"
      ? 3200
      : envioTipo === "ANDREANI"
      ? 3800
      : 2500;

  const errores = estado.tipo === "error" ? estado.errores : {};
  const necesitaDireccion = envioTipo !== "RETIRO_LOCAL";

  if (items.length === 0) {
    return (
      <div className={styles.carritoVacio}>
        <p className={styles.carritoVacioTitulo}>Tu carrito está vacío</p>
        <p className={styles.carritoVacioTexto}>
          Agregá productos antes de continuar con el checkout.
        </p>
        <Button
          variante="secondary"
          onClick={() => router.push("/productos")}
        >
          Ver catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* ── Formulario ──────────────────────────────── */}
      <form action={accion} className={styles.formulario} noValidate>
        {/* Carrito serializado como campo oculto */}
        <input type="hidden" name="items" value={JSON.stringify(items)} />
        <input type="hidden" name="envioTipo" value={envioTipo} />
        <input type="hidden" name="metodoPago" value={metodoPago} />

        {/* Error general */}
        {estado.tipo === "error" && estado.mensajeGeneral && (
          <div className={styles.errorGeneral} role="alert">
            <span aria-hidden="true">⚠️</span>
            {estado.mensajeGeneral}
          </div>
        )}

        {/* ── Sección 1: Datos personales ─────────── */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionNumero}>1</span>
            <h2 className={styles.seccionTitulo}>Tus datos</h2>
          </div>

          <div className={styles.campos}>
            <FormField
              label="Nombre completo"
              name="clienteNombre"
              type="text"
              placeholder="Juan García"
              autoComplete="name"
              requerido
              error={errores.clienteNombre}
            />
            <FormField
              label="Email"
              name="clienteEmail"
              type="email"
              placeholder="juan@email.com"
              autoComplete="email"
              requerido
              error={errores.clienteEmail}
              ayuda="Te enviamos la confirmación del pedido a este email"
            />
            <FormField
              label="Teléfono / WhatsApp"
              name="clienteTelefono"
              type="tel"
              placeholder="+54 9 11 1234-5678"
              autoComplete="tel"
              requerido
              error={errores.clienteTelefono}
            />
            <FormField
              label="DNI"
              name="clienteDni"
              type="text"
              placeholder="12.345.678"
              error={errores.clienteDni}
            />
          </div>
        </section>

        {/* ── Sección 2: Entrega ──────────────────── */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionNumero}>2</span>
            <h2 className={styles.seccionTitulo}>Entrega</h2>
          </div>

          <RadioGroup
            label="Tipo de envío"
            name="envioTipo_display"
            opciones={OPCIONES_ENVIO}
            valorActual={envioTipo}
            onChange={setEnvioTipo}
            error={errores.envioTipo}
            requerido
          />

          {/* Campos de dirección — solo si no es retiro */}
          {necesitaDireccion && (
            <div className={styles.direccion}>
              <div className={styles.camposDoble}>
                <FormField
                  label="Calle"
                  name="envioCalle"
                  type="text"
                  placeholder="Av. Corrientes"
                  autoComplete="street-address"
                  requerido
                  error={errores.envioCalle}
                />
                <FormField
                  label="Número"
                  name="envioNumero"
                  type="text"
                  placeholder="1234"
                  requerido
                  error={errores.envioNumero}
                />
              </div>

              <FormField
                label="Piso / Depto"
                name="envioPiso"
                type="text"
                placeholder="3° B"
                error={errores.envioPiso}
              />

              <div className={styles.camposDoble}>
                <FormField
                  label="Localidad / Ciudad"
                  name="envioLocalidad"
                  type="text"
                  placeholder="Mar del Plata"
                  autoComplete="address-level2"
                  requerido
                  error={errores.envioLocalidad}
                />
                <FormField
                  label="Código Postal"
                  name="envioCodigoPostal"
                  type="text"
                  placeholder="7600"
                  autoComplete="postal-code"
                  error={errores.envioCodigoPostal}
                />
              </div>

              <SelectField
                label="Provincia"
                name="envioProvincia"
                opciones={PROVINCIAS}
                placeholder="Seleccioná tu provincia"
                requerido
                error={errores.envioProvincia}
              />

              <FormField
                label="Referencia"
                name="envioReferencia"
                type="text"
                placeholder="Entre calles, color del portón, etc."
                error={errores.envioReferencia}
              />
            </div>
          )}
        </section>

        {/* ── Sección 3: Pago ─────────────────────── */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionNumero}>3</span>
            <h2 className={styles.seccionTitulo}>Pago</h2>
          </div>

          <RadioGroup
            label="Método de pago"
            name="metodoPago_display"
            opciones={OPCIONES_PAGO}
            valorActual={metodoPago}
            onChange={setMetodoPago}
            error={errores.metodoPago}
            requerido
          />

          {metodoPago === "TRANSFERENCIA" && (
            <div className={styles.infoPago}>
              <p className={styles.infoPagoTitulo}>Datos para transferir</p>
              <div className={styles.infoPagoDatos}>
                <div className={styles.infoPagoFila}>
                  <span>Alias</span>
                  <strong>LA.TIENDA.ROPA</strong>
                </div>
                <div className={styles.infoPagoFila}>
                  <span>CBU</span>
                  <strong>0000003100012345678900</strong>
                </div>
                <div className={styles.infoPagoFila}>
                  <span>Titular</span>
                  <strong>La Tienda S.R.L.</strong>
                </div>
              </div>
              <p className={styles.infoPagoNota}>
                Una vez acreditada la transferencia, confirmamos tu pedido y preparamos tu envío.
              </p>
            </div>
          )}
        </section>

        {/* ── Sección 4: Nota opcional ─────────────── */}
        <section className={styles.seccion}>
          <div className={styles.seccionHeader}>
            <span className={styles.seccionNumero}>4</span>
            <h2 className={styles.seccionTitulo}>Nota para el pedido</h2>
            <span className={styles.seccionOpcional}>Opcional</span>
          </div>

          <FormField
            label="Nota"
            name="notaCliente"
            multilinea
            filas={3}
            placeholder="Instrucciones especiales, consultas, etc."
            error={errores.notaCliente}
          />
        </section>

        {/* ── Footer del formulario ────────────────── */}
        <div className={styles.footer}>
          <div className={styles.totalFinal}>
            <span className={styles.totalFinalLabel}>Total a pagar</span>
            <span className={styles.totalFinalValor}>
              {formatearPrecio(subtotal + costoEnvio)}
            </span>
          </div>

          <Button
            type="submit"
            fullWidth
            tamaño="lg"
            cargando={isPending}
            disabled={isPending}
          >
            {isPending ? "Procesando pedido…" : "Confirmar pedido"}
          </Button>

          <p className={styles.terminos}>
            Al confirmar el pedido aceptás nuestros{" "}
            <a href="/terminos" className={styles.link} target="_blank">
              términos y condiciones
            </a>
            .
          </p>
        </div>
      </form>

      {/* ── Resumen lateral ─────────────────────────── */}
      <aside className={styles.aside}>
        <OrderSummary
          items={items}
          subtotal={subtotal}
          costoEnvio={costoEnvio}
        />
      </aside>
    </div>
  );
}
