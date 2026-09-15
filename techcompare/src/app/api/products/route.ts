import { parseCatalogQuery } from "@/lib/catalog/query-params";
import { cacheHeaders, guard, json, badRequest, serializeProduct } from "@/lib/api/response";
import { CATALOG_REVALIDATE } from "@/lib/config";
import { queryCatalog } from "@/lib/repositories/catalog.repository";
import { CATEGORY_BY_URL_SEGMENT } from "@/lib/seo/paths";
import type { ProductCategory } from "@/types/common";

const CATEGORY_ALIASES: Record<string, ProductCategory> = {
  ...CATEGORY_BY_URL_SEGMENT,
  phone: "phone",
  laptop: "laptop",
  cpu: "cpu",
  gpu: "gpu",
};

/**
 * GET /api/products
 *
 * Acepta los mismos parámetros que las páginas de catálogo, de modo que un
 * filtro compartido desde la web se puede reproducir tal cual contra la API.
 */
export async function GET(request: Request) {
  const { blocked, headers } = guard(request, "products", 120);
  if (blocked) return blocked;

  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category") ?? "phone";
  const category = CATEGORY_ALIASES[categoryParam];

  if (!category) {
    return badRequest(
      `Categoría no válida: "${categoryParam}". Valores admitidos: ${Object.keys(CATEGORY_ALIASES).join(", ")}.`,
    );
  }

  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const query = parseCatalogQuery(params, category);
  const pageSize = Math.min(Number(url.searchParams.get("pageSize")) || 24, 60);
  const result = await queryCatalog({ ...query, pageSize });

  return json(
    {
      items: result.items.map(serializeProduct),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    },
    { headers: { ...headers, ...cacheHeaders(CATALOG_REVALIDATE) } },
  );
}
