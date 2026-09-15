"use client";

import { X } from "lucide-react";
import { useCatalogParams } from "@/hooks/useCatalogParams";
import type { ActiveFilterChip } from "@/lib/catalog/query-params";

export function ActiveFilters({ chips }: { chips: ActiveFilterChip[] }) {
  const { setParam, toggleInList, clearAll } = useCatalogParams();

  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.param}-${chip.label}`}
          type="button"
          onClick={() =>
            chip.value ? toggleInList(chip.param, chip.value) : setParam(chip.param, null)
          }
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-2)] px-2.5 py-1 text-xs transition-colors hover:border-rose-500/50 hover:text-rose-600"
        >
          {chip.label}
          <X className="size-3" aria-hidden />
          <span className="sr-only">Quitar filtro</span>
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
      >
        Limpiar todo
      </button>
    </div>
  );
}
