import { badRequest, cacheHeaders, guard, json } from "@/lib/api/response";
import { buildComparisonTable, buildVerdict } from "@/lib/compare/compare";
import { CATALOG_REVALIDATE } from "@/lib/config";
import { getProductsBySlugs } from "@/lib/repositories/catalog.repository";
import { CATEGORY_BY_URL_SEGMENT } from "@/lib/seo/paths";
import { sanitizeSlug } from "@/lib/security/sanitize";
import type { ProductCategory } from "@/types/common";

const ALIASES: Record<string, ProductCategory> = {
  ...CATEGORY_BY_URL_SEGMENT,
  phone: "phone",
  laptop: "laptop",
  cpu: "cpu",
  gpu: "gpu",
};

/**
 * GET /api/compare?category=celulares&slugs=iphone-17,galaxy-s26
 *
 * Devuelve la misma tabla y el mismo veredicto que la página de comparación.
 */
export async function GET(request: Request) {
  const { blocked, headers } = guard(request, "compare", 60);
  if (blocked) return blocked;

  const url = new URL(request.url);
  const category = ALIASES[url.searchParams.get("category") ?? ""];
  if (!category) return badRequest("Parámetro `category` no válido.");

  const slugs = (url.searchParams.get("slugs") ?? "")
    .split(",")
    .map((slug) => sanitizeSlug(slug.trim()))
    .filter((slug): slug is string => Boolean(slug))
    .slice(0, 3);

  if (slugs.length < 2) {
    return badRequest("Indica al menos dos `slugs` separados por comas.");
  }

  const products = await getProductsBySlugs(category, slugs);
  if (products.length < 2) {
    return badRequest("No se han encontrado suficientes productos para comparar.");
  }

  return json(
    {
      category,
      products: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brandName,
        price: product.referencePrice,
        currency: product.referenceCurrency,
      })),
      groups: buildComparisonTable(products),
      verdict: buildVerdict(products),
    },
    { headers: { ...headers, ...cacheHeaders(CATALOG_REVALIDATE) } },
  );
}
