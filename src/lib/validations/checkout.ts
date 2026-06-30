import { z } from "zod";

// ─── Esquema base del checkout ────────────────────────────────────────────────

export const schemaCheckout = z
  .object({
    // Datos personales
    clienteNombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(150, "El nombre es demasiado largo")
      .trim(),

    clienteEmail: z
      .string()
      .email("Ingresá un email válido")
      .max(254, "El email es demasiado largo")
      .toLowerCase()
      .trim(),

    clienteTelefono: z
      .string()
      .min(8, "El teléfono debe tener al menos 8 caracteres")
      .max(30, "El teléfono es demasiado largo")
      .regex(/^[\d\s\+\-\(\)]+$/, "El teléfono solo puede contener números")
      .trim(),

    clienteDni: z
      .string()
      .max(20, "DNI demasiado largo")
      .trim()
      .optional()
      .or(z.literal("")),

    // Tipo de envío
    envioTipo: z.enum(
      ["RETIRO_LOCAL", "ENVIO_DOMICILIO", "CORREO_ARGENTINO", "ANDREANI", "OTRO"],
      { errorMap: () => ({ message: "Seleccioná un tipo de envío" }) }
    ),

    // Dirección (solo requerida si no es retiro en local)
    envioCalle: z.string().max(200).trim().optional().or(z.literal("")),
    envioNumero: z.string().max(20).trim().optional().or(z.literal("")),
    envioPiso: z.string().max(20).trim().optional().or(z.literal("")),
    envioLocalidad: z.string().max(100).trim().optional().or(z.literal("")),
    envioProvincia: z.string().max(100).trim().optional().or(z.literal("")),
    envioCodigoPostal: z
      .string()
      .max(10)
      .trim()
      .optional()
      .or(z.literal("")),
    envioReferencia: z.string().max(500).trim().optional().or(z.literal("")),

    // Método de pago
    metodoPago: z.enum(
      ["EFECTIVO", "TRANSFERENCIA", "TARJETA_DEBITO", "TARJETA_CREDITO"],
      { errorMap: () => ({ message: "Seleccioná un método de pago" }) }
    ),

    // Nota opcional
    notaCliente: z.string().max(500).trim().optional().or(z.literal("")),
  })
  // Validación cruzada: si no es retiro local, la dirección es obligatoria
  .superRefine((data, ctx) => {
    if (data.envioTipo !== "RETIRO_LOCAL") {
      if (!data.envioCalle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá la calle",
          path: ["envioCalle"],
        });
      }
      if (!data.envioNumero) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá el número",
          path: ["envioNumero"],
        });
      }
      if (!data.envioLocalidad) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá la localidad",
          path: ["envioLocalidad"],
        });
      }
      if (!data.envioProvincia) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingresá la provincia",
          path: ["envioProvincia"],
        });
      }
    }
  });

export type DatosCheckout = z.infer<typeof schemaCheckout>;

// ─── Tipos de error para el formulario ───────────────────────────────────────

export type ErroresFormulario = Partial<Record<keyof DatosCheckout, string>>;
