import { Check } from "lucide-react";
import Link from "next/link";
import { paths } from "@/lib/seo/paths";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product/ProductImage";
import type { SpecGroup } from "@/types/common";
import type { AnyProduct } from "@/types/products";

/**
 * Tabla comparativa.
 *
 * En móvil se desplaza horizontalmente con la primera columna fija, que es la
 * única forma de que una tabla de tres columnas siga siendo legible en 360 px.
 */
export function CompareTable({
  products,
  groups,
  winnerIndex,
}: {
  products: AnyProduct[];
  groups: SpecGroup[];
  winnerIndex?: number;
}) {
  const columns: ("a" | "b" | "c")[] = ["a", "b", "c"];

  return (
    <div className="relative overflow-x-auto no-scrollbar">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">
          Comparación de {products.map((product) => product.name).join(", ")}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-10 w-40 bg-[var(--surface)] p-3 text-left">
              <span className="sr-only">Característica</span>
            </th>
            {products.map((product, index) => (
              <th key={product.id} scope="col" className="p-3 align-top">
                <Link
                  href={paths.product(product.category, product.slug)}
                  className="block text-center transition-colors hover:text-brand-600"
                >
                  <ProductImage product={product} className="mx-auto mb-2 w-24" />
                  <span className="block text-xs text-[var(--ink-muted)]">{product.brandName}</span>
                  <span className="block text-sm font-semibold leading-tight">{product.model}</span>
                  {winnerIndex === index && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <Check className="size-3" aria-hidden />
                      Mejor en conjunto
                    </span>
                  )}
                </Link>
              </th>
            ))}
          </tr>
        </thead>

        {groups.map((group) => (
          <tbody key={group.title} className="border-t border-[var(--border-subtle)]">
            <tr>
              <th
                scope="colgroup"
                colSpan={products.length + 1}
                className="sticky left-0 bg-[var(--surface-2)]/70 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]"
              >
                {group.title}
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.key} className="border-t border-[var(--border-subtle)]">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-[var(--surface)] p-3 text-left font-medium text-[var(--ink-muted)]"
                  title={row.hint}
                >
                  {row.label}
                </th>
                {products.map((product, index) => {
                  const value = row[columns[index]];
                  const isWinner = row.winner === index;
                  return (
                    <td
                      key={product.id}
                      className={cn(
                        "p-3 text-center tabular-nums",
                        isWinner
                          ? "bg-emerald-500/8 font-semibold text-emerald-700 dark:text-emerald-300"
                          : "text-[var(--ink)]",
                      )}
                    >
                      {value ?? "—"}
                      {isWinner && <span className="sr-only"> (mejor valor)</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}
