import { guard, json } from "@/lib/api/response";
import { getProviderManager } from "@/lib/providers/provider-manager";

export const dynamic = "force-dynamic";

/**
 * GET /api/providers/status
 *
 * Estado operativo de cada fuente de datos. Público a propósito: no expone
 * credenciales, solo si la integración está conectada y cuándo se sincronizó.
 */
export async function GET(request: Request) {
  const { blocked, headers } = guard(request, "providers", 30);
  if (blocked) return blocked;

  const manager = getProviderManager();
  const [status, descriptors] = [await manager.status(), manager.descriptors()];
  const byId = new Map(descriptors.map((descriptor) => [descriptor.id, descriptor]));

  return json(
    {
      providers: status.map((entry) => {
        const descriptor = byId.get(entry.providerId);
        return {
          id: entry.providerId,
          name: descriptor?.name ?? entry.providerId,
          kind: descriptor?.kind,
          categories: descriptor?.categories ?? [],
          countries: descriptor?.countries ?? [],
          status: entry.status,
          configured: entry.configured,
          lastSync: entry.lastSync ?? null,
          lastSuccess: entry.lastSuccess ?? null,
          productCount: entry.productCount,
          errorCount: entry.errorCount,
          consecutiveFailures: entry.consecutiveFailures,
          message: entry.message ?? null,
          requiredEnv: descriptor?.requiredEnv ?? [],
          complianceNote: descriptor?.complianceNote ?? null,
          docsUrl: descriptor?.docsUrl ?? null,
        };
      }),
      generatedAt: new Date().toISOString(),
    },
    { headers },
  );
}
