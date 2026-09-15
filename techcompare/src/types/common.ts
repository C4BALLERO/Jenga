/**
 * Tipos transversales del dominio TechCompare.
 * Estos tipos son la única fuente de verdad para la capa de UI: cualquier
 * proveedor externo se normaliza hacia estas formas antes de llegar al front.
 */

export type Currency = "BOB" | "USD" | "EUR";

export type CountryCode = "BO" | "PE" | "CL" | "AR" | "BR" | "MX" | "CO" | "EC" | "PY" | "UY";

export type ProductCategory = "phone" | "laptop" | "cpu" | "gpu";

/**
 * Nivel de confianza del dato. `demo` identifica de forma explícita los datos
 * iniciales de demostración que NO provienen de una fuente verificada.
 */
export type Confidence = "verified" | "reported" | "estimated" | "demo";

export interface DataProvenance {
  /** Identificador del proveedor que aportó el dato (p. ej. `demo-seed`). */
  source: string;
  /** Etiqueta legible de la fuente. */
  sourceLabel: string;
  /** URL oficial del producto o de la fuente del dato, si existe. */
  sourceUrl?: string;
  /** ISO-8601. */
  lastUpdated: string;
  confidence: Confidence;
}

export interface Money {
  amount: number;
  currency: Currency;
}

export interface Brand {
  slug: string;
  name: string;
  country?: string;
  website?: string;
  categories: ProductCategory[];
}

export interface Retailer {
  slug: string;
  name: string;
  country: CountryCode;
  website: string;
  /** `api` | `feed` | `manual`: cómo se obtienen los datos de esta tienda. */
  integration: "api" | "feed" | "manual";
}

export interface ProductOffer {
  id: string;
  productId: string;
  retailer: Retailer;
  /** Precio tal y como lo publica la tienda; nunca se convierte en base de datos. */
  originalPrice: number;
  originalCurrency: Currency;
  availability: "in_stock" | "out_of_stock" | "preorder" | "unknown";
  productUrl?: string;
  lastUpdated: string;
  shippingNote?: string;
}

export interface PricePoint {
  timestamp: string;
  price: number;
  currency: Currency;
}

export interface PriceHistory {
  productId: string;
  retailerSlug?: string;
  points: PricePoint[];
}

export interface ScoreBreakdown {
  [dimension: string]: number;
}

export interface SpecRow {
  key: string;
  label: string;
  /** Valor ya formateado para mostrar. */
  a: string;
  b: string;
  c?: string;
  /** Qué columna gana esta fila: índice 0/1/2, o null si empatan / no aplica. */
  winner: number | null;
  /** Ayuda contextual opcional para el usuario. */
  hint?: string;
}

export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}
