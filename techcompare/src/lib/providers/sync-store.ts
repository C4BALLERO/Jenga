import type { ProviderHealth, SyncLogEntry, SyncStatus } from "@/types/providers";

/**
 * Registro de sincronizaciones y salud de proveedores.
 *
 * En esta versión vive en memoria del proceso. Los modelos `SyncLog` y
 * `ProviderState` de Prisma ya existen: al configurar `DATABASE_URL` basta con
 * sustituir esta implementación por una que escriba en base de datos, sin tocar
 * a quien la consume.
 */

const logs = new Map<string, SyncLogEntry[]>();
const health = new Map<string, ProviderHealth>();

const MAX_LOGS_PER_PROVIDER = 50;
/** Tras este número de fallos seguidos se pausa el proveedor. */
export const FAILURE_THRESHOLD = 3;
/** Duración de la pausa automática. */
export const DISABLE_MINUTES = 60;

export function startSync(provider: string): SyncLogEntry {
  const entry: SyncLogEntry = {
    id: `${provider}-${Date.now()}`,
    provider,
    startTime: new Date().toISOString(),
    productsProcessed: 0,
    productsCreated: 0,
    productsUpdated: 0,
    productsDeleted: 0,
    errors: [],
    status: "RUNNING",
  };

  const existing = logs.get(provider) ?? [];
  logs.set(provider, [entry, ...existing].slice(0, MAX_LOGS_PER_PROVIDER));
  return entry;
}

export function finishSync(entry: SyncLogEntry, status: SyncStatus): SyncLogEntry {
  entry.endTime = new Date().toISOString();
  entry.status = status;
  entry.durationMs = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime();

  const current = health.get(entry.provider);
  const failed = status === "FAILED";
  const consecutiveFailures = failed ? (current?.consecutiveFailures ?? 0) + 1 : 0;

  health.set(entry.provider, {
    providerId: entry.provider,
    status: failed ? "error" : status === "PARTIAL" ? "degraded" : "connected",
    configured: current?.configured ?? true,
    lastSync: entry.endTime,
    lastSuccess: failed ? current?.lastSuccess : entry.endTime,
    productCount: status === "FAILED" ? (current?.productCount ?? 0) : entry.productsProcessed,
    productsUpdated: entry.productsUpdated,
    productsCreated: entry.productsCreated,
    errorCount: entry.errors.length,
    consecutiveFailures,
    disabledUntil:
      consecutiveFailures >= FAILURE_THRESHOLD
        ? new Date(Date.now() + DISABLE_MINUTES * 60_000).toISOString()
        : undefined,
    lastDurationMs: entry.durationMs,
    message: entry.errors[0],
  });

  return entry;
}

export function recordHealth(providerId: string, patch: Partial<ProviderHealth>): void {
  const current = health.get(providerId);
  health.set(providerId, {
    providerId,
    status: patch.status ?? current?.status ?? "not_configured",
    configured: patch.configured ?? current?.configured ?? false,
    lastSync: patch.lastSync ?? current?.lastSync,
    lastSuccess: patch.lastSuccess ?? current?.lastSuccess,
    productCount: patch.productCount ?? current?.productCount ?? 0,
    productsUpdated: patch.productsUpdated ?? current?.productsUpdated ?? 0,
    productsCreated: patch.productsCreated ?? current?.productsCreated ?? 0,
    errorCount: patch.errorCount ?? current?.errorCount ?? 0,
    consecutiveFailures: patch.consecutiveFailures ?? current?.consecutiveFailures ?? 0,
    disabledUntil: patch.disabledUntil ?? current?.disabledUntil,
    lastDurationMs: patch.lastDurationMs ?? current?.lastDurationMs,
    message: patch.message ?? current?.message,
  });
}

export function getHealth(providerId: string): ProviderHealth | undefined {
  return health.get(providerId);
}

export function getLogs(providerId?: string, limit = 20): SyncLogEntry[] {
  const entries = providerId
    ? (logs.get(providerId) ?? [])
    : [...logs.values()].flat().sort((a, b) => b.startTime.localeCompare(a.startTime));
  return entries.slice(0, limit);
}

/** ¿Está el proveedor pausado por fallos consecutivos? */
export function isTemporarilyDisabled(providerId: string): boolean {
  const entry = health.get(providerId);
  if (!entry?.disabledUntil) return false;
  return new Date(entry.disabledUntil).getTime() > Date.now();
}

export function clearSyncState(): void {
  logs.clear();
  health.clear();
}
