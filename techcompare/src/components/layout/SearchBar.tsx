"use client";

import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { trackSearch } from "@/lib/analytics/events";
import { formatMoney } from "@/lib/currency/format";
import { cn } from "@/lib/utils";
import type { SearchResultItem } from "@/types/api";

export function SearchBar({
  size = "md",
  placeholder = "Busca un celular, laptop, procesador o GPU...",
  autoFocus = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [fetched, setFetched] = useState<SearchResultItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const debounced = useDebouncedValue(query, 220);
  const term = debounced.trim();
  const searchable = term.length >= 2;

  // Los resultados solo se muestran si el término sigue siendo buscable, así no
  // hace falta vaciarlos desde el efecto al borrar el campo.
  const results = searchable ? fetched : [];

  useEffect(() => {
    if (!searchable) return;

    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products/search?q=${encodeURIComponent(term)}&limit=6`,
          { signal: controller.signal },
        );
        const data: { items?: SearchResultItem[] } = response.ok
          ? await response.json()
          : { items: [] };

        if (controller.signal.aborted) return;
        setFetched(data.items ?? []);
        setActiveIndex(-1);
        trackSearch(term, data.items?.length ?? 0);
      } catch {
        if (!controller.signal.aborted) setFetched([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [term, searchable]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const goToSearch = () => {
    const term = query.trim();
    if (term.length > 0) {
      setOpen(false);
      router.push(`/buscar?q=${encodeURIComponent(term)}`);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        setOpen(false);
        router.push(selected.url);
      } else {
        goToSearch();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const heights = { sm: "h-9 text-sm", md: "h-11 text-sm", lg: "h-14 text-base" };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ink-muted)]"
          aria-hidden
        />
        <input
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Buscar productos"
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] pl-9 pr-10 outline-none transition-colors placeholder:text-[var(--ink-muted)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
            heights[size],
          )}
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[var(--ink-muted)]"
            aria-hidden
          />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xl shadow-black/5 animate-fade-in"
        >
          {results.length === 0 && !loading ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
              Sin resultados para &quot;{query.trim()}&quot;
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onClick={() => {
                      setOpen(false);
                      router.push(item.url);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors",
                      index === activeIndex ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.name}</span>
                      <span className="block text-xs text-[var(--ink-muted)]">
                        {item.categoryLabel}
                      </span>
                    </span>
                    {item.price > 0 && (
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-brand-600 dark:text-brand-300">
                        {formatMoney(item.price, "BOB")}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={goToSearch}
            className="block w-full border-t border-[var(--border-subtle)] px-4 py-2.5 text-left text-xs font-medium text-brand-600 hover:bg-[var(--surface-2)] dark:text-brand-300"
          >
            Ver todos los resultados para &quot;{query.trim()}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
