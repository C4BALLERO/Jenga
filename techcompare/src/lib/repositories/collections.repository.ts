import { catalogByCategory } from "@/data/catalog";
import { collections, type Collection } from "@/data/collections";
import type { AnyProduct } from "@/types/products";
import { scoreOf, specValue } from "./spec-access";

export interface RankedProduct {
  product: AnyProduct;
  position: number;
  score: number;
  /** Frase que justifica la posición, construida con la métrica del ranking. */
  highlight: string;
}

function highlightFor(collection: Collection, product: AnyProduct, score: number): string {
  switch (collection.rankBy) {
    case "gaming":
      return `Índice de gaming ${score}/100 gracias a ${specValue(product, "chipset") ?? specValue(product, "gpu") ?? "su configuración"}.`;
    case "camera":
      return `${specValue(product, "mainCamera")} MP principales y ${specValue(product, "cameraCount")} cámaras traseras.`;
    case "battery":
      return `${specValue(product, "battery")} mAh con carga de ${specValue(product, "fastCharge")} W.`;
    case "portability":
      return `${specValue(product, "weight")} kg y ${specValue(product, "battery")} Wh de batería.`;
    case "p1080":
    case "p1440":
    case "p4k":
      return `${specValue(product, "vram")} GB de VRAM y arquitectura ${specValue(product, "architecture")}.`;
    case "editing":
      return `${specValue(product, "cores")} núcleos y ${specValue(product, "threads")} hilos para renderizar.`;
    case "value":
      return product.referencePrice > 0
        ? `Rendimiento ${product.performanceScore}/100 por ${product.referencePrice.toLocaleString("es-BO")} Bs.`
        : `Rendimiento ${product.performanceScore}/100.`;
    default:
      return `Puntuación ${score}/100 en el criterio de esta lista.`;
  }
}

export function rankCollection(collection: Collection): RankedProduct[] {
  const pool = catalogByCategory[collection.category] ?? [];

  const filtered = pool.filter((product) => {
    if (collection.maxPrice !== undefined) {
      if (product.referencePrice <= 0 || product.referencePrice > collection.maxPrice) return false;
    }
    if (collection.minPrice !== undefined && product.referencePrice < collection.minPrice) {
      return false;
    }
    if (collection.rankBy === "value" && product.referencePrice <= 0) return false;

    for (const [key, min] of Object.entries(collection.minSpecs ?? {})) {
      const value = specValue(product, key);
      if (typeof value !== "number" || value < min) return false;
    }
    for (const [key, expected] of Object.entries(collection.flags ?? {})) {
      if (specValue(product, key) !== expected) return false;
    }
    return true;
  });

  return filtered
    .map((product) => ({ product, score: Math.round(scoreOf(product, collection.rankBy)) }))
    .sort((a, b) => b.score - a.score || b.product.popularity - a.product.popularity)
    .slice(0, collection.limit ?? 8)
    .map((entry, index) => ({
      product: entry.product,
      position: index + 1,
      score: entry.score,
      highlight: highlightFor(collection, entry.product, entry.score),
    }));
}

export async function getCollection(slug: string): Promise<Collection | null> {
  return collections.find((collection) => collection.slug === slug) ?? null;
}

export async function getCollectionWithProducts(
  slug: string,
): Promise<{ collection: Collection; ranked: RankedProduct[] } | null> {
  const collection = await getCollection(slug);
  if (!collection) return null;
  return { collection, ranked: rankCollection(collection) };
}

/** Solo se publican colecciones que produzcan al menos tres resultados útiles. */
export function publishableCollections(): Collection[] {
  return collections.filter((collection) => rankCollection(collection).length >= 3);
}
