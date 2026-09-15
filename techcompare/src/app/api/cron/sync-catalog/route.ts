import { json } from "@/lib/api/response";
import { getProviderManager } from "@/lib/providers/provider-manager";
import { isCronRequest, unauthorized } from "@/lib/security/auth";

export const dynamic = "force-dynamic";
/** Las funciones serverless tienen límite de tiempo: se procesa por lotes. */
export const maxDuration = 60;

/**
 * GET /api/cron/sync-catalog
 *
 * Sincronización diaria del catálogo, pensada para Vercel Cron.
 *
 * Diseño para serverless: cada llamada procesa como mucho `BATCH_SIZE`
 * proveedores y devuelve el cursor del siguiente lote, de modo que ninguna
 * ejecución se acerca al límite de duración. Si un proveedor falla, NO se
 * borran sus productos: se registra el error y se conserva el último catálogo
 * válido.
 */
const BATCH_SIZE = 4;

export async function GET(request: Request) {
  if (!isCronRequest(request)) return unauthorized("Cron no autorizado");

  const url = new URL(request.url);
  const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);

  const manager = getProviderManager();
  const providers = manager.active();
  const batch = providers.slice(offset, offset + BATCH_SIZE);

  const logs = [];
  for (const provider of batch) {
    const { log } = await manager.sync(provider.descriptor.id);
    logs.push(log);
  }

  const nextOffset = offset + BATCH_SIZE;
  const done = nextOffset >= providers.length;

  return json({
    processed: batch.map((provider) => provider.descriptor.id),
    logs,
    done,
    nextOffset: done ? null : nextOffset,
    totalProviders: providers.length,
  });
}
