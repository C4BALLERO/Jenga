import type { ProductCategory } from "@/types/common";
import type { ProviderDescriptor } from "@/types/providers";
import { BaseProvider } from "./base.provider";

export interface BrandProviderConfig {
  id: string;
  name: string;
  categories: ProductCategory[];
  countries?: string[];
  docsUrl?: string;
  complianceNote: string;
  requiredEnv: string[];
  catalogMinutes?: number;
  priceMinutes?: number;
  availabilityMinutes?: number;
}

/**
 * Proveedor de marca en modo "importación manual / pendiente de integración".
 *
 * IMPORTANTE: ninguna de estas marcas expone hoy, de forma verificable, una API
 * pública de catálogo de productos con especificaciones técnicas. Por eso NO se
 * inventan endpoints: el proveedor queda registrado, descrito y listo para
 * conectar, y devuelve conjuntos vacíos mientras no se configuren credenciales
 * de una integración autorizada (API oficial de partner, feed de afiliados o
 * catálogo cedido por el fabricante).
 *
 * Al establecer el acuerdo correspondiente basta con extender esta clase y
 * sobrescribir `getProducts` / `getPrices` usando `providerFetch`.
 */
export class ManualImportProvider extends BaseProvider {
  readonly descriptor: ProviderDescriptor;

  constructor(config: BrandProviderConfig) {
    super();
    this.descriptor = {
      id: config.id,
      name: config.name,
      kind: "brand",
      categories: config.categories,
      countries: config.countries ?? ["GLOBAL"],
      docsUrl: config.docsUrl,
      complianceNote: config.complianceNote,
      requiredEnv: config.requiredEnv,
      capabilities: {
        catalog: false,
        prices: false,
        availability: false,
        images: false,
        search: false,
      },
      rateLimit: { requests: 60, windowSeconds: 60, minDelayMs: 250 },
      schedule: {
        catalogMinutes: config.catalogMinutes ?? 24 * 60,
        priceMinutes: config.priceMinutes ?? 6 * 60,
        availabilityMinutes: config.availabilityMinutes ?? 3 * 60,
      },
    };
  }
}

export function createBrandProvider(config: BrandProviderConfig): ManualImportProvider {
  return new ManualImportProvider(config);
}
