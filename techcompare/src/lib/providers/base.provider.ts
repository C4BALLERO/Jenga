import type {
  ProviderAvailability,
  ProviderBrandInfo,
  ProviderCategoryInfo,
  ProviderDescriptor,
  ProviderListOptions,
  ProviderPage,
  ProviderPrice,
  ProviderSearchOptions,
  RawProviderProduct,
} from "@/types/providers";
import { ProductProvider } from "./provider.interface";

/**
 * Implementación base "vacía pero válida".
 *
 * Sirve para dos casos reales del proyecto:
 *  1. Marcas que hoy NO publican una API de catálogo abierta. En lugar de
 *     inventar endpoints, se registra el proveedor con `isConfigured() === false`
 *     y queda listo para conectar el día que exista un acuerdo o feed oficial.
 *  2. Proveedores que solo cubren parte del contrato (p. ej. solo precios).
 */
export abstract class BaseProvider implements ProductProvider {
  abstract readonly descriptor: ProviderDescriptor;

  isConfigured(): boolean {
    return this.descriptor.requiredEnv.every((key) => Boolean(process.env[key]));
  }

  async healthCheck(): Promise<{ ok: boolean; message?: string }> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message: `Pendiente de credenciales: ${this.descriptor.requiredEnv.join(", ") || "integración no disponible"}`,
      };
    }
    return { ok: true };
  }

  async getProducts(_options?: ProviderListOptions): Promise<ProviderPage<RawProviderProduct>> {
    void _options;
    return { items: [] };
  }

  async getProductById(_externalId: string): Promise<RawProviderProduct | null> {
    void _externalId;
    return null;
  }

  async searchProducts(_options: ProviderSearchOptions): Promise<RawProviderProduct[]> {
    void _options;
    return [];
  }

  async getCategories(): Promise<ProviderCategoryInfo[]> {
    return this.descriptor.categories.map((category) => ({
      id: category,
      name: category,
      mapsTo: category,
    }));
  }

  async getBrands(): Promise<ProviderBrandInfo[]> {
    return [];
  }

  async getPrices(_externalIds: string[]): Promise<ProviderPrice[]> {
    void _externalIds;
    return [];
  }

  async getAvailability(_externalIds: string[]): Promise<ProviderAvailability[]> {
    void _externalIds;
    return [];
  }

  async getProductImages(_externalId: string): Promise<string[]> {
    void _externalId;
    return [];
  }
}
