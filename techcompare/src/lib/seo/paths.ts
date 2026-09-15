import { categories } from "@/lib/config";
import type { ProductCategory } from "@/types/common";

/** Construcción centralizada de rutas: evita enlaces rotos por strings sueltos. */
export const paths = {
  home: () => "/",
  category: (category: ProductCategory) => `/${categories[category].slug}`,
  product: (category: ProductCategory, slug: string) => `/${categories[category].slug}/${slug}`,
  compare: (category: ProductCategory, slugs: string[]) =>
    `/comparar/${categories[category].compareSlug}/${slugs.join("-vs-")}`,
  collection: (slug: string) => `/mejores/${slug}`,
  guide: (slug: string) => `/guias/${slug}`,
  guides: () => "/guias",
  search: (query?: string) => (query ? `/buscar?q=${encodeURIComponent(query)}` : "/buscar"),
  quiz: () => "/que-telefono-me-conviene",
  calculator: () => "/calculadora-almacenamiento",
  admin: () => "/admin",
  adminProviders: () => "/admin/providers",
};

/** Traduce el segmento de categoría de una URL al tipo interno. */
export const CATEGORY_BY_URL_SEGMENT: Record<string, ProductCategory> = {
  celulares: "phone",
  laptops: "laptop",
  procesadores: "cpu",
  gpus: "gpu",
};
