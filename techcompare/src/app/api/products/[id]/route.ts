import { cacheHeaders, guard, json, notFoundResponse, serializeProduct } from "@/lib/api/response";
import { CATALOG_REVALIDATE } from "@/lib/config";
import { getProductById } from "@/lib/repositories/catalog.repository";

/** GET /api/products/:id */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { blocked, headers } = guard(request, "product", 120);
  if (blocked) return blocked;

  const { id } = await context.params;
  const product = await getProductById(id);

  if (!product) return notFoundResponse(`No existe el producto "${id}".`);

  return json(serializeProduct(product), {
    headers: { ...headers, ...cacheHeaders(CATALOG_REVALIDATE) },
  });
}
