import type { Currency } from "@/types/common";
import { convertStatic } from "./exchange";

const SYMBOLS: Record<Currency, string> = {
  BOB: "Bs",
  USD: "US$",
  EUR: "€",
};

/**
 * Formateo consistente de precios. Se usa `es-BO`, que agrupa con punto y
 * separa decimales con coma, el formato esperado por el lector boliviano.
 */
export function formatMoney(amount: number, currency: Currency = "BOB", decimals = 0): string {
  const formatted = new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
  return `${SYMBOLS[currency]} ${formatted}`;
}

/** Precio principal en bolivianos con su equivalente aproximado en dólares. */
export function formatPriceWithUsd(amount: number, currency: Currency = "BOB"): {
  primary: string;
  secondary: string | null;
} {
  const bob = convertStatic(amount, currency, "BOB");
  const usd = convertStatic(amount, currency, "USD");
  return {
    primary: formatMoney(Math.round(bob), "BOB"),
    secondary: usd >= 1 ? `≈ ${formatMoney(Math.round(usd), "USD")}` : null,
  };
}

export function currencySymbol(currency: Currency): string {
  return SYMBOLS[currency];
}
