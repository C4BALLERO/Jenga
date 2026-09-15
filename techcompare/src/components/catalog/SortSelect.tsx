"use client";

import { ArrowUpDown } from "lucide-react";
import { useCatalogParams } from "@/hooks/useCatalogParams";
import { SORT_LABELS } from "@/lib/catalog/query-params";
import type { SortKey } from "@/types";

export function SortSelect() {
  const { get, setParam } = useCatalogParams();
  const value = (get("sort") ?? "relevance") as SortKey;

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <ArrowUpDown className="size-4 text-[var(--ink-muted)]" aria-hidden />
      <span className="sr-only">Ordenar resultados</span>
      <select
        value={value}
        onChange={(event) => setParam("sort", event.target.value)}
        className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1.5 text-sm outline-none focus:border-brand-500"
      >
        {Object.entries(SORT_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
