import { FACET_DEFINITIONS } from "@/lib/repositories/facets";
import { sanitizeInteger, sanitizeText } from "@/lib/security/sanitize";
import type { CatalogQuery, ProductCategory, SortKey } from "@/types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const SORT_KEYS: SortKey[] = [
  "relevance",
  "price_asc",
  "price_desc",
  "performance",
  "popularity",
  "newest",
];

export const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Más relevantes",
  price_asc: "Precio: de menor a mayor",
  price_desc: "Precio: de mayor a menor",
  performance: "Mejor rendimiento",
  popularity: "Más populares",
  newest: "Más recientes",
};

/** Sufijo de los filtros numéricos en la URL: `ram_min=8`. */
export const MIN_SUFFIX = "_min";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return raw
    .split(",")
    .map((item) => sanitizeText(item, 60))
    .filter(Boolean);
}

/**
 * Traduce los parámetros de la URL a una consulta de catálogo tipada.
 *
 * Es el único punto donde se interpreta la query string: las páginas y la API
 * comparten esta función, de modo que un enlace compartido produce exactamente
 * el mismo resultado en ambas.
 */
export function parseCatalogQuery(
  params: RawSearchParams,
  category: ProductCategory,
): CatalogQuery {
  const definitions = FACET_DEFINITIONS[category];
  const minSpecs: Record<string, number> = {};
  const equals: Record<string, string> = {};
  const flags: Record<string, boolean> = {};

  for (const definition of definitions) {
    if (definition.key === "brand" || definition.key === "price") continue;

    if (definition.type === "select") {
      const value = sanitizeInteger(first(params[`${definition.key}${MIN_SUFFIX}`]), 0, 100_000);
      if (value !== null) minSpecs[definition.key] = value;
    } else if (definition.type === "toggle") {
      if (first(params[definition.key]) === "true") flags[definition.key] = true;
    } else {
      const value = first(params[definition.key]);
      if (value) equals[definition.key] = sanitizeText(value, 60);
    }
  }

  const sortParam = first(params.sort) as SortKey | undefined;

  return {
    category,
    q: sanitizeText(first(params.q), 80) || undefined,
    brands: list(params.brand),
    minPrice: sanitizeInteger(first(params.minPrice), 0, 1_000_000) ?? undefined,
    maxPrice: sanitizeInteger(first(params.maxPrice), 0, 1_000_000) ?? undefined,
    minSpecs: Object.keys(minSpecs).length > 0 ? minSpecs : undefined,
    equals: Object.keys(equals).length > 0 ? equals : undefined,
    flags: Object.keys(flags).length > 0 ? flags : undefined,
    sort: sortParam && SORT_KEYS.includes(sortParam) ? sortParam : "relevance",
    page: sanitizeInteger(first(params.page), 1, 500) ?? 1,
  };
}

/** Cuenta los filtros activos, para el aviso del botón en móvil. */
export function countActiveFilters(query: CatalogQuery): number {
  return (
    (query.brands?.length ?? 0) +
    (query.minPrice !== undefined ? 1 : 0) +
    (query.maxPrice !== undefined ? 1 : 0) +
    Object.keys(query.minSpecs ?? {}).length +
    Object.keys(query.equals ?? {}).length +
    Object.keys(query.flags ?? {}).length
  );
}

/** Lista legible de los filtros activos, con la URL que los elimina. */
export interface ActiveFilterChip {
  label: string;
  param: string;
  value?: string;
}

export function activeFilterChips(
  params: RawSearchParams,
  category: ProductCategory,
): ActiveFilterChip[] {
  const definitions = FACET_DEFINITIONS[category];
  const chips: ActiveFilterChip[] = [];

  for (const brand of list(params.brand)) {
    chips.push({ label: brand, param: "brand", value: brand });
  }

  const minPrice = first(params.minPrice);
  if (minPrice) chips.push({ label: `Desde ${minPrice} Bs`, param: "minPrice" });

  const maxPrice = first(params.maxPrice);
  if (maxPrice) chips.push({ label: `Hasta ${maxPrice} Bs`, param: "maxPrice" });

  for (const definition of definitions) {
    if (definition.key === "brand" || definition.key === "price") continue;

    if (definition.type === "select") {
      const value = first(params[`${definition.key}${MIN_SUFFIX}`]);
      if (value) {
        chips.push({
          label: `${definition.label}: ${value}${definition.unit ? ` ${definition.unit}` : ""}`,
          param: `${definition.key}${MIN_SUFFIX}`,
        });
      }
    } else if (definition.type === "toggle") {
      if (first(params[definition.key]) === "true") {
        chips.push({ label: definition.label, param: definition.key });
      }
    } else {
      const value = first(params[definition.key]);
      if (value) chips.push({ label: `${definition.label}: ${value}`, param: definition.key });
    }
  }

  return chips;
}

export const COMPARE_PARAM = "comparar";

export function parseCompareSelection(params: RawSearchParams): string[] {
  return list(params[COMPARE_PARAM]).slice(0, 3);
}
