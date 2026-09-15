import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases de Tailwind resolviendo conflictos entre utilidades. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600_000],
  ["month", 30 * 24 * 3600_000],
  ["day", 24 * 3600_000],
  ["hour", 3600_000],
  ["minute", 60_000],
];

/** "hace 3 horas", "hace 2 días". Referencia fija opcional para SSR estable. */
export function relativeTime(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) return formatter.format(Math.round(diff / ms), unit);
  }
  return "hace instantes";
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-BO", { dateStyle: "long" }).format(new Date(iso));
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/** Recorta un texto por palabras sin cortar a mitad. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

const listFormatter = new Intl.ListFormat("es", { style: "long", type: "conjunction" });

/** Une elementos como lo haría una persona: "a, b y c". */
export function joinList(items: string[]): string {
  return listFormatter.format(items);
}
