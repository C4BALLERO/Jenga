import type { Confidence, Currency, ProductCategory } from "@/types/common";
import type { RawProviderProduct } from "@/types/providers";
import { normalizeSpecKey, type CanonicalSpecKey } from "./spec-aliases";
import {
  countCameras,
  normalizeAvailability,
  normalizeCurrency,
  toBoolean,
  toGigabytes,
  toGigahertz,
  toGrams,
  toHertz,
  toInches,
  toMegapixels,
  toMilliampHours,
  toPrice,
  toWatts,
} from "./units";

export interface NormalizedProduct {
  externalId: string;
  provider: string;
  slug: string;
  category: ProductCategory | null;
  brand: string | null;
  model: string | null;
  name: string;
  description: string | null;
  images: string[];
  specs: Partial<Record<CanonicalSpecKey, string | number | boolean>>;
  /** Claves que el proveedor envió pero que el diccionario no reconoce. */
  unmappedSpecs: Record<string, unknown>;
  price: number | null;
  currency: Currency | null;
  availability: "in_stock" | "out_of_stock" | "preorder" | "unknown";
  productUrl: string | null;
  sourceUrl: string | null;
  lastUpdated: string;
  confidence: Confidence;
}

const CATEGORY_HINTS: { category: ProductCategory; words: string[] }[] = [
  { category: "phone", words: ["phone", "celular", "smartphone", "telefono", "móvil", "movil"] },
  { category: "laptop", words: ["laptop", "notebook", "portatil", "portátil", "macbook", "ultrabook"] },
  { category: "gpu", words: ["gpu", "graphics", "grafica", "gráfica", "geforce", "radeon", "arc "] },
  { category: "cpu", words: ["cpu", "procesador", "processor", "ryzen", "core i", "core ultra"] },
];

export function inferCategory(...hints: (string | undefined | null)[]): ProductCategory | null {
  const haystack = hints.filter(Boolean).join(" ").toLowerCase();
  for (const hint of CATEGORY_HINTS) {
    if (hint.words.some((word) => haystack.includes(word))) return hint.category;
  }
  return null;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Convierte un valor crudo a la unidad canónica de su clave. */
function normalizeSpecValue(key: CanonicalSpecKey, value: unknown): string | number | boolean | null {
  switch (key) {
    case "ram":
    case "storage":
    case "vram":
      return toGigabytes(value);
    case "battery":
      return toMilliampHours(value);
    case "weight":
      return toGrams(value);
    case "baseClock":
    case "boostClock":
      return toGigahertz(value);
    case "screenSize":
      return toInches(value);
    case "refreshRate":
      return toHertz(value);
    case "tdp":
    case "fastCharge":
      return toWatts(value);
    case "mainCamera":
    case "frontCamera":
      return toMegapixels(value);
    case "cameraCount":
      return typeof value === "number" ? value : countCameras(value);
    case "cores":
    case "threads":
      return typeof value === "number" ? value : Number(String(value).replace(/\D/g, "")) || null;
    case "fiveG":
    case "nfc":
      return toBoolean(value);
    case "price":
      return toPrice(value);
    case "currency":
      return normalizeCurrency(value);
    default:
      return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
        ? value
        : null;
  }
}

/**
 * Punto único de entrada de datos externos al dominio.
 *
 * Toda respuesta de proveedor pasa por aquí antes de tocar la base de datos:
 * claves canónicas, unidades homogéneas y trazabilidad de la fuente.
 */
export function normalizeProduct(
  raw: RawProviderProduct,
  options: { confidence?: Confidence } = {},
): NormalizedProduct {
  const specs: NormalizedProduct["specs"] = {};
  const unmappedSpecs: Record<string, unknown> = {};

  for (const [rawKey, rawValue] of Object.entries(raw.specifications ?? {})) {
    const canonical = normalizeSpecKey(rawKey);
    if (!canonical) {
      unmappedSpecs[rawKey] = rawValue;
      continue;
    }
    const value = normalizeSpecValue(canonical, rawValue);
    if (value !== null && specs[canonical] === undefined) specs[canonical] = value;
  }

  const category = inferCategory(raw.category, raw.name, raw.description);
  const brand = raw.brand?.trim() || null;
  const model = raw.model?.trim() || null;

  return {
    externalId: raw.externalId,
    provider: raw.provider,
    slug: slugify(raw.name),
    category,
    brand,
    model,
    name: raw.name.trim(),
    description: raw.description?.trim() || null,
    images: (raw.images ?? []).filter((image) => /^https?:\/\//.test(image)),
    specs,
    unmappedSpecs,
    price: typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : null,
    currency: normalizeCurrency(raw.currency),
    availability: normalizeAvailability(raw.availability),
    productUrl: raw.productUrl ?? null,
    sourceUrl: raw.sourceUrl ?? null,
    lastUpdated: raw.lastUpdated ?? new Date().toISOString(),
    confidence: options.confidence ?? "reported",
  };
}

export function normalizeMany(
  items: RawProviderProduct[],
  options?: { confidence?: Confidence },
): NormalizedProduct[] {
  return items.map((item) => normalizeProduct(item, options));
}
