import { SPEC_TABLES, formatField } from "@/lib/compare/spec-tables";
import type { AnyProduct } from "@/types/products";

/** Ficha técnica completa de un producto, agrupada por bloques. */
export function SpecList({ product }: { product: AnyProduct }) {
  const groups = SPEC_TABLES[product.category];

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {groups.map((group) => {
        const rows = group.fields
          .map((field) => ({ field, value: formatField(product, field) }))
          .filter((row) => row.value !== "—");

        if (rows.length === 0) return null;

        return (
          <section key={group.title} className="rounded-xl border border-[var(--border-subtle)] p-4">
            <h3 className="mb-3 text-sm font-semibold">{group.title}</h3>
            <dl className="divide-y divide-[var(--border-subtle)] text-sm">
              {rows.map(({ field, value }) => (
                <div key={field.key} className="flex items-baseline justify-between gap-4 py-2">
                  <dt className="text-[var(--ink-muted)]" title={field.hint}>
                    {field.label}
                  </dt>
                  <dd className="text-right font-medium tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
