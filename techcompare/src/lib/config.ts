import type { ProductCategory } from "@/types/common";
import { publicEnv } from "./env";

export const siteConfig = {
  name: "TechCompare",
  shortDescription: "Compara celulares, laptops, procesadores y GPUs antes de comprar.",
  description:
    "TechCompare es el comparador de tecnología para Bolivia y Latinoamérica: fichas técnicas, comparaciones lado a lado, rankings y herramientas para elegir el equipo que realmente te conviene.",
  url: publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""),
  locale: "es_BO",
  lang: "es",
  defaultCurrency: "BOB" as const,
  twitter: "@techcompare",
  keywords: [
    "comparar celulares",
    "comparar laptops",
    "comparar procesadores",
    "comparar GPUs",
    "precios Bolivia",
    "ficha técnica",
    "mejor celular calidad precio",
  ],
};

export interface CategoryConfig {
  key: ProductCategory;
  slug: string;
  label: string;
  singular: string;
  plural: string;
  icon: string;
  compareSlug: string;
  description: string;
  seoTitle: string;
}

export const categories: Record<ProductCategory, CategoryConfig> = {
  phone: {
    key: "phone",
    slug: "celulares",
    label: "Celulares",
    singular: "celular",
    plural: "celulares",
    icon: "smartphone",
    compareSlug: "celulares",
    description:
      "Filtra por marca, precio, RAM, cámara o batería y compara hasta tres celulares lado a lado.",
    seoTitle: "Comparar celulares: fichas técnicas, precios y rankings",
  },
  laptop: {
    key: "laptop",
    slug: "laptops",
    label: "Laptops",
    singular: "laptop",
    plural: "laptops",
    icon: "laptop",
    compareSlug: "laptops",
    description:
      "Compara portátiles por procesador, gráfica, pantalla, autonomía y peso antes de comprar.",
    seoTitle: "Comparar laptops: CPU, GPU, pantalla y autonomía",
  },
  cpu: {
    key: "cpu",
    slug: "procesadores",
    label: "Procesadores",
    singular: "procesador",
    plural: "procesadores",
    icon: "cpu",
    compareSlug: "procesadores",
    description:
      "Intel, AMD, Apple Silicon y Qualcomm cara a cara: núcleos, frecuencias, consumo y rendimiento.",
    seoTitle: "Comparar procesadores: Intel vs AMD vs Apple Silicon",
  },
  gpu: {
    key: "gpu",
    slug: "gpus",
    label: "GPUs",
    singular: "tarjeta gráfica",
    plural: "tarjetas gráficas",
    icon: "gpu",
    compareSlug: "gpus",
    description:
      "NVIDIA, AMD e Intel comparadas en 1080p, 1440p y 4K, con ray tracing y escalado por IA.",
    seoTitle: "Comparar GPUs: rendimiento en 1080p, 1440p y 4K",
  },
};

export const categoryList = Object.values(categories);

export const categoryBySlug = new Map(
  categoryList.map((category) => [category.slug, category]),
);

export function categoryFromSlug(slug: string): CategoryConfig | undefined {
  return categoryBySlug.get(slug);
}

export const features = {
  adsEnabled: publicEnv.NEXT_PUBLIC_ADS_ENABLED === "true",
  analyticsEnabled: Boolean(publicEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID),
};

export const PAGE_SIZE = 12;

/** Revalidación por defecto de páginas de catálogo, en segundos. */
export const CATALOG_REVALIDATE = 3600;
/** Las páginas con precio se refrescan más a menudo. */
export const PRICE_REVALIDATE = 900;
