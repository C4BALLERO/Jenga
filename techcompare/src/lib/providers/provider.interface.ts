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

/**
 * Contrato único que implementa toda fuente de datos de producto.
 *
 * La aplicación nunca habla con una API externa directamente: habla con un
 * `ProductProvider`. Añadir una fuente nueva = añadir una clase que implemente
 * esta interfaz y registrarla en el `ProviderManager`.
 *
 * Reglas de cumplimiento para cualquier implementación:
 *  - Solo APIs oficiales, feeds autorizados o importaciones manuales.
 *  - Respetar siempre los límites de la fuente (`descriptor.rateLimit`).
 *  - Nunca eludir autenticación, CAPTCHAs ni protecciones anti-bot.
 *  - Si la fuente no expone API pública, el proveedor queda `not_configured`
 *    y devuelve conjuntos vacíos hasta que exista una integración autorizada.
 */
export interface ProductProvider {
  readonly descriptor: ProviderDescriptor;

  /** ¿Tiene el proveedor todo lo necesario (credenciales, endpoint) para operar? */
  isConfigured(): boolean;

  /** Comprobación ligera de conectividad; no debe consumir cuota significativa. */
  healthCheck(): Promise<{ ok: boolean; message?: string }>;

  getProducts(options?: ProviderListOptions): Promise<ProviderPage<RawProviderProduct>>;

  getProductById(externalId: string): Promise<RawProviderProduct | null>;

  searchProducts(options: ProviderSearchOptions): Promise<RawProviderProduct[]>;

  getCategories(): Promise<ProviderCategoryInfo[]>;

  getBrands(): Promise<ProviderBrandInfo[]>;

  getPrices(externalIds: string[]): Promise<ProviderPrice[]>;

  getAvailability(externalIds: string[]): Promise<ProviderAvailability[]>;

  getProductImages(externalId: string): Promise<string[]>;
}

/** Error tipado para distinguir fallos recuperables de los definitivos. */
export class ProviderError extends Error {
  constructor(
    message: string,
    readonly providerId: string,
    readonly retryable: boolean = true,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export class ProviderNotConfiguredError extends ProviderError {
  constructor(providerId: string, requiredEnv: string[]) {
    super(
      `El proveedor "${providerId}" no está configurado. Faltan variables: ${requiredEnv.join(", ") || "n/d"}`,
      providerId,
      false,
    );
    this.name = "ProviderNotConfiguredError";
  }
}
