"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

/**
 * Estado de catálogo sincronizado con la URL.
 *
 * Mantener los filtros en la query string tiene tres ventajas: la vista es
 * compartible, el botón atrás funciona y el servidor puede renderizar los
 * resultados sin enviar el catálogo entero al navegador.
 */
export function useCatalogParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const commit = useCallback(
    (next: URLSearchParams) => {
      next.delete("page");
      const query = next.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router],
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      commit(next);
    },
    [commit, searchParams],
  );

  const toggleInList = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      const current = (next.get(key) ?? "").split(",").filter(Boolean);
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      if (updated.length === 0) next.delete(key);
      else next.set(key, updated.join(","));
      commit(next);
    },
    [commit, searchParams],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) next.set("sort", sort);
    commit(next);
  }, [commit, searchParams]);

  const isChecked = useCallback(
    (key: string, value: string) => (searchParams.get(key) ?? "").split(",").includes(value),
    [searchParams],
  );

  return {
    searchParams,
    pathname,
    pending,
    setParam,
    toggleInList,
    clearAll,
    isChecked,
    get: (key: string) => searchParams.get(key),
  };
}
