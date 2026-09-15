import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hasDatabase, isProduction, serverEnv } from "./env";

/**
 * Cliente Prisma con instancia única.
 *
 * Prisma 7 se conecta mediante un adaptador de driver, de ahí `@prisma/adapter-pg`.
 * La aplicación funciona sin base de datos: los repositorios recurren al
 * catálogo inicial cuando `DATABASE_URL` no está definida, por lo que el cliente
 * se crea de forma perezosa y `getPrisma()` puede devolver `null`.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient | null {
  if (!hasDatabase) return null;

  if (!globalForPrisma.prisma) {
    const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: isProduction ? ["error"] : ["error", "warn"],
    });
  }

  return globalForPrisma.prisma;
}

/** Comprueba que la base de datos responde. Se usa en el panel de administración. */
export async function databaseHealth(): Promise<{ ok: boolean; message: string }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false, message: "DATABASE_URL no configurada; se usa el catálogo inicial." };

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: "Conexión correcta." };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}

export { hasDatabase };
