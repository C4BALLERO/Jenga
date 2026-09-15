import type { ProductCategory } from "@/types/common";
import { formatMoney } from "@/lib/currency/format";
import type { AnyProduct } from "@/types/products";
import { specValue } from "@/lib/repositories/spec-access";

export interface SpecFieldDefinition {
  key: string;
  label: string;
  /** `higher` / `lower`: qué dirección es mejor. `none`: no se declara ganador. */
  better: "higher" | "lower" | "none";
  format?: (value: unknown, product: AnyProduct) => string;
  hint?: string;
}

export interface SpecTableGroup {
  title: string;
  fields: SpecFieldDefinition[];
}

const yesNo = (value: unknown) => (value === true ? "Sí" : value === false ? "No" : "—");
const withUnit = (unit: string, decimals = 0) => (value: unknown) =>
  typeof value === "number" ? `${value.toFixed(decimals)} ${unit}` : "—";
const plain = (value: unknown) =>
  value === null || value === undefined || value === "" ? "—" : String(value);
const list = (value: unknown) => (Array.isArray(value) ? value.join(", ") : plain(value));

const priceField: SpecFieldDefinition = {
  key: "referencePrice",
  label: "Precio de referencia",
  better: "lower",
  format: (value, product) =>
    typeof value === "number" && value > 0
      ? formatMoney(value, product.referenceCurrency)
      : "No se vende por separado",
};

