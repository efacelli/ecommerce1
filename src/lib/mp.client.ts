import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Validar que las variables de entorno existen al inicializar
const accessToken = process.env.MP_ACCESS_TOKEN;
if (!accessToken) {
  throw new Error("MP_ACCESS_TOKEN no está configurado en las variables de entorno");
}

// Singleton del cliente — se reutiliza entre llamadas en el mismo proceso
export const mpClient = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 10_000,
    // idempotencyKey se puede pasar por request para reintentos seguros
  },
});

// Instancias de los recursos que vamos a usar
export const mpPreference = new Preference(mpClient);
export const mpPayment    = new Payment(mpClient);
