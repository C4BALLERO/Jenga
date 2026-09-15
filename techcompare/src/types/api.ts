import type { ProductCategory } from "./common";

/** Forma de los resultados devueltos por `/api/products/search`. */
export interface SearchResultItem {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  categoryLabel: string;
  url: string;
  price: number;
  currency: string;
  performanceScore: number;
}

export interface ApiError {
  error: string;
}
