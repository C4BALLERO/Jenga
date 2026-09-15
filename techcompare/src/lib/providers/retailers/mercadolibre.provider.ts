import type {
  ProviderAvailability,
  ProviderDescriptor,
  ProviderListOptions,
  ProviderPage,
  ProviderPrice,
  ProviderSearchOptions,
  RawProviderProduct,
} from "@/types/providers";
import { BaseProvider } from "../base.provider";
import { providerFetch } from "../http";

const SITE_ENV = "MERCADOLIBRE_SITE_ID";

/** Identificadores de sitio de Mercado Libre y su país. */
const SITE_COUNTRIES: Record<string, string> = {
  MLA: "AR",
  MLB: "BR",
  MLC: "CL",
  MCO: "CO",
  MLM: "MX",
  MPE: "PE",
  MLU: "UY",
};
const TOKEN_ENV = "MERCADOLIBRE_ACCESS_TOKEN";

interface MeliItem {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  permalink: string;
  thumbnail?: string;
  available_quantity?: number;
  attributes?: { id: string; name: string; value_name?: string | null }[];
}

/**
 * Mercado Libre publica una API oficial documentada
 * (https://developers.mercadolibre.com). Las llamadas de búsqueda por sitio
 * requieren un token de aplicación, por lo que este proveedor permanece
 * inactivo hasta que se configuren credenciales propias.
 *
 * Aviso para el mercado objetivo: Mercado Libre no tiene sitio en Bolivia
 * (MLA Argentina, MLB Brasil, MLC Chile, MCO Colombia, MLM México, MPE Perú,
 * MLU Uruguay). Sus precios sirven de referencia regional, no de oferta local.
 *
 * No se elude autenticación ni límites: todas las peticiones pasan por
 * `providerFetch`, que aplica rate limiting y backoff.
 */
export class MercadoLibreProvider extends BaseProvider {
  readonly descriptor: ProviderDescriptor = {
    id: "mercadolibre",
    name: "Mercado Libre",
    kind: "retailer",
    categories: ["phone", "laptop", "cpu", "gpu"],
    countries: ["AR", "BR", "CL", "CO", "MX", "PE", "UY"],
    docsUrl: "https://developers.mercadolibre.com",
    complianceNote:
      "API oficial documentada (developers.mercadolibre.com). El recurso de búsqueda por sitio es público pero ya exige token de aplicación, así que requiere una app registrada propia. Mercado Libre NO opera en Bolivia: sirve como referencia regional de precios, no como oferta local.",
    requiredEnv: [TOKEN_ENV],
    capabilities: {
      catalog: true,
      prices: true,
      availability: true,
      images: true,
      search: true,
    },
    rateLimit: { requests: 60, windowSeconds: 60, minDelayMs: 400 },
    schedule: { catalogMinutes: 24 * 60, priceMinutes: 60, availabilityMinutes: 120 },
  };

  private get site(): string {
    return process.env[SITE_ENV] ?? "MLA";
  }

  private get authHeaders(): Record<string, string> {
    const token = process.env[TOKEN_ENV];
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private toRaw(item: MeliItem): RawProviderProduct {
    const specifications: Record<string, unknown> = {};
    for (const attribute of item.attributes ?? []) {
      if (attribute.value_name) specifications[attribute.name] = attribute.value_name;
    }

    return {
      externalId: item.id,
      provider: this.descriptor.id,
      brand: item.attributes?.find((a) => a.id === "BRAND")?.value_name ?? undefined,
      model: item.attributes?.find((a) => a.id === "MODEL")?.value_name ?? undefined,
      name: item.title,
      images: item.thumbnail ? [item.thumbnail] : [],
      specifications,
      price: item.price,
      currency: item.currency_id,
      availability: (item.available_quantity ?? 0) > 0 ? "in_stock" : "out_of_stock",
      productUrl: item.permalink,
      sourceUrl: item.permalink,
      lastUpdated: new Date().toISOString(),
    };
  }

  private async search(query: string, limit: number): Promise<MeliItem[]> {
    const url = `https://api.mercadolibre.com/sites/${this.site}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await providerFetch(url, {
      providerId: this.descriptor.id,
      rateLimit: this.descriptor.rateLimit,
      headers: this.authHeaders,
    });
    const payload = (await response.json()) as { results?: MeliItem[] };
    return payload.results ?? [];
  }

  async searchProducts({ query, limit = 20 }: ProviderSearchOptions): Promise<RawProviderProduct[]> {
    if (!this.isConfigured()) return [];
    const results = await this.search(query, limit);
    return results.map((item) => this.toRaw(item));
  }

  async getProducts(options?: ProviderListOptions): Promise<ProviderPage<RawProviderProduct>> {
    if (!this.isConfigured()) return { items: [] };
    const seeds: Record<string, string> = {
      phone: "celular smartphone",
      laptop: "laptop notebook",
      cpu: "procesador cpu",
      gpu: "tarjeta de video gpu",
    };
    const query = seeds[options?.category ?? "phone"] ?? "tecnologia";
    const results = await this.search(query, options?.limit ?? 50);
    return { items: results.map((item) => this.toRaw(item)) };
  }

  async getProductById(externalId: string): Promise<RawProviderProduct | null> {
    if (!this.isConfigured()) return null;
    const response = await providerFetch(`https://api.mercadolibre.com/items/${externalId}`, {
      providerId: this.descriptor.id,
      rateLimit: this.descriptor.rateLimit,
      headers: this.authHeaders,
    });
    const item = (await response.json()) as MeliItem;
    return item?.id ? this.toRaw(item) : null;
  }

  async getPrices(externalIds: string[]): Promise<ProviderPrice[]> {
    if (!this.isConfigured() || externalIds.length === 0) return [];
    const prices: ProviderPrice[] = [];

    for (const externalId of externalIds) {
      const item = await this.getProductById(externalId);
      if (!item || typeof item.price !== "number") continue;
      prices.push({
        externalId,
        provider: this.descriptor.id,
        price: item.price,
        currency: item.currency === "USD" ? "USD" : "BOB",
        productUrl: item.productUrl,
        retrievedAt: new Date().toISOString(),
      });
    }

    return prices;
  }

  async getAvailability(externalIds: string[]): Promise<ProviderAvailability[]> {
    if (!this.isConfigured()) return [];
    const out: ProviderAvailability[] = [];

    for (const externalId of externalIds) {
      const item = await this.getProductById(externalId);
      if (!item) continue;
      out.push({
        externalId,
        provider: this.descriptor.id,
        availability:
          item.availability === "in_stock" || item.availability === "out_of_stock"
            ? item.availability
            : "unknown",
        country: SITE_COUNTRIES[this.site] ?? "AR",
        retrievedAt: new Date().toISOString(),
      });
    }

    return out;
  }
}

export const mercadoLibreProvider = new MercadoLibreProvider();
