import type { CountryCode } from "@/types/common";

/**
 * Formas "crudas" del catálogo inicial.
 *
 * Contienen únicamente hechos de ficha técnica. Todos los índices comparativos
 * (rendimiento, gaming, cámara, batería, valor…) se CALCULAN a partir de estos
 * campos en `src/lib/scoring`, para que no existan puntuaciones escritas a mano
 * dentro de los datos ni dentro de los componentes.
 */
export interface SeedBase {
  slug: string;
  brandSlug: string;
  model: string;
  releaseYear: number;
  /** Precio de referencia en la moneda indicada. */
  price: number;
  currency?: "BOB" | "USD";
  description?: string;
  productUrl?: string;
  availableIn?: CountryCode[];
  image?: string;
}

export interface PhoneSeed extends SeedBase {
  screenSize: number;
  resolution: string;
  refreshRate: number;
  panel: string;
  chipset: string;
  chipsetSlug?: string;
  /** Índice sintético de potencia del SoC (0-100) usado para derivar métricas. */
  socIndex: number;
  ram: number;
  storage: number;
  mainCamera: number;
  cameraCount: number;
  frontCamera: number;
  opticalZoom?: number;
  battery: number;
  fastCharge: number;
  os: "Android" | "iOS";
  osVersion: string;
  fiveG: boolean;
  nfc: boolean;
  weight: number;
  waterResistance?: string;
}

export interface LaptopSeed extends SeedBase {
  cpu: string;
  cpuSlug?: string;
  cpuIndex: number;
  gpu: string;
  gpuSlug?: string;
  gpuIndex: number;
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
}

export interface CpuSeed extends SeedBase {
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
}

export interface GpuSeed extends SeedBase {
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
  /** FPS medios estimados, escala interna comparable entre tarjetas. */
  fps1080p: number;
  fps1440p: number;
  fps4k: number;
}
