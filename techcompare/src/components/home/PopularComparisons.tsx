import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { paths } from "@/lib/seo/paths";
import { categories } from "@/lib/config";
import type { AnyProduct } from "@/types/products";

export function PopularComparisons({ pairs }: { pairs: [AnyProduct, AnyProduct][] }) {
  if (pairs.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {pairs.map(([a, b]) => (
        <li key={`${a.id}-${b.id}`}>
          <Link
            href={paths.compare(a.category, [a.slug, b.slug])}
            className="group flex h-full flex-col justify-between rounded-xl border border-[var(--border-subtle)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/50"
          >
            <span className="text-xs uppercase tracking-wide text-[var(--ink-muted)]">
              {categories[a.category].label}
            </span>
            <span className="mt-1 text-sm font-semibold leading-snug">
              {a.name}{" "}
              <span className="text-[var(--ink-muted)]">vs</span>{" "}
              {b.name}
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-300">
              Ver comparación
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
