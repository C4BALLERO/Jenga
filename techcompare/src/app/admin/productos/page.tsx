import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/currency/format";
import { hasDatabase } from "@/lib/db";
import { getCategoryProducts } from "@/lib/repositories/catalog.repository";
import { paths } from "@/lib/seo/paths";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = (
    await Promise.all([
      getCategoryProducts("phone"),
      getCategoryProducts("laptop"),
      getCategoryProducts("cpu"),
      getCategoryProducts("gpu"),
    ])
  )
    .flat()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 40);

  return (
    <div className="space-y-6">
      {!hasDatabase && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <p className="font-semibold">Modo solo lectura</p>
          <p className="mt-1 text-[var(--ink-muted)]">
            Sin <code>DATABASE_URL</code> el catálogo procede de los datos iniciales del repositorio
            y no puede editarse desde aquí. Configura la base de datos y ejecuta
            <code className="mx-1">npx prisma migrate deploy</code> para habilitar la edición.
          </p>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-[var(--border-subtle)] p-5">
          <h2 className="text-base font-semibold">Productos ({products.length} de mayor demanda)</h2>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-[var(--surface-2)]/60 text-left text-xs uppercase tracking-wide text-[var(--ink-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3">Producto</th>
                <th scope="col" className="px-4 py-3">Categoría</th>
                <th scope="col" className="px-4 py-3 text-right">Precio</th>
                <th scope="col" className="px-4 py-3">Confianza</th>
                <th scope="col" className="px-4 py-3">Actualizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-2.5">
                    <Link
                      href={paths.product(product.category, product.slug)}
                      className="font-medium hover:text-brand-600 dark:hover:text-brand-300"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--ink-muted)]">{product.category}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {product.referencePrice > 0
                      ? formatMoney(product.referencePrice, product.referenceCurrency)
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={product.provenance.confidence === "demo" ? "warning" : "success"}>
                      {product.provenance.confidence}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[var(--ink-muted)]">
                    {relativeTime(product.provenance.lastUpdated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
