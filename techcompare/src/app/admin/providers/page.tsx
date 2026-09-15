import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getProviderManager } from "@/lib/providers/provider-manager";
import { relativeTime } from "@/lib/utils";
import type { ProviderStatus } from "@/types/providers";

export const dynamic = "force-dynamic";

const STATUS: Record<ProviderStatus, { label: string; variant: BadgeVariant; dot: string }> = {
  connected: { label: "Conectado", variant: "success", dot: "🟢" },
  not_configured: { label: "Sin configurar", variant: "neutral", dot: "⚪" },
  disabled: { label: "Pausado", variant: "warning", dot: "🟡" },
  degraded: { label: "Degradado", variant: "warning", dot: "🟡" },
  error: { label: "Con errores", variant: "danger", dot: "🔴" },
};

export default async function ProvidersAdminPage() {
  const manager = getProviderManager();
  const [status, descriptors, logs] = [
    await manager.status(),
    manager.descriptors(),
    manager.logs(undefined, 10),
  ];

  const byId = new Map(descriptors.map((descriptor) => [descriptor.id, descriptor]));

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] p-5">
          <h2 className="text-base font-semibold">Proveedores de datos</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Cada fuente implementa el mismo contrato. Un proveedor sin credenciales no realiza
            ninguna petición: queda registrado y listo para conectar.
          </p>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-[var(--surface-2)]/60 text-left text-xs uppercase tracking-wide text-[var(--ink-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3">Proveedor</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3">Última sincronización</th>
                <th scope="col" className="px-4 py-3 text-right">Productos</th>
                <th scope="col" className="px-4 py-3 text-right">Nuevos</th>
                <th scope="col" className="px-4 py-3 text-right">Errores</th>
                <th scope="col" className="px-4 py-3 text-right">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {status.map((entry) => {
                const descriptor = byId.get(entry.providerId);
                const config = STATUS[entry.status];

                return (
                  <tr key={entry.providerId} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium">{descriptor?.name ?? entry.providerId}</p>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {descriptor?.kind} · {descriptor?.categories.join(", ")}
                      </p>
                      {descriptor?.complianceNote && (
                        <p className="mt-1 max-w-md text-xs text-[var(--ink-muted)]">
                          {descriptor.complianceNote}
                        </p>
                      )}
                      {descriptor?.requiredEnv.length ? (
                        <p className="mt-1 text-xs text-[var(--ink-muted)]">
                          Variables: <code>{descriptor.requiredEnv.join(", ")}</code>
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant}>
                        <span aria-hidden>{config.dot}</span> {config.label}
                      </Badge>
                      {entry.message && (
                        <p className="mt-1 max-w-xs text-xs text-[var(--ink-muted)]">{entry.message}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--ink-muted)]">
                      {entry.lastSync ? relativeTime(entry.lastSync) : "Nunca"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{entry.productCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{entry.productsCreated}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{entry.errorCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {entry.lastDurationMs ? `${entry.lastDurationMs} ms` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Últimas sincronizaciones</h2>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Todavía no se ha ejecutado ninguna sincronización en este proceso. Se disparan desde los
            cron jobs de <code>/api/cron/*</code>.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border-subtle)] text-sm">
            {logs.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span className="font-medium">{log.provider}</span>
                <span className="text-xs text-[var(--ink-muted)]">
                  {log.productsProcessed} procesados · {log.errors.length} errores ·{" "}
                  {log.durationMs ?? 0} ms
                </span>
                <Badge
                  variant={
                    log.status === "SUCCESS"
                      ? "success"
                      : log.status === "PARTIAL"
                        ? "warning"
                        : log.status === "FAILED"
                          ? "danger"
                          : "neutral"
                  }
                >
                  {log.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
