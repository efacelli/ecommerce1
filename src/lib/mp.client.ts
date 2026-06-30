import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Inicialización perezosa — el cliente se crea recién cuando se usa,
// no cuando el módulo se importa. Esto evita que "next build" falle
// si la variable de entorno todavía no está disponible en esa etapa.

let _client: MercadoPagoConfig | null = null;

function getClient(): MercadoPagoConfig {
  if (_client) return _client;

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN no está configurado en las variables de entorno");
  }

  _client = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 10_000 },
  });

  return _client;
}

// Proxies que crean las instancias reales solo en el primer uso
export const mpPreference = new Proxy({} as Preference, {
  get(_target, prop) {
    const instance = new Preference(getClient());
    // @ts-expect-error — acceso dinámico a método del SDK
    return instance[prop].bind(instance);
  },
});

export const mpPayment = new Proxy({} as Payment, {
  get(_target, prop) {
    const instance = new Payment(getClient());
    // @ts-expect-error — acceso dinámico a método del SDK
    return instance[prop].bind(instance);
  },
});