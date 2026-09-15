import type { ProductCategory } from "./common";

export type SortKey =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "performance"
  | "popularity"
  | "newest";

export interface CatalogQuery {
  category: ProductCategory;
  q?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  /** Filtros numéricos mínimos por clave de spec, p. ej. `{ ram: 8 }`. */
  minSpecs?: Record<string, number>;
  /** Filtros de igualdad por clave de spec, p. ej. `{ os: 'Android' }`. */
  equals?: Record<string, string>;
  /** Filtros booleanos, p. ej. `{ fiveG: true }`. */
  flags?: Record<string, boolean>;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  key: string;
  label: string;
  type: "checkbox" | "range" | "select" | "toggle";
  options?: FilterOption[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
