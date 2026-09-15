import type { NormalizedProduct } from "./normalizer";

/**
 * Detección de productos duplicados entre tiendas.
 *
 * El mismo equipo aparece como "ASUS ROG Zephyrus G16 32GB", "Zephyrus G16
 * (2025)" o "Notebook Asus ROG Zephyrus G16". El objetivo es agrupar todas esas
 * variantes bajo un único producto maestro con N ofertas.
 */

const NOISE_WORDS = new Set([
  "notebook",
  "laptop",
  "celular",
  "smartphone",
  "telefono",
  "movil",
  "nuevo",
  "original",
  "sellado",
  "libre",
  "dual",
  "sim",
  "gb",
  "tb",
  "ram",
  "color",
  "envio",
  "gratis",
  "oferta",
  "garantia",
]);

/** Reduce un nombre comercial a sus tokens significativos y ordenados. */
export function fingerprint(name: string, brand?: string | null): string {
  const tokens = `${brand ?? ""} ${name}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !NOISE_WORDS.has(token));

  return [...new Set(tokens)].sort().join("-");
}

/** Similitud de Jaccard entre dos conjuntos de tokens (0-1). */
export function similarity(a: string, b: string): number {
  const setA = new Set(a.split("-").filter(Boolean));
  const setB = new Set(b.split("-").filter(Boolean));
  if (setA.size === 0 || setB.size === 0) return 0;

  let shared = 0;
  for (const token of setA) if (setB.has(token)) shared += 1;
  return shared / (setA.size + setB.size - shared);
}

export interface MasterCandidate {
  id: string;
  name: string;
  brand?: string | null;
}

export interface MatchResult {
  masterId: string | null;
  score: number;
}

/** Umbral por encima del cual dos fichas se consideran el mismo producto. */
export const MATCH_THRESHOLD = 0.72;

export function findMaster(
  product: NormalizedProduct,
  candidates: MasterCandidate[],
  threshold = MATCH_THRESHOLD,
): MatchResult {
  const target = fingerprint(product.name, product.brand);
  let best: MatchResult = { masterId: null, score: 0 };

  for (const candidate of candidates) {
    const score = similarity(target, fingerprint(candidate.name, candidate.brand));
    if (score > best.score) best = { masterId: candidate.id, score };
  }

  return best.score >= threshold ? best : { masterId: null, score: best.score };
}

/** Agrupa un lote de productos normalizados en grupos de producto maestro. */
export function groupDuplicates(
  products: NormalizedProduct[],
  threshold = MATCH_THRESHOLD,
): NormalizedProduct[][] {
  const groups: { fingerprint: string; items: NormalizedProduct[] }[] = [];

  for (const product of products) {
    const target = fingerprint(product.name, product.brand);
    const match = groups.find((group) => similarity(group.fingerprint, target) >= threshold);
    if (match) match.items.push(product);
    else groups.push({ fingerprint: target, items: [product] });
  }

  return groups.map((group) => group.items);
}
