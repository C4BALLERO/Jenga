import type { Currency, ProductCategory } from "./common";

/**
 * Estado operativo de un proveedor, tal y como se muestra en /admin/providers.
 */
export type ProviderStatus =
  | "connected"
  | "not_configured"
  | "disabled"
  | "degraded"
  | "error";

export type ProviderKind = "brand" | "retailer" | "feed" | "manual" | "mock";

export type SyncStatus = "RUNNING" | "SUCCESS" | "PARTIAL" | "FAILED";

export interface ProviderCapabilities {
  catalog: boolean;
  prices: boolean;
  availability: boolean;
  images: boolean;
  search: boolean;
}

export interface ProviderRateLimit {
  /** Peticiones permitidas por ventana. */
  requests: number;
  /** Tamaño de la ventana en segundos. */
  windowSeconds: number;
  /** Espaciado mínimo recomendado entre peticiones, en milisegundos. */
  minDelayMs: number;
}

export interface ProviderSchedule {
  /** Cada cuántos minutos conviene sincronizar el catálogo. */
  catalogMinutes: number;
  priceMinutes: number;
  availabilityMinutes: number;
}

export interface ProviderDescriptor {
  id: string;
  name: string;
  kind: ProviderKind;
  categories: ProductCategory[];
  /** Países donde el proveedor aporta ofertas reales. */
  countries: string[];
  /** Documentación oficial consultada / punto de partida para la integración. */
  docsUrl?: string;
  /**
   * Notas de cumplimiento: qué permite la fuente y qué NO se hace.
   * Se muestra en el panel de administración.
   */
  complianceNote: string;
  /** Variables de entorno necesarias para activar el proveedor. */
  requiredEnv: string[];
  capabilities: ProviderCapabilities;
  rateLimit: ProviderRateLimit;
  schedule: ProviderSchedule;
}

/** Producto tal y como lo devuelve un proveedor, antes de normalizar. */
export interface RawProviderProduct {
  externalId: string;
  provider: string;
  brand?: string;
  model?: string;
  name: string;
  description?: string;
  category?: string;
  images?: string[];
  /** Claves heterogéneas: `RAM`, `memory`, `ram_size`, … */
  specifications: Record<string, unknown>;
  price?: number;
  currency?: string;
  availability?: string;
  productUrl?: string;
  sourceUrl?: string;
  lastUpdated?: string;
}

export interface ProviderPrice {
  externalId: string;
  provider: string;
  price: number;
  currency: Currency;
  productUrl?: string;
  retrievedAt: string;
}

export interface ProviderAvailability {
  externalId: string;
  provider: string;
  availability: "in_stock" | "out_of_stock" | "preorder" | "unknown";
  country: string;
  retrievedAt: string;
}

export interface ProviderCategoryInfo {
  id: string;
  name: string;
  mapsTo?: ProductCategory;
}

export interface ProviderBrandInfo {
  id: string;
  name: string;
}

export interface ProviderSearchOptions {
  query: string;
  category?: ProductCategory;
  limit?: number;
}

export interface ProviderListOptions {
  category?: ProductCategory;
  /** Sincronización incremental: solo cambios desde esta marca de tiempo. */
  updatedSince?: string;
  cursor?: string;
  limit?: number;
}

export interface ProviderPage<T> {
  items: T[];
  nextCursor?: string;
}

export interface SyncLogEntry {
  id: string;
  provider: string;
  startTime: string;
  endTime?: string;
  productsProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  productsDeleted: number;
  errors: string[];
  status: SyncStatus;
  durationMs?: number;
}

export interface ProviderHealth {
  providerId: string;
  status: ProviderStatus;
  configured: boolean;
  lastSync?: string;
  lastSuccess?: string;
  productCount: number;
  productsUpdated: number;
  productsCreated: number;
  errorCount: number;
  consecutiveFailures: number;
  /** Cuándo se reactiva un proveedor desactivado por errores repetidos. */
  disabledUntil?: string;
  lastDurationMs?: number;
  message?: string;
}
