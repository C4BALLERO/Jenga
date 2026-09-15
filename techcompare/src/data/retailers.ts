import type { Retailer } from "@/types/common";

/**
 * Tiendas de demostración. Representan el modelo de datos de ofertas
 * multi-tienda; se sustituyen por tiendas reales cuando cada una autoriza su
 * feed o API (ver `src/lib/providers/retailers`).
 */
export const retailers: Retailer[] = [
  { slug: "demo-tienda-lp", name: "Tienda Demo La Paz", country: "BO", website: "https://example.com/lp", integration: "feed" },
  { slug: "demo-tienda-scz", name: "Tienda Demo Santa Cruz", country: "BO", website: "https://example.com/scz", integration: "feed" },
  { slug: "demo-tienda-cbb", name: "Tienda Demo Cochabamba", country: "BO", website: "https://example.com/cbb", integration: "manual" },
  { slug: "demo-marketplace", name: "Marketplace Demo LatAm", country: "PE", website: "https://example.com/latam", integration: "api" },
];

export const retailerBySlug = new Map(retailers.map((retailer) => [retailer.slug, retailer]));
