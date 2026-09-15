import type { ProviderDescriptor } from "@/types/providers";
import { BaseProvider } from "../base.provider";

/**
 * Amazon solo permite acceso programático al catálogo mediante la
 * Product Advertising API 5.0, que exige ser afiliado aprobado con ventas
 * cualificadas y firma AWS SigV4 de cada petición.
 *
 * Hasta disponer de esas credenciales el proveedor queda registrado e inactivo.
 * No se implementa ninguna alternativa por scraping: los términos de uso de
 * Amazon lo prohíben expresamente.
 */
export class AmazonProvider extends BaseProvider {
  readonly descriptor: ProviderDescriptor = {
    id: "amazon",
    name: "Amazon (Product Advertising API)",
    kind: "retailer",
    categories: ["phone", "laptop", "cpu", "gpu"],
    countries: ["US", "MX", "BR"],
    docsUrl: "https://webservices.amazon.com/paapi5/documentation/",
    complianceNote:
      "Requiere cuenta de Amazon Associates aprobada y firma SigV4. Sin credenciales el proveedor no realiza peticiones. Prohibido el scraping por términos de servicio.",
    requiredEnv: ["AMAZON_PAAPI_ACCESS_KEY", "AMAZON_PAAPI_SECRET_KEY", "AMAZON_PARTNER_TAG"],
    capabilities: {
      catalog: false,
      prices: false,
      availability: false,
      images: false,
      search: false,
    },
    rateLimit: { requests: 1, windowSeconds: 1, minDelayMs: 1100 },
    schedule: { catalogMinutes: 24 * 60, priceMinutes: 6 * 60, availabilityMinutes: 6 * 60 },
  };
}

export const amazonProvider = new AmazonProvider();