export const SPEC_TABLES: Record<ProductCategory, SpecTableGroup[]> = {
  phone: [
    {
      title: "General",
      fields: [
        priceField,
        { key: "releaseYear", label: "Año de lanzamiento", better: "higher", format: plain },
        { key: "weight", label: "Peso", better: "lower", format: withUnit("g") },
      ],
    },
    {
      title: "Pantalla",
      fields: [
        { key: "screenSize", label: "Tamaño", better: "none", format: withUnit('"', 1) },
        { key: "resolution", label: "Resolución", better: "none", format: plain },
        { key: "refreshRate", label: "Tasa de refresco", better: "higher", format: withUnit("Hz") },
        { key: "panel", label: "Tipo de panel", better: "none", format: plain },
      ],
    },
    {
      title: "Rendimiento",
      fields: [
        { key: "chipset", label: "Procesador", better: "none", format: plain },
        { key: "ram", label: "RAM", better: "higher", format: withUnit("GB") },
        { key: "storage", label: "Almacenamiento", better: "higher", format: withUnit("GB") },
        {
          key: "performanceScore",
          label: "Índice de rendimiento",
          better: "higher",
          format: (value) => (typeof value === "number" ? `${Math.round(value)}/100` : "—"),
          hint: "Índice interno comparable dentro de la categoría.",
        },
      ],
    },
    {
      title: "Cámara",
      fields: [
        { key: "mainCamera", label: "Cámara principal", better: "higher", format: withUnit("MP") },
        { key: "cameraCount", label: "Número de cámaras", better: "higher", format: plain },
        { key: "frontCamera", label: "Cámara frontal", better: "higher", format: withUnit("MP") },
      ],
    },
    {
      title: "Batería y carga",
      fields: [
        { key: "battery", label: "Capacidad", better: "higher", format: withUnit("mAh") },
        { key: "fastCharge", label: "Carga rápida", better: "higher", format: withUnit("W") },
      ],
    },
    {
      title: "Conectividad y software",
      fields: [
        { key: "os", label: "Sistema operativo", better: "none", format: plain },
        { key: "osVersion", label: "Versión", better: "none", format: plain },
        { key: "fiveG", label: "5G", better: "none", format: yesNo },
        { key: "nfc", label: "NFC", better: "none", format: yesNo },
        { key: "waterResistance", label: "Resistencia", better: "none", format: plain },
      ],
    },
  ],
  laptop: [
    {
      title: "General",
      fields: [
        priceField,
        { key: "releaseYear", label: "Año de lanzamiento", better: "higher", format: plain },
        { key: "weight", label: "Peso", better: "lower", format: withUnit("kg", 2) },
        { key: "os", label: "Sistema operativo", better: "none", format: plain },
      ],
    },
    {
      title: "Rendimiento",
      fields: [
        { key: "cpu", label: "Procesador", better: "none", format: plain },
        { key: "gpu", label: "Gráfica", better: "none", format: plain },
        { key: "ram", label: "RAM", better: "higher", format: withUnit("GB") },
        { key: "ramType", label: "Tipo de RAM", better: "none", format: plain },
        { key: "storage", label: "Almacenamiento", better: "higher", format: withUnit("GB") },
        { key: "storageType", label: "Tipo de disco", better: "none", format: plain },
        {
          key: "performanceScore",
          label: "Rendimiento estimado",
          better: "higher",
          format: (value) => (typeof value === "number" ? `${Math.round(value)}/100` : "—"),
        },
      ],
    },
    {
      title: "Pantalla",
      fields: [
        { key: "screenSize", label: "Tamaño", better: "none", format: withUnit('"', 1) },
        { key: "resolution", label: "Resolución", better: "none", format: plain },
        { key: "refreshRate", label: "Tasa de refresco", better: "higher", format: withUnit("Hz") },
        { key: "panel", label: "Tipo de panel", better: "none", format: plain },
      ],
    },
    {
      title: "Autonomía y conectividad",
      fields: [
        { key: "battery", label: "Batería", better: "higher", format: withUnit("Wh") },
        { key: "ports", label: "Puertos", better: "none", format: list },
        { key: "wireless", label: "Inalámbrico", better: "none", format: plain },
      ],
    },
  ],
  cpu: [
    {
      title: "General",
      fields: [
        priceField,
        { key: "vendor", label: "Fabricante", better: "none", format: plain },
        { key: "segment", label: "Segmento", better: "none", format: plain },
        { key: "releaseYear", label: "Año de lanzamiento", better: "higher", format: plain },
      ],
    },
    {
      title: "Arquitectura",
      fields: [
        { key: "cores", label: "Núcleos", better: "higher", format: plain },
        { key: "threads", label: "Hilos", better: "higher", format: plain },
        { key: "performanceCores", label: "Núcleos de rendimiento", better: "higher", format: plain },
        { key: "efficiencyCores", label: "Núcleos de eficiencia", better: "higher", format: plain },
        { key: "baseClock", label: "Frecuencia base", better: "higher", format: withUnit("GHz", 1) },
        { key: "boostClock", label: "Frecuencia turbo", better: "higher", format: withUnit("GHz", 1) },
        { key: "architecture", label: "Arquitectura", better: "none", format: plain },
        { key: "process", label: "Proceso de fabricación", better: "none", format: plain },
        { key: "tdp", label: "TDP", better: "lower", format: withUnit("W") },
        { key: "socket", label: "Socket", better: "none", format: plain },
        { key: "integratedGpu", label: "GPU integrada", better: "none", format: plain },
      ],
    },
    {
      title: "Rendimiento",
      fields: [
        { key: "singleCore", label: "Single-core", better: "higher", format: plain },
        { key: "multiCore", label: "Multi-core", better: "higher", format: plain },
        {
          key: "gaming",
          label: "Gaming",
          better: "higher",
          format: (value) => (typeof value === "number" ? `${Math.round(value)}/100` : "—"),
        },
        {
          key: "productivity",
          label: "Productividad",
          better: "higher",
          format: (value) => (typeof value === "number" ? `${Math.round(value)}/100` : "—"),
        },
      ],
    },
  ],
  gpu: [
    {
      title: "General",
      fields: [
        priceField,
        { key: "vendor", label: "Fabricante", better: "none", format: plain },
        { key: "releaseYear", label: "Año de lanzamiento", better: "higher", format: plain },
      ],
    },
    {
      title: "Especificaciones",
      fields: [
        { key: "vram", label: "VRAM", better: "higher", format: withUnit("GB") },
        { key: "vramType", label: "Tipo de memoria", better: "none", format: plain },
        { key: "memoryBus", label: "Bus de memoria", better: "higher", format: withUnit("bits") },
        { key: "shaders", label: "Núcleos / shaders", better: "higher", format: plain },
        { key: "architecture", label: "Arquitectura", better: "none", format: plain },
        { key: "process", label: "Proceso de fabricación", better: "none", format: plain },
        { key: "boostClock", label: "Frecuencia turbo", better: "higher", format: withUnit("GHz", 2) },
        { key: "tdp", label: "Consumo", better: "lower", format: withUnit("W") },
        { key: "rayTracing", label: "Ray tracing", better: "none", format: yesNo },
        { key: "upscaling", label: "Escalado por IA", better: "none", format: list },
      ],
    },
    {
      title: "Rendimiento en juego",
      fields: [
        { key: "fps1080p", label: "1080p", better: "higher", format: (v) => (typeof v === "number" ? `${v}/100` : "—") },
        { key: "fps1440p", label: "1440p", better: "higher", format: (v) => (typeof v === "number" ? `${v}/100` : "—") },
        { key: "fps4k", label: "4K", better: "higher", format: (v) => (typeof v === "number" ? `${v}/100` : "—") },
        {
          key: "productivity",
          label: "Productividad",
          better: "higher",
          format: (v) => (typeof v === "number" ? `${Math.round(v)}/100` : "—"),
        },
      ],
    },
  ],
};

export function readField(product: AnyProduct, field: SpecFieldDefinition): unknown {
  return specValue(product, field.key);
}

export function formatField(product: AnyProduct, field: SpecFieldDefinition): string {
  const value = readField(product, field);
  return field.format ? field.format(value, product) : plain(value);
}
