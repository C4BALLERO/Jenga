import type { AnyProduct } from "@/types/products";

type SpecRecord = Record<string, unknown>;

/** Lectura segura de una especificación arbitraria de cualquier producto. */
export function specValue(product: AnyProduct, key: string): unknown {
  const specs = product.specs as unknown as SpecRecord;
  if (key in specs) return specs[key];

  const scores = specs.scores as SpecRecord | undefined;
  if (scores && key in scores) return scores[key];

  const base = product as unknown as SpecRecord;
  return base[key];
}

export function specNumber(product: AnyProduct, key: string): number | null {
  const value = specValue(product, key);
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function specString(product: AnyProduct, key: string): string | null {
  const value = specValue(product, key);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

export function specBoolean(product: AnyProduct, key: string): boolean | null {
  const value = specValue(product, key);
  return typeof value === "boolean" ? value : null;
}

/** Puntuación de una dimensión (`gaming`, `camera`, …) o 0 si no aplica. */
export function scoreOf(product: AnyProduct, dimension: string): number {
  const scores = (product.specs as unknown as SpecRecord).scores as
    | Record<string, number>
    | undefined;
  return scores?.[dimension] ?? 0;
}
