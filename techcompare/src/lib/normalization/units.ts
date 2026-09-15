/**
 * Conversión de valores heterogéneos a las unidades canónicas del dominio:
 * GB para memoria, mAh para batería, gramos para peso, GHz para frecuencia,
 * pulgadas para pantalla y vatios para consumo.
 */

function numberFrom(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const match = value.replace(/\s/g, "").match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function unitOf(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase() : "";
}

/** Memoria a GB. Acepta "8GB", "8192 MB", "1 TB", 8. */
export function toGigabytes(value: unknown): number | null {
  const amount = numberFrom(value);
  if (amount === null) return null;
  const unit = unitOf(value);

  if (unit.includes("tb")) return amount * 1024;
  if (unit.includes("mb")) return Math.round(amount / 1024);
  if (unit.includes("kb")) return Math.round(amount / 1024 / 1024);
  // Sin unidad: cifras grandes se interpretan como MB.
  if (!unit.includes("gb") && amount >= 1024) return Math.round(amount / 1024);
  return amount;
}

/** Batería a mAh. Acepta "5000 mAh", "5 Ah", 5000. */
export function toMilliampHours(value: unknown): number | null {
  const amount = numberFrom(value);
  if (amount === null) return null;
  const unit = unitOf(value);
  if (unit.includes("ah") && !unit.includes("mah")) return Math.round(amount * 1000);
  return Math.round(amount);
}

/** Peso a gramos. Acepta "189 g", "1.24 kg", "6.7 oz". */
export function toGrams(value: unknown): number | null {
  const amount = numberFrom(value);
  if (amount === null) return null;
  const unit = unitOf(value);
  if (unit.includes("kg")) return Math.round(amount * 1000);
  if (unit.includes("lb")) return Math.round(amount * 453.592);
  if (unit.includes("oz")) return Math.round(amount * 28.3495);
  if (!unit && amount < 10) return Math.round(amount * 1000);
  return Math.round(amount);
}

/** Frecuencia a GHz. Acepta "4.7 GHz", "4700 MHz", 4.7. */
export function toGigahertz(value: unknown): number | null {
  const amount = numberFrom(value);
  if (amount === null) return null;
  const unit = unitOf(value);
  if (unit.includes("mhz")) return Math.round((amount / 1000) * 100) / 100;
  if (!unit && amount > 100) return Math.round((amount / 1000) * 100) / 100;
  return amount;
}

/** Pulgadas de pantalla. Acepta '6.7"', "6,7 pulgadas", "170 mm". */
export function toInches(value: unknown): number | null {
  const amount = numberFrom(value);
  if (amount === null) return null;
  const unit = unitOf(value);
  if (unit.includes("mm")) return Math.round((amount / 25.4) * 10) / 10;
  if (unit.includes("cm")) return Math.round((amount / 2.54) * 10) / 10;
  return amount;
}

export function toWatts(value: unknown): number | null {
  return numberFrom(value);
}

export function toHertz(value: unknown): number | null {
  const amount = numberFrom(value);
  return amount === null ? null : Math.round(amount);
}

const TRUE_WORDS = new Set(["true", "si", "sí", "yes", "y", "1", "soportado", "supported", "available"]);
const FALSE_WORDS = new Set(["false", "no", "n", "0", "none", "not supported", "no soportado"]);

export function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return null;
  const text = value.trim().toLowerCase();
  if (TRUE_WORDS.has(text)) return true;
  if (FALSE_WORDS.has(text)) return false;
  return null;
}

/** Megapíxeles de cámara. Acepta "50 MP", "50MP + 8MP + 2MP" (toma el mayor). */
export function toMegapixels(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return null;
  const matches = [...value.matchAll(/(\d+(?:[.,]\d+)?)\s*mp/gi)].map((match) =>
    Number(match[1].replace(",", ".")),
  );
  if (matches.length > 0) return Math.max(...matches);
  return numberFrom(value);
}

/** Cuenta cuántos sensores describe una cadena de cámara. */
export function countCameras(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const matches = value.match(/(\d+(?:[.,]\d+)?)\s*mp/gi);
  return matches ? matches.length : null;
}

export function toPrice(value: unknown): number | null {
  return numberFrom(value);
}

export function normalizeCurrency(value: unknown): "BOB" | "USD" | "EUR" | null {
  if (typeof value !== "string") return null;
  const text = value.toUpperCase();
  if (text.includes("BOB") || text.includes("BS")) return "BOB";
  if (text.includes("USD") || text.includes("US$") || text.includes("$")) return "USD";
  if (text.includes("EUR") || text.includes("€")) return "EUR";
  return null;
}

export function normalizeAvailability(
  value: unknown,
): "in_stock" | "out_of_stock" | "preorder" | "unknown" {
  if (typeof value !== "string") return "unknown";
  const text = value.toLowerCase();
  if (text.includes("preorder") || text.includes("preventa")) return "preorder";
  if (text.includes("out") || text.includes("agotado") || text.includes("sin stock")) {
    return "out_of_stock";
  }
  if (text.includes("in stock") || text.includes("disponible") || text.includes("available")) {
    return "in_stock";
  }
  return "unknown";
}
