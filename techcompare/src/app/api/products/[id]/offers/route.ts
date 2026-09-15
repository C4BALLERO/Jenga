import { cacheHeaders, guard, json, notFoundResponse } from "@/lib/api/response";
import { PRICE_REVALIDATE } from "@/lib/config";
import { convertStatic } from "@/lib/currency/exchange";
import { getOffers, getPriceInsight, getProductById } from "@/lib/repositories/catalog.repository";

/** GET /api/products/:id/offers — ofertas por tienda y resumen de precio. */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { blocked, headers } = guard(request, "offers", 120);
  if (blocked) return blocked;

  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) return notFoundResponse(`No existe el producto "${id}".`);

  const [offers, insight] = await Promise.all([getOffers(id), getPriceInsight(id)]);

  return json(
    {
      productId: id,
      offers: offers.map((offer) => ({
        id: offer.id,
        retailer: offer.retailer.name,
        retailerSlug: offer.retailer.slug,
        country: offer.retailer.country,
        originalPrice: offer.originalPrice,
        originalCurrency: offer.originalCurrency,
        priceBob: Math.round(convertStatic(offer.originalPrice, offer.originalCurrency, "BOB")),
        availability: offer.availability,
        productUrl: offer.productUrl,
        lastUpdated: offer.lastUpdated,
      })),
      insight,
    },
    { headers: { ...headers, ...cacheHeaders(PRICE_REVALIDATE) } },
  );
}
