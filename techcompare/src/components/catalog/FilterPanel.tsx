"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useCatalogParams } from "@/hooks/useCatalogParams";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { MIN_SUFFIX } from "@/lib/catalog/query-params";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { FacetGroup } from "@/types";

function FacetBlock({ facet }: { facet: FacetGroup }) {
  const { setParam, toggleInList, isChecked, get } = useCatalogParams();
  const [expanded, setExpanded] = useState(false);

  if (facet.type === "range") {
    return (
      <fieldset className="border-t border-[var(--border-subtle)] py-4">
        <legend className="mb-3 text-sm font-semibold">
          {facet.label} {facet.unit && <span className="text-[var(--ink-muted)]">({facet.unit})</span>}
        </legend>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">Precio mínimo</span>
            <input
              type="number"
              inputMode="numeric"
              min={facet.min}
              max={facet.max}
              placeholder={String(facet.min ?? 0)}
              defaultValue={get("minPrice") ?? ""}
              onBlur={(event) => setParam("minPrice", event.target.value || null)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1.5 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <span className="text-[var(--ink-muted)]">–</span>
          <label className="flex-1">
            <span className="sr-only">Precio máximo</span>
            <input
              type="number"
              inputMode="numeric"
              min={facet.min}
              max={facet.max}
              placeholder={String(facet.max ?? 0)}
              defaultValue={get("maxPrice") ?? ""}
              onBlur={(event) => setParam("maxPrice", event.target.value || null)}
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1.5 text-sm outline-none focus:border-brand-500"
            />
          </label>
        </div>
      </fieldset>
    );
  }

  if (facet.type === "toggle") {
    const active = get(facet.key) === "true";
    return (
      <div className="border-t border-[var(--border-subtle)] py-4">
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
          <span className="font-medium">{facet.label}</span>
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => {
              setParam(facet.key, event.target.checked ? "true" : null);
              trackEvent(ANALYTICS_EVENTS.filterApplied, { filter: facet.key });
            }}
            className="size-4 accent-[oklch(0.55_0.21_262)]"
          />
        </label>
      </div>
    );
  }

  if (facet.type === "select") {
    const key = `${facet.key}${MIN_SUFFIX}`;
    return (
      <fieldset className="border-t border-[var(--border-subtle)] py-4">
        <legend className="mb-2 text-sm font-semibold">{facet.label}</legend>
        <select
          value={get(key) ?? ""}
          onChange={(event) => {
            setParam(key, event.target.value || null);
            trackEvent(ANALYTICS_EVENTS.filterApplied, { filter: facet.key });
          }}
          className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-1.5 text-sm outline-none focus:border-brand-500"
        >
          <option value="">Sin preferencia</option>
          {facet.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </select>
      </fieldset>
    );
  }

  const options = facet.options ?? [];
  const visible = expanded ? options : options.slice(0, 6);

  return (
    <fieldset className="border-t border-[var(--border-subtle)] py-4">
      <legend className="mb-2 text-sm font-semibold">{facet.label}</legend>
      <div className="space-y-1.5">
        {visible.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isChecked(facet.key === "brand" ? "brand" : facet.key, option.value)}
              onChange={() => {
                toggleInList(facet.key === "brand" ? "brand" : facet.key, option.value);
                trackEvent(ANALYTICS_EVENTS.filterApplied, { filter: facet.key });
              }}
              className="size-4 shrink-0 accent-[oklch(0.55_0.21_262)]"
            />
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            <span className="shrink-0 text-xs text-[var(--ink-muted)] tabular-nums">{option.count}</span>
          </label>
        ))}
      </div>
      {options.length > 6 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
        >
          {expanded ? "Ver menos" : `Ver ${options.length - 6} más`}
        </button>
      )}
    </fieldset>
  );
}

export function FilterPanel({
  facets,
  activeCount,
  resultCount,
}: {
  facets: FacetGroup[];
  activeCount: number;
  resultCount: number;
}) {
  const { clearAll, pending } = useCatalogParams();
  const [open, setOpen] = useState(false);

  const body = (
    <>
      <div className="flex items-center justify-between gap-2 pb-2">
        <p className="text-sm font-semibold">
          Filtros
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-xs text-brand-600 dark:text-brand-300">
              {activeCount}
            </span>
          )}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
          >
            Limpiar
          </button>
        )}
      </div>
      {facets.map((facet) => (
        <FacetBlock key={facet.key} facet={facet} />
      ))}
    </>
  );

  return (
    <>
      <div className="mb-4 lg:hidden">
        <Button variant="secondary" onClick={() => setOpen(true)} className="w-full">
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
      </div>

      <aside
        aria-label="Filtros de catálogo"
        className={cn(
          "hidden lg:block lg:w-64 lg:shrink-0",
          pending && "pointer-events-none opacity-60 transition-opacity",
        )}
      >
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">{body}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-[var(--surface)] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
              <p className="font-semibold">Filtros</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar filtros">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">{body}</div>
            <div className="border-t border-[var(--border-subtle)] p-4">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Ver {resultCount} resultados
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
