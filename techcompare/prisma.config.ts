import { defineConfig } from "prisma/config";

/**
 * Configuración del CLI de Prisma (Prisma 7).
 *
 * La URL de conexión ya no vive en `schema.prisma`: se pasa aquí para los
 * comandos de migración e introspección, y al cliente mediante un adaptador.
 * El valor de reserva solo sirve para que `prisma generate` funcione en
 * entornos sin base de datos (por ejemplo, el build de CI).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/techcompare",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
