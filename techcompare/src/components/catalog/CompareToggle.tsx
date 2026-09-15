"use client";

import { Check, Scale } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { COMPARE_PARAM } from "@/lib/catalog/query-params";
import { cn } from "@/lib/utils";

const MAX_SELECTION = 3;

/**
 * Selección para comparar, guardada en la URL.
 * Así el estado sobrevive a la navegación y la vista se puede compartir.
 */
export function CompareToggle({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selected = (searchParams.get(COMPARE_PARAM) ?? "").split(",").filter(Boolean);
  const active = selected.includes(slug);
  const full = selected.length >= MAX_SELECTION && !active;

  const toggle = () => {
    const next = new URLSearchParams(searchParams.toString());
    const updated = active
      ? selected.filter((item) => item !== slug)
      : [...selected, slug].slice(0, MAX_SELECTION);

    if (updated.length === 0) next.delete(COMPARE_PARAM);
    else next.set(COMPARE_PARAM, updated.join(","));

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={full}
      aria-pressed={active}
      title={full ? `Solo se pueden comparar ${MAX_SELECTION} productos a la vez` : undefined}
      className={cn(
        "inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300"
          : "border-[var(--border-subtle)] text-[var(--ink-muted)] hover:border-brand-500/50 hover:text-[var(--ink)]",
        full && "cursor-not-allowed opacity-40",
      )}
    >
      {active ? <Check className="size-3.5" aria-hidden /> : <Scale className="size-3.5" aria-hidden />}
      {active ? "Añadido" : "Comparar"}
      <span className="sr-only">{name}</span>
    </button>
  );
}
