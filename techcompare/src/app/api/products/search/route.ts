import { cacheHeaders, guard, json } from "@/lib/api/response";
import { categories } from "@/lib/config";
import { searchProducts } from "@/lib/repositories/catalog.repository";
import { paths } from "@/lib/seo/paths";
import { sanitizeText } from "@/lib/security/sanitize";
import type { SearchResultItem } from "@/types/api";

/** GET /api/products/search?q=...&limit=... */
export async function GET(request: Request) {
  const { blocked, headers } = guard(request, "search", 90);
  if (blocked) return blocked;

  const url = new URL(request.url);
  const query = sanitizeText(url.searchParams.get("q"), 80);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 8, 25);

  if (query.length < 2) {
    return json({ items: [], query }, { headers });
  }

  const hits = await searchProducts(query, limit);

  const items: SearchResultItem[] = hits.map(({ product }) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brandName,
    category: product.category,
    categoryLabel: categories[product.category].label,
    url: paths.product(product.category, product.slug),
    price: product.referencePrice,
    currency: product.referenceCurrency,
    performanceScore: product.performanceScore,
  }));

  return json({ items, query }, { headers: { ...headers, ...cacheHeaders(300) } });
}
