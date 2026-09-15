import { clientKey, rateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

/** Cabeceras de caché para respuestas públicas que cambian poco. */
export function cacheHeaders(seconds: number): Record<string, string> {
  return {
    "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=${seconds * 4}`,
  };
}

export function json(
  data: unknown,
  { status = 200, headers = {} }: { status?: number; headers?: Record<string, string> } = {},
): Response {
  return Response.json(data, {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

export function badRequest(message: string): Response {
  return json({ error: message }, { status: 400 });
}

export function notFoundResponse(message = "Recurso no encontrado"): Response {
  return json({ error: message }, { status: 404 });
}

/**
 * Aplica límite de peticiones y devuelve la respuesta 429 si procede.
 * `blocked === null` significa que la petición puede continuar.
 */
export function guard(
  request: Request,
  scope: string,
  limit = 60,
): { blocked: Response | null; headers: Record<string, string> } {
  const result = rateLimit(clientKey(request, scope), limit);
  const headers = rateLimitHeaders(result);

  if (!result.allowed) {
    return {
      blocked: json(
        { error: "Demasiadas peticiones. Inténtalo de nuevo en un minuto." },
        { status: 429, headers: { ...headers, "Retry-After": "60" } },
      ),
      headers,
    };
  }

  return { blocked: null, headers };
}

interface SerializableProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  category: string;
  referencePrice: number;
  referenceCurrency: string;
  performanceScore: number;
  popularity: number;
  releaseYear: number;
  specs: unknown;
  provenance: unknown;
}

/** Serialización pública de un producto: sin campos internos. */
export function serializeProduct(product: SerializableProduct) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brandName,
    category: product.category,
    price: product.referencePrice,
    currency: product.referenceCurrency,
    performanceScore: product.performanceScore,
    popularity: product.popularity,
    releaseYear: product.releaseYear,
    specs: product.specs,
    provenance: product.provenance,
  };
}
