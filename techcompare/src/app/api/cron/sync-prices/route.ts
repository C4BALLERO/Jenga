import { json } from "@/lib/api/response";
import { getProviderManager } from "@/lib/providers/provider-manager";
import { isCronRequest, unauthorized } from "@/lib/security/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/sync-prices
 *
 * Actualización frecuente de precios y disponibilidad. Solo se consulta a los
 * proveedores cuyo intervalo configurado ya ha vencido, para no gastar cuota de
 * API en peticiones innecesarias.
 */
export async function GET(request: Request) {
  if (!isCronRequest(request)) return unauthorized("Cron no autorizado");

  const manager = getProviderManager();
  const now = Date.now();
  const results: { provider: string; status: string; prices: number; message?: string }[] = [];

  for (const provider of manager.active()) {
    const descriptor = provider.descriptor;
    if (!descriptor.capabilities.prices) continue;

    const health = (await manager.status()).find((entry) => entry.providerId === descriptor.id);
    const lastSync = health?.lastSync ? new Date(health.lastSync).getTime() : 0;
    const dueAt = lastSync + descriptor.schedule.priceMinutes * 60_000;

    if (lastSync > 0 && now < dueAt) {
      results.push({ provider: descriptor.id, status: "skipped", prices: 0, message: "Aún no vence su intervalo" });
      continue;
    }

    try {
      const page = await provider.getProducts({ limit: 50 });
      const ids = page.items.map((item) => item.externalId);
      const prices = await provider.getPrices(ids);
      results.push({ provider: descriptor.id, status: "ok", prices: prices.length });
    } catch (error) {
      // Un fallo de precios nunca invalida los datos ya almacenados.
      results.push({
        provider: descriptor.id,
        status: "error",
        prices: 0,
        message: (error as Error).message,
      });
    }
  }

  return json({ results, checkedAt: new Date().toISOString() });
}
