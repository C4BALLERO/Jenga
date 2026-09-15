import type {
  Brand,
  Confidence,
  CountryCode,
  Currency,
  DataProvenance,
  ProductCategory,
  ScoreBreakdown,
} from "./common";

/** Campos comunes a todo producto maestro del catálogo. */
export interface ProductBase {
  id: string;
  slug: string;
  category: ProductCategory;
  brandSlug: string;
  brandName: string;
  model: string;
  /** Nombre comercial completo (marca + modelo). */
  name: string;
  description: string;
  /** Ruta de imagen. Si no existe se usa un placeholder generado. */
  image?: string;
  releaseYear: number;
  /** 0-100, señal interna de demanda usada para ordenar por popularidad. */
  popularity: number;
  /** 0-100, índice sintético de rendimiento comparable dentro de la categoría. */
  performanceScore: number;
  /** Precio de referencia en su moneda original. */
  referencePrice: number;
  referenceCurrency: Currency;
  productUrl?: string;
  availableIn: CountryCode[];
  provenance: DataProvenance;
}

export interface PhoneSpecs {
  screenSize: number;
  resolution: string;
  refreshRate: number;
  panel: string;
  chipset: string;
  chipsetSlug?: string;
  ram: number;
  storage: number;
  mainCamera: number;
  cameraCount: number;
  frontCamera: number;
  battery: number;
  fastCharge: number;
  os: "Android" | "iOS";
  osVersion: string;
  fiveG: boolean;
  nfc: boolean;
  weight: number;
  waterResistance?: string;
  scores: ScoreBreakdown;
}

export interface Phone extends ProductBase {
  category: "phone";
  specs: PhoneSpecs;
}

export interface LaptopSpecs {
  cpu: string;
  cpuSlug?: string;
  gpu: string;
  gpuSlug?: string;
  ram: number;
  ramType: string;
  storage: number;
  storageType: string;
  screenSize: number;
  resolution: string;
  refreshRate: number;
  panel: string;
  weight: number;
  battery: number;
  os: string;
  ports: string[];
  wireless: string;
  scores: ScoreBreakdown;
}

export interface Laptop extends ProductBase {
  category: "laptop";
  specs: LaptopSpecs;
}

export interface CpuSpecs {
  vendor: "Intel" | "AMD" | "Apple" | "Qualcomm";
  segment: "desktop" | "laptop" | "mobile";
  cores: number;
  performanceCores?: number;
  efficiencyCores?: number;
  threads: number;
  baseClock: number;
  boostClock: number;
  architecture: string;
  process: string;
  tdp: number;
  socket?: string;
  integratedGpu?: string;
  singleCore: number;
  multiCore: number;
  gaming: number;
  productivity: number;
  scores: ScoreBreakdown;
}

export interface Cpu extends ProductBase {
  category: "cpu";
  specs: CpuSpecs;
}

export interface GpuSpecs {
  vendor: "NVIDIA" | "AMD" | "Intel";
  vram: number;
  vramType: string;
  memoryBus: number;
  architecture: string;
  process: string;
  tdp: number;
  baseClock: number;
  boostClock: number;
  shaders: number;
  rayTracing: boolean;
  rtCores?: number;
  upscaling: string[];
  fps1080p: number;
  fps1440p: number;
  fps4k: number;
  productivity: number;
  scores: ScoreBreakdown;
}

export interface Gpu extends ProductBase {
  category: "gpu";
  specs: GpuSpecs;
}

export type AnyProduct = Phone | Laptop | Cpu | Gpu;

export type ProductOf<C extends ProductCategory> = C extends "phone"
  ? Phone
  : C extends "laptop"
    ? Laptop
    : C extends "cpu"
      ? Cpu
      : Gpu;

export type { Brand, Confidence, DataProvenance, ProductCategory };
