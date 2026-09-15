"use client";

import { Scale, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { trackComparison } from "@/lib/analytics/events";
import { COMPARE_PARAM } from "@/lib/catalog/query-params";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { ProductCategory } from "@/types/common";

/**
 * Barra flotante de comparación.
 *
 * Recibe del servidor el mapa slug → nombre de los productos de la página para
 * poder mostrar etiquetas legibles sin volver a pedir datos.
 */
export function CompareTray({
  category,
  compareBasePath,
  labels,
}: {
  category: ProductCategory;
  compareBasePath: string;
  labels: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = (searchParams.get(COMPARE_PARAM) ?? "").split(",").filter(Boolean);
  if (selected.length === 0) return null;

  const remove = (slug: string) => {
    const next = new URLSearchParams(searchParams.toString());
    const updated = selected.filter((item) => item !== slug);
    if (updated.length === 0) next.delete(COMPARE_PARAM);
    else next.set(COMPARE_PARAM, updated.join(","));
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clear = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(COMPARE_PARAM);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const ready = selected.length >= 2;
  const href = `${compareBasePath}/${selected.join("-vs-")}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--surface)]/95 p-3 backdrop-blur-md animate-rise">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Scale className="size-4 text-brand-600" aria-hidden />
          Comparar ({selected.length}/3)
        </span>

        <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
          {selected.map((slug) => (
            <li key={slug}>
              <button
                type="button"
                onClick={() => remove(slug)}
                className="inline-flex max-w-52 items-center gap-1 truncate rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2.5 py-1 text-xs transition-colors hover:border-rose-500/50"
              >
                <span className="truncate">{labels[slug] ?? slug}</span>
                <X className="size-3 shrink-0" aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clear}>
            Vaciar
          </Button>
          {ready ? (
            <ButtonLink
              href={href}
              size="sm"
              onClick={() => trackComparison(category, selected)}
            >
              Comparar ahora
            </ButtonLink>
          ) : (
            <Button size="sm" disabled>
              Elige otro más
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
