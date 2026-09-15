import type { ProductCategory } from "@/types/common";
import type {
  ProviderDescriptor,
  ProviderListOptions,
  ProviderPage,
  ProviderPrice,
  ProviderSearchOptions,
  RawProviderProduct,
} from "@/types/providers";
import { BaseProvider } from "../base.provider";
import { providerFetch } from "../http";
import { ProviderNotConfiguredError } from "../provider.interface";
import {
  detectFeedFormat,
  parseCsv,
  parseJsonItems,
  parseXmlItems,
  type FeedFormat,
} from "./parsers";

export interface FeedProviderConfig {
  id: string;
  name: string;
  categories: ProductCategory[];
  countries: string[];
  /** Variable de entorno que contiene la URL del feed autorizado. */
  urlEnv: string;
  /** Variable de entorno opcional con un token para feeds protegidos. */
  tokenEnv?: string;
  format?: FeedFormat;
  itemTag?: string;
  complianceNote: string;
  /** Mapa de columnas del feed a campos normalizados. */
  fieldMap?: Record<string, string>;
  catalogMinutes?: number;
  priceMinutes?: number;
}

const DEFAULT_FIELD_MAP: Record<string, string> = {
  id: "externalId",
  sku: "externalId",
  "g:id": "externalId",
  title: "name",
  name: "name",
  "g:title": "name",
  description: "description",
  "g:description": "description",
  brand: "brand",
  "g:brand": "brand",
  mpn: "model",
  model: "model",
  link: "productUrl",
  url: "productUrl",
  image_link: "image",
  image: "image",
  price: "price",
  "g:price": "price",
  currency: "currency",
  availability: "availability",
  "g:availability": "availability",
  category: "category",
  product_type: "category",
};

function pick(record: Record<string, unknown>, map: Record<string, string>) {
  const out: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};

  for (const [rawKey, rawValue] of Object.entries(record)) {
    const target = map[rawKey] ?? map[rawKey.toLowerCase()];
    if (target) {
      if (out[target] === undefined) out[target] = rawValue;
    } else {
      rest[rawKey] = rawValue;
    }
  }

  return { out, rest };
}

/**
 * Proveedor genérico para tiendas que no tienen API pero sí pueden entregar un
 * catálogo periódico en CSV, XML o JSON. Es la vía práctica para integrar
 * tiendas pequeñas de Bolivia y Latinoamérica sin recurrir a scraping.
 */
export class FeedProvider extends BaseProvider {
  readonly descriptor: ProviderDescriptor;
  private readonly config: FeedProviderConfig;

  constructor(config: FeedProviderConfig) {
    super();
    this.config = config;
    this.descriptor = {
      id: config.id,
      name: config.name,
      kind: "feed",
      categories: config.categories,
      countries: config.countries,
      complianceNote: config.complianceNote,
      requiredEnv: config.tokenEnv ? [config.urlEnv, config.tokenEnv] : [config.urlEnv],
      capabilities: {
        catalog: true,
        prices: true,
        availability: true,
        images: true,
        search: false,
      },
      rateLimit: { requests: 10, windowSeconds: 60, minDelayMs: 1000 },
      schedule: {
        catalogMinutes: config.catalogMinutes ?? 24 * 60,
        priceMinutes: config.priceMinutes ?? 6 * 60,
        availabilityMinutes: 3 * 60,
      },
    };
  }

  isConfigured(): boolean {
    return Boolean(process.env[this.config.urlEnv]);
  }

  private get feedUrl(): string {
    const url = process.env[this.config.urlEnv];
    if (!url) throw new ProviderNotConfiguredError(this.config.id, [this.config.urlEnv]);
    return url;
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    if (!this.isConfigured()) {
      return { ok: false, message: `Falta ${this.config.urlEnv}` };
    }
    try {
      await providerFetch(this.feedUrl, {
        providerId: this.descriptor.id,
        rateLimit: this.descriptor.rateLimit,
        method: "HEAD",
        maxRetries: 1,
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: (error as Error).message };
    }
  }

  private async fetchRecords(): Promise<Record<string, unknown>[]> {
    const token = this.config.tokenEnv ? process.env[this.config.tokenEnv] : undefined;

    const response = await providerFetch(this.feedUrl, {
      providerId: this.descriptor.id,
      rateLimit: this.descriptor.rateLimit,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const body = await response.text();
    const format =
      this.config.format ?? detectFeedFormat(this.feedUrl, response.headers.get("content-type"));

    if (format === "csv") return parseCsv(body);
    if (format === "xml") return parseXmlItems(body, this.config.itemTag);
    return parseJsonItems(body);
  }

  private toRawProduct(record: Record<string, unknown>): RawProviderProduct | null {
    const map = { ...DEFAULT_FIELD_MAP, ...(this.config.fieldMap ?? {}) };
    const { out, rest } = pick(record, map);

    const name = typeof out.name === "string" ? out.name : undefined;
    if (!name) return null;

    const externalId =
      typeof out.externalId === "string" && out.externalId
        ? out.externalId
        : name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const rawPrice = out.price;
    const priceText = typeof rawPrice === "string" ? rawPrice : String(rawPrice ?? "");
    const priceMatch = priceText.match(/-?\d+(?:[.,]\d+)?/);
    const price = priceMatch ? Number(priceMatch[0].replace(",", ".")) : undefined;
    const currencyMatch = priceText.match(/[A-Z]{3}/);

    const image = typeof out.image === "string" ? out.image : undefined;

    return {
      externalId,
      provider: this.descriptor.id,
      brand: typeof out.brand === "string" ? out.brand : undefined,
      model: typeof out.model === "string" ? out.model : undefined,
      name,
      description: typeof out.description === "string" ? out.description : undefined,
      category: typeof out.category === "string" ? out.category : undefined,
      images: image ? [image] : [],
      specifications: rest,
      price: Number.isFinite(price) ? price : undefined,
      currency:
        (typeof out.currency === "string" ? out.currency : undefined) ??
        currencyMatch?.[0] ??
        undefined,
      availability: typeof out.availability === "string" ? out.availability : undefined,
      productUrl: typeof out.productUrl === "string" ? out.productUrl : undefined,
      sourceUrl: this.isConfigured() ? this.feedUrl : undefined,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getProducts(options?: ProviderListOptions): Promise<ProviderPage<RawProviderProduct>> {
    if (!this.isConfigured()) return { items: [] };

    const records = await this.fetchRecords();
    const items = records
      .map((record) => this.toRawProduct(record))
      .filter((item): item is RawProviderProduct => item !== null);

    const limit = options?.limit ?? items.length;
    return { items: items.slice(0, limit) };
  }

  async searchProducts({ query, limit = 20 }: ProviderSearchOptions): Promise<RawProviderProduct[]> {
    const { items } = await this.getProducts();
    const needle = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(needle)).slice(0, limit);
  }

  async getPrices(externalIds: string[]): Promise<ProviderPrice[]> {
    if (!this.isConfigured()) return [];
    const wanted = new Set(externalIds);
    const { items } = await this.getProducts();

    return items
      .filter((item) => wanted.has(item.externalId) && typeof item.price === "number")
      .map((item) => ({
        externalId: item.externalId,
        provider: this.descriptor.id,
        price: item.price as number,
        currency: (item.currency === "USD" || item.currency === "EUR" ? item.currency : "BOB") as
          | "BOB"
          | "USD"
          | "EUR",
        productUrl: item.productUrl,
        retrievedAt: new Date().toISOString(),
      }));
  }
}

export function createFeedProvider(config: FeedProviderConfig): FeedProvider {
  return new FeedProvider(config);
}
