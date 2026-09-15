import { allProducts } from "@/data/catalog";
import type { ProviderDescriptor, ProviderListOptions, ProviderPage, RawProviderProduct, ProviderSearchOptions } from "@/types/providers";
import { BaseProvider } from "./base.provider";

function toRaw(product: (typeof allProducts)[number]): RawProviderProduct {
  return {
    externalId: product.id,
    provider: "demo-seed",
    brand: product.brandName,
    model: product.model,
    name: product.name,
    description: product.description,
    category: product.category,
    images: product.image ? [product.image] : [],
    specifications: product.specs as unknown as Record<string, unknown>,
    price: product.referencePrice,
    currency: product.referenceCurrency,
    availability: "unknown",
    productUrl: product.productUrl,
    lastUpdated: product.provenance.lastUpdated,
  };
}

/**
 * Proveedor del catálogo inicial incluido en el repositorio.
 *
 * Es un `MockProvider` en el sentido del diseño: implementa el mismo contrato
 * que cualquier fuente real, de modo que la aplicación ya funciona hoy y el día
 * que entra un proveedor autorizado no hay que tocar nada aguas abajo.
 */
export class DemoSeedProvider extends BaseProvider {
  readonly descriptor: ProviderDescriptor = {
    id: "demo-seed",
    name: "Catálogo inicial (demo)",
    kind: "mock",
    categories: ["phone", "laptop", "cpu", "gpu"],
    countries: ["BO"],
    complianceNote:
      "Datos incluidos en el repositorio, marcados con confianza `demo`. No provienen de una fuente verificada y se reemplazan al conectar proveedores reales.",
    requiredEnv: [],
    capabilities: {
      catalog: true,
      prices: true,
      availability: false,
      images: false,
      search: true,
    },
    rateLimit: { requests: 1000, windowSeconds: 1, minDelayMs: 0 },
    schedule: { catalogMinutes: 24 * 60, priceMinutes: 24 * 60, availabilityMinutes: 24 * 60 },
  };

  isConfigured(): boolean {
    return true;
  }

  async getProducts(options?: ProviderListOptions): Promise<ProviderPage<RawProviderProduct>> {
    const items = allProducts
      .filter((product) => !options?.category || product.category === options.category)
      .map(toRaw);
    return { items: items.slice(0, options?.limit ?? items.length) };
  }

  async getProductById(externalId: string): Promise<RawProviderProduct | null> {
    const product = allProducts.find((item) => item.id === externalId);
    return product ? toRaw(product) : null;
  }

  async searchProducts({ query, category, limit = 20 }: ProviderSearchOptions) {
    const needle = query.toLowerCase();
    return allProducts
      .filter((product) => !category || product.category === category)
      .filter((product) => product.name.toLowerCase().includes(needle))
      .slice(0, limit)
      .map(toRaw);
  }
}

export const demoSeedProvider = new DemoSeedProvider();
