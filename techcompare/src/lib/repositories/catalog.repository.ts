import { allProducts, catalogByCategory, findProduct } from "@/data/catalog";
import { buildOffers, buildPriceHistory, priceInsight, type PriceInsight } from "@/data/offers";
import { PAGE_SIZE } from "@/lib/config";
import type {
  CatalogQuery,
  FacetGroup,
  Paginated,
  PriceHistory,
  ProductCategory,
  ProductOffer,
  SortKey,
} from "@/types";
import type { AnyProduct } from "@/types/products";
import { buildFacets } from "./facets";
import { specString, specValue } from "./spec-access";

/**
 * Capa de acceso a datos del catálogo.
 *
 * Hoy resuelve sobre el catálogo en memoria derivado de los datos iniciales.
 * La firma de cada función es asíncrona a propósito: cuando `DATABASE_URL` esté
 * configurada, la implementación pasa a consultar Prisma sin que cambie ni una
 * línea en las páginas ni en la API.
 */

function matchesText(product: AnyProduct, needle: string): boolean {
  if (!needle) return true;
  const haystack = [
    product.name,
    product.brandName,
    product.model,
    specString(product, "chipset"),
    specString(product, "cpu"),
    specString(product, "gpu"),
    specString(product, "architecture"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return needle
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

function applySort(products: AnyProduct[], sort: SortKey = "relevance"): AnyProduct[] {
  const sorted = [...products];

  switch (sort) {
    case "price_asc":
      return sorted.sort(
        (a, b) =>
          (a.referencePrice || Number.MAX_SAFE_INTEGER) -
          (b.referencePrice || Number.MAX_SAFE_INTEGER),
      );
    case "price_desc":
      return sorted.sort((a, b) => b.referencePrice - a.referencePrice);
    case "performance":
      return sorted.sort((a, b) => b.performanceScore - a.performanceScore);
    case "popularity":
      return sorted.sort((a, b) => b.popularity - a.popularity);
    case "newest":
      return sorted.sort((a, b) => b.releaseYear - a.releaseYear || b.popularity - a.popularity);
    default:
      return sorted.sort(
        (a, b) =>
          b.popularity * 0.6 +
          b.performanceScore * 0.4 -
          (a.popularity * 0.6 + a.performanceScore * 0.4),
      );
  }
}

export function filterProducts(products: AnyProduct[], query: CatalogQuery): AnyProduct[] {
  return products.filter((product) => {
    if (!matchesText(product, query.q ?? "")) return false;

    if (query.brands?.length) {
      const brandMatch =
        query.brands.includes(product.brandSlug) || query.brands.includes(product.brandName);
      if (!brandMatch) return false;
    }

    if (typeof query.minPrice === "number" && product.referencePrice < query.minPrice) return false;
    if (
      typeof query.maxPrice === "number" &&
      product.referencePrice > 0 &&
      product.referencePrice > query.maxPrice
    ) {
      return false;
    }

    for (const [key, min] of Object.entries(query.minSpecs ?? {})) {
      const value = specValue(product, key);
      if (typeof value !== "number") return false;
      // `tdp` es el único filtro numérico que funciona como máximo.
      if (key === "tdp" ? value > min : value < min) return false;
    }

    for (const [key, expected] of Object.entries(query.equals ?? {})) {
      const value = key === "brand" ? product.brandName : specString(product, key);
      if (String(value) !== expected) return false;
    }

    for (const [key, expected] of Object.entries(query.flags ?? {})) {
      if (specValue(product, key) !== expected) return false;
    }

    return true;
  });
}

export async function queryCatalog(query: CatalogQuery): Promise<Paginated<AnyProduct>> {
  const source = catalogByCategory[query.category] ?? [];
  const filtered = applySort(filterProducts(source, query), query.sort);

  const pageSize = query.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, query.page ?? 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    totalPages,
  };
}

export async function getCategoryProducts(category: ProductCategory): Promise<AnyProduct[]> {
  return catalogByCategory[category] ?? [];
}

export async function getFacets(category: ProductCategory): Promise<FacetGroup[]> {
  return buildFacets(category, catalogByCategory[category] ?? []);
}

export async function getProduct(
  category: ProductCategory,
  slug: string,
): Promise<AnyProduct | null> {
  return findProduct(category, slug) ?? null;
}

export async function getProductById(id: string): Promise<AnyProduct | null> {
  return allProducts.find((product) => product.id === id) ?? null;
}

export async function getProductsBySlugs(
  category: ProductCategory,
  slugs: string[],
): Promise<AnyProduct[]> {
  return slugs
    .map((slug) => findProduct(category, slug))
    .filter((product): product is AnyProduct => Boolean(product));
}

export interface SearchHit {
  product: AnyProduct;
  score: number;
}

export async function searchProducts(query: string, limit = 10): Promise<SearchHit[]> {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const hits: SearchHit[] = [];

  for (const product of allProducts) {
    if (!matchesText(product, needle)) continue;
    const name = product.name.toLowerCase();
    const score =
      (name.startsWith(needle) ? 60 : 0) +
      (name.includes(needle) ? 25 : 0) +
      product.popularity * 0.3;
    hits.push({ product, score });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function getOffers(productId: string): Promise<ProductOffer[]> {
  const product = await getProductById(productId);
  return product ? buildOffers(product) : [];
}

export async function getPriceHistory(productId: string): Promise<PriceHistory> {
  const product = await getProductById(productId);
  return product ? buildPriceHistory(product) : { productId, points: [] };
}

export async function getPriceInsight(productId: string): Promise<PriceInsight | null> {
  return priceInsight(await getPriceHistory(productId));
}

/** Productos comparables: misma categoría y precio o rendimiento cercanos. */
export async function getRelatedProducts(product: AnyProduct, limit = 4): Promise<AnyProduct[]> {
  const pool = catalogByCategory[product.category].filter((item) => item.id !== product.id);

  return pool
    .map((item) => {
      const priceGap =
        product.referencePrice > 0 && item.referencePrice > 0
          ? Math.abs(item.referencePrice - product.referencePrice) / product.referencePrice
          : 1;
      const perfGap = Math.abs(item.performanceScore - product.performanceScore) / 100;
      return { item, distance: priceGap * 0.6 + perfGap * 0.4 };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export async function getTopProducts(
  category: ProductCategory,
  dimension: "popularity" | "performance" = "popularity",
  limit = 6,
): Promise<AnyProduct[]> {
  const sorted = applySort(catalogByCategory[category] ?? [], dimension);
  return sorted.slice(0, limit);
}

export async function getCatalogCounts(): Promise<Record<ProductCategory, number>> {
  return {
    phone: catalogByCategory.phone.length,
    laptop: catalogByCategory.laptop.length,
    cpu: catalogByCategory.cpu.length,
    gpu: catalogByCategory.gpu.length,
  };
}

/** Marca de tiempo más reciente del catálogo, para el aviso "actualizado hace…". */
export async function getCatalogLastUpdated(): Promise<string> {
  return allProducts
    .map((product) => product.provenance.lastUpdated)
    .sort()
    .at(-1) ?? new Date().toISOString();
}
