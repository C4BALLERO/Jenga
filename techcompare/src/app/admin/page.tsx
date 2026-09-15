import { Database, PackageSearch, Server } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { databaseHealth } from "@/lib/db";
import { getCatalogCounts } from "@/lib/repositories/catalog.repository";
import { getProviderManager } from "@/lib/providers/provider-manager";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [counts, providers, database] = await Promise.all([
    getCatalogCounts(),
    getProviderManager().status(),
    databaseHealth(),
  ]);

  const connected = providers.filter((provider) => provider.status === "connected").length;
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
            <PackageSearch className="size-4" aria-hidden />
            Productos en catálogo
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{total}</p>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            {counts.phone} celulares · {counts.laptop} laptops · {counts.cpu} CPUs · {counts.gpu} GPUs
          </p>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
            <Server className="size-4" aria-hidden />
            Proveedores conectados
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {connected}
            <span className="text-base font-normal text-[var(--ink-muted)]">/{providers.length}</span>
          </p>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            El resto está registrado y a la espera de credenciales o de un feed autorizado.
          </p>
        </Card>

        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm text-[var(--ink-muted)]">
            <Database className="size-4" aria-hidden />
            Base de datos
          </p>
          <p className="mt-2">
            <Badge variant={database.ok ? "success" : "warning"}>
              {database.ok ? "Conectada" : "No configurada"}
            </Badge>
          </p>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">{database.message}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-base font-semibold">Estado del proyecto</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
          <li>
            El catálogo se sirve desde los datos iniciales del repositorio, marcados con confianza
            <Badge className="mx-1" variant="warning">demo</Badge>
            mientras no haya proveedores reales conectados.
          </li>
          <li>
            La gestión de productos (alta, edición, borrado y precios) requiere base de datos: el
            esquema ya existe en <code>prisma/schema.prisma</code>.
          </li>
          <li>
            Las sincronizaciones automáticas se disparan desde <code>/api/cron/sync-catalog</code> y
            <code> /api/cron/sync-prices</code>, protegidas con <code>CRON_SECRET</code>.
          </li>
        </ul>
      </Card>
    </div>
  );
}
