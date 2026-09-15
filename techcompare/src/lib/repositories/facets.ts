import type { FacetGroup, ProductCategory } from "@/types";
import type { AnyProduct } from "@/types/products";
import { specString, specValue } from "./spec-access";

interface FacetDefinition {
  key: string;
  label: string;
  type: FacetGroup["type"];
  unit?: string;
  /** Para facetas numéricas: valores mínimos seleccionables. */
  steps?: number[];
  /** Cómo se obtiene el valor mostrable de un producto. */
  read?: (product: AnyProduct) => string | null;
}

/**
 * Definición declarativa de los filtros de cada categoría.
 * Añadir un filtro nuevo es añadir una entrada aquí: la UI y la API lo recogen
 * automáticamente.
 */
export const FACET_DEFINITIONS: Record<ProductCategory, FacetDefinition[]> = {
  phone: [
    { key: "brand", label: "Marca", type: "checkbox" },
    { key: "price", label: "Precio", type: "range", unit: "Bs" },
    { key: "ram", label: "RAM mínima", type: "select", unit: "GB", steps: [4, 6, 8, 12, 16] },
    {
      key: "storage",
      label: "Almacenamiento mínimo",
      type: "select",
      unit: "GB",
      steps: [64, 128, 256, 512],
    },
    { key: "chipset", label: "Procesador", type: "checkbox" },
    {
      key: "mainCamera",
      label: "Cámara principal mínima",
      type: "select",
      unit: "MP",
      steps: [12, 48, 50, 108, 200],
    },
    {
      key: "battery",
      label: "Batería mínima",
      type: "select",
      unit: "mAh",
      steps: [4000, 4500, 5000, 5500, 6000],
    },
    { key: "os", label: "Sistema operativo", type: "checkbox" },
    { key: "fiveG", label: "Solo con 5G", type: "toggle" },
    { key: "nfc", label: "Solo con NFC", type: "toggle" },
  ],
  laptop: [
    { key: "brand", label: "Marca", type: "checkbox" },
    { key: "price", label: "Precio", type: "range", unit: "Bs" },
    { key: "cpu", label: "Procesador", type: "checkbox" },
    { key: "gpu", label: "Gráfica", type: "checkbox" },
    { key: "ram", label: "RAM mínima", type: "select", unit: "GB", steps: [8, 16, 32, 64] },
    { key: "storage", label: "SSD mínimo", type: "select", unit: "GB", steps: [256, 512, 1024] },
    {
      key: "screenSize",
      label: "Tamaño de pantalla",
      type: "select",
      unit: '"',
      steps: [13, 14, 15, 16],
    },
    { key: "resolution", label: "Resolución", type: "checkbox" },
    { key: "refreshRate", label: "Hz mínimos", type: "select", unit: "Hz", steps: [60, 90, 120, 144, 165] },
    { key: "os", label: "Sistema operativo", type: "checkbox" },
  ],
  cpu: [
    { key: "brand", label: "Marca", type: "checkbox" },
    { key: "price", label: "Precio", type: "range", unit: "Bs" },
    { key: "segment", label: "Segmento", type: "checkbox" },
    { key: "cores", label: "Núcleos mínimos", type: "select", steps: [4, 6, 8, 12, 16] },
    { key: "threads", label: "Hilos mínimos", type: "select", steps: [8, 12, 16, 24, 32] },
    { key: "architecture", label: "Arquitectura", type: "checkbox" },
    { key: "socket", label: "Socket", type: "checkbox" },
    { key: "tdp", label: "TDP máximo", type: "select", unit: "W", steps: [65, 125, 170, 250] },
  ],
  gpu: [
    { key: "brand", label: "Marca", type: "checkbox" },
    { key: "price", label: "Precio", type: "range", unit: "Bs" },
    { key: "vram", label: "VRAM mínima", type: "select", unit: "GB", steps: [8, 10, 12, 16, 24] },
    { key: "architecture", label: "Arquitectura", type: "checkbox" },
    { key: "rayTracing", label: "Solo con ray tracing", type: "toggle" },
    { key: "tdp", label: "Consumo máximo", type: "select", unit: "W", steps: [150, 200, 250, 350, 600] },
  ],
};

function readFacetValue(product: AnyProduct, key: string): string | null {
  if (key === "brand") return product.brandName;
  if (key === "segment" || key === "architecture" || key === "socket") {
    return specString(product, key);
  }
  return specString(product, key);
}

/**
 * Construye las facetas disponibles a partir del conjunto de productos, con el
 * recuento real de cada opción para que no se ofrezcan filtros vacíos.
 */
export function buildFacets(category: ProductCategory, products: AnyProduct[]): FacetGroup[] {
  const definitions = FACET_DEFINITIONS[category];
  const prices = products.map((product) => product.referencePrice).filter((price) => price > 0);

  return definitions
    .map((definition): FacetGroup | null => {
      if (definition.type === "range") {
        return {
          key: definition.key,
          label: definition.label,
          type: "range",
          unit: definition.unit,
          min: prices.length ? Math.floor(Math.min(...prices) / 100) * 100 : 0,
          max: prices.length ? Math.ceil(Math.max(...prices) / 100) * 100 : 0,
        };
      }

      if (definition.type === "toggle") {
        const count = products.filter((product) => specValue(product, definition.key) === true).length;
        if (count === 0) return null;
        return { key: definition.key, label: definition.label, type: "toggle", options: [], min: count };
      }

      if (definition.type === "select") {
        const options = (definition.steps ?? []).map((step) => ({
          value: String(step),
          label: definition.unit ? `${step} ${definition.unit}` : String(step),
          count: products.filter((product) => {
            const value = specValue(product, definition.key);
            if (typeof value !== "number") return false;
            return definition.key === "tdp" ? value <= step : value >= step;
          }).length,
        }));
        return {
          key: definition.key,
          label: definition.label,
          type: "select",
          unit: definition.unit,
          options: options.filter((option) => option.count > 0),
        };
      }

      const counts = new Map<string, number>();
      for (const product of products) {
        const value = readFacetValue(product, definition.key);
        if (!value) continue;
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }

      const options = [...counts.entries()]
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

      if (options.length < 2) return null;
      return { key: definition.key, label: definition.label, type: "checkbox", options };
    })
    .filter((facet): facet is FacetGroup => facet !== null);
}
