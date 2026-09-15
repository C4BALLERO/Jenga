import { z } from "zod";

/**
 * Validación de variables de entorno. Nada de secretos en el código: todo lo
 * sensible llega por `process.env` y se valida aquí una sola vez.
 *
 * El esquema es deliberadamente permisivo: la aplicación debe arrancar y
 * funcionar con el catálogo de demostración aunque no haya base de datos ni
 * proveedores configurados.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  ADMIN_TOKEN: z.string().min(16).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  EXCHANGE_RATE_USD_BOB: z.coerce.number().positive().optional(),
  EXCHANGE_RATE_EUR_BOB: z.coerce.number().positive().optional(),
  EXCHANGE_RATE_API_URL: z.string().url().optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_ADS_ENABLED: z.enum(["true", "false"]).default("false"),
});

function parseServer() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    // Nunca se imprimen valores, solo los nombres de las claves inválidas.
    const keys = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
    throw new Error(`Variables de entorno inválidas: ${keys}`);
  }
  return parsed.data;
}

export const serverEnv = parseServer();

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_ADSENSE_CLIENT_ID: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
  NEXT_PUBLIC_ADS_ENABLED: process.env.NEXT_PUBLIC_ADS_ENABLED,
});

export const hasDatabase = Boolean(serverEnv.DATABASE_URL);
export const isProduction = serverEnv.NODE_ENV === "production";
