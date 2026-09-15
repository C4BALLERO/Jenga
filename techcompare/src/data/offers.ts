import { stableHash } from "@/lib/scoring/math";
import type { PriceHistory, PricePoint, ProductOffer } from "@/types/common";
import type { AnyProduct } from "@/types/products";
import { retailers } from "./retailers";

/**
 * Generador determinista de ofertas y de historial de precios para el catálogo
 * de demostración.
 *
 * Existe para que la arquitectura multi-tienda (producto maestro + N ofertas +
 * historial) sea verificable de extremo a extremo sin datos reales. Cuando un
 * proveedor autorizado entra en funcionamiento, las ofertas pasan a venir de la
 * base de datos y este módulo deja de usarse.
 */

const MS_PER_DAY = 86_400_000;
/** Ancla fija para que servidor y cliente generen exactamente lo mismo. */
const ANCHOR = Date.UTC(2026, 0, 15, 12, 0, 0);

function pseudoRandom(seed: string, index: number): number {
  return ((stableHash(`${seed}:${index}`) % 10_000) / 10_000) * 2 - 1;
}

export function buildOffers(product: AnyProduct): ProductOffer[] {
  if (product.referencePrice <= 0) return [];

  const hash = stableHash(product.slug);
  const count = 2 + (hash % 3);
  const offers: ProductOffer[] = [];

  for (let index = 0; index < count; index += 1) {
    const retailer = retailers[(hash + index * 7) % retailers.length];
    const delta = pseudoRandom(product.slug, index) * 0.09;
    const price = Math.round((product.referencePrice * (1 + delta)) / 10) * 10;
    const stockRoll = (hash + index * 13) % 10;

    offers.push({
      id: `${product.id}-${retailer.slug}`,
      productId: product.id,
      retailer,
      originalPrice: price,
      originalCurrency: retailer.country === "BO" ? "BOB" : "USD",
      availability: stockRoll === 0 ? "out_of_stock" : stockRoll === 1 ? "preorder" : "in_stock",
      productUrl: `${retailer.website}/producto/${product.slug}`,
      lastUpdated: new Date(ANCHOR - ((hash + index) % 20) * 3_600_000).toISOString(),
      shippingNote: retailer.country === "BO" ? "Entrega nacional" : "Importación bajo pedido",
    });
  }

  // Las ofertas se muestran siempre de más barata a más cara.
  return offers.sort((a, b) => a.originalPrice - b.originalPrice);
}

export function buildPriceHistory(product: AnyProduct, months = 12): PriceHistory {
  if (product.referencePrice <= 0) {
    return { productId: product.id, points: [] };
  }

  const points: PricePoint[] = [];
  let price = product.referencePrice * 1.12;

  for (let index = months; index >= 0; index -= 1) {
    const drift = -0.012 + pseudoRandom(product.slug, index) * 0.03;
    price = price * (1 + drift);
    points.push({
      timestamp: new Date(ANCHOR - index * 30 * MS_PER_DAY).toISOString(),
      price: Math.round(price / 10) * 10,
      currency: product.referenceCurrency,
    });
  }

  return { productId: product.id, points };
}

export interface PriceInsight {
  current: number;
  lowest: number;
  highest: number;
  average: number;
  /** Variación porcentual frente al punto anterior del historial. */
  changePct: number;
  /** Variación porcentual frente al mínimo histórico. */
  vsLowestPct: number;
  currency: PricePoint["currency"];
}

export function priceInsight(history: PriceHistory): PriceInsight | null {
  if (history.points.length === 0) return null;

  const prices = history.points.map((point) => point.price);
  const current = prices[prices.length - 1];
  const previous = prices[prices.length - 2] ?? current;
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length);

  return {
    current,
    lowest,
    highest,
    average,
    changePct: previous ? ((current - previous) / previous) * 100 : 0,
    vsLowestPct: lowest ? ((current - lowest) / lowest) * 100 : 0,
    currency: history.points[0].currency,
  };
}
