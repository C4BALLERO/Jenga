import { brandName } from "@/data/brands";
import type { CpuSeed, GpuSeed, LaptopSeed, PhoneSeed, SeedBase } from "@/data/seed-types";
import type { CountryCode, DataProvenance } from "@/types/common";
import type { Cpu, Gpu, Laptop, Phone } from "@/types/products";
import {
  clamp,
  logScale,
  normalizeSeries,
  panelScore,
  pixelCount,
  ppi,
  refreshScore,
  round,
  scale,
  stableHash,
} from "./math";

/**
 * Procedencia aplicada al catálogo inicial. `confidence: "demo"` hace que la
 * interfaz muestre el aviso de dato no verificado en cada ficha.
 */
export const DEMO_PROVENANCE_SOURCE = "demo-seed";

export function demoProvenance(lastUpdated: string): DataProvenance {
  return {
    source: DEMO_PROVENANCE_SOURCE,
    sourceLabel: "Catálogo inicial de demostración",
    lastUpdated,
    confidence: "demo",
  };
}

/** Fecha estable por producto para no romper la hidratación entre servidor y cliente. */
function seededTimestamp(slug: string): string {
  const base = Date.UTC(2026, 0, 15, 12, 0, 0);
  const offsetHours = stableHash(slug) % 72;
  return new Date(base - offsetHours * 3_600_000).toISOString();
}

/**
 * Compone el nombre comercial evitando duplicar la marca cuando el modelo ya la
 * incluye ("OnePlus 13R", "vivo V50", "Xiaomi 15").
 */
function composeName(brand: string, model: string): string {
  return model.toLowerCase().startsWith(brand.toLowerCase()) ? model : `${brand} ${model}`;
}

const DEFAULT_AVAILABILITY: CountryCode[] = ["BO", "PE", "CL", "AR", "CO", "MX"];

function availabilityFor(seed: SeedBase): CountryCode[] {
  if (seed.availableIn) return seed.availableIn;
  // Los productos más caros llegan de forma irregular al canal boliviano.
  return seed.price > 15000 ? ["BO", "CL", "MX"] : DEFAULT_AVAILABILITY;
}

/**
 * Señal de popularidad determinista: combina lo reciente del producto, su
 * accesibilidad de precio y una dispersión estable por slug. Se sustituye por
 * métricas reales de tráfico cuando la analítica esté conectada.
 */
function popularityOf(seed: SeedBase, priceScoreValue: number): number {
  const recency = scale(seed.releaseYear, 2022, 2026);
  const jitter = (stableHash(seed.slug) % 17) - 8;
  return round(clamp(0.45 * recency + 0.4 * priceScoreValue + 15 + jitter));
}

function ramScore(ram: number): number {
  return logScale(ram, 3, 24);
}

// ---------------------------------------------------------------------------
// Teléfonos
// ---------------------------------------------------------------------------

export function buildPhones(seeds: PhoneSeed[]): Phone[] {
  const performance = seeds.map((seed) => 0.72 * seed.socIndex + 0.28 * ramScore(seed.ram));
  const valueRaw = seeds.map((seed, index) =>
    seed.price > 0 ? performance[index] / Math.log10(seed.price + 10) : 0,
  );
  const valueScores = normalizeSeries(valueRaw);
  const affordability = normalizeSeries(seeds.map((seed) => -seed.price));

  return seeds.map((seed, index) => {
    const display = round(
      0.4 * refreshScore(seed.refreshRate) +
        0.35 * scale(ppi(seed.resolution, seed.screenSize), 260, 520) +
        0.25 * panelScore(seed.panel),
    );

    const camera = round(
      0.4 * logScale(seed.mainCamera, 8, 200) +
        0.2 * scale(seed.cameraCount, 1, 4) +
        0.2 * logScale(seed.frontCamera, 5, 50) +
        0.2 * scale(seed.opticalZoom ?? 1, 1, 5),
    );

    const battery = round(
      0.7 * scale(seed.battery, 3300, 6800) + 0.3 * logScale(seed.fastCharge, 15, 120),
    );

    const gaming = round(
      0.65 * seed.socIndex + 0.2 * refreshScore(seed.refreshRate) + 0.15 * ramScore(seed.ram),
    );

    const productivity = round(
      0.5 * seed.socIndex + 0.3 * ramScore(seed.ram) + 0.2 * logScale(seed.storage, 64, 1024),
    );

    return {
      id: `phone-${seed.slug}`,
      slug: seed.slug,
      category: "phone",
      brandSlug: seed.brandSlug,
      brandName: brandName(seed.brandSlug),
      model: seed.model,
      name: composeName(brandName(seed.brandSlug), seed.model),
      description:
        seed.description ??
        `${seed.model}: pantalla de ${seed.screenSize}" a ${seed.refreshRate} Hz, ${seed.ram} GB de RAM, ${seed.storage} GB de almacenamiento y batería de ${seed.battery} mAh.`,
      image: seed.image,
      releaseYear: seed.releaseYear,
      popularity: popularityOf(seed, affordability[index]),
      performanceScore: round(performance[index]),
      referencePrice: seed.price,
      referenceCurrency: seed.currency ?? "BOB",
      productUrl: seed.productUrl,
      availableIn: availabilityFor(seed),
      provenance: demoProvenance(seededTimestamp(seed.slug)),
      specs: {
        screenSize: seed.screenSize,
        resolution: seed.resolution,
        refreshRate: seed.refreshRate,
        panel: seed.panel,
        chipset: seed.chipset,
        chipsetSlug: seed.chipsetSlug,
        ram: seed.ram,
        storage: seed.storage,
        mainCamera: seed.mainCamera,
        cameraCount: seed.cameraCount,
        frontCamera: seed.frontCamera,
        battery: seed.battery,
        fastCharge: seed.fastCharge,
        os: seed.os,
        osVersion: seed.osVersion,
        fiveG: seed.fiveG,
        nfc: seed.nfc,
        weight: seed.weight,
        waterResistance: seed.waterResistance,
        scores: { gaming, camera, battery, display, productivity, value: valueScores[index] },
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Portátiles
// ---------------------------------------------------------------------------

export function buildLaptops(seeds: LaptopSeed[]): Laptop[] {
  const performance = seeds.map((seed) => 0.55 * seed.cpuIndex + 0.45 * seed.gpuIndex);
  const valueRaw = seeds.map((seed, index) =>
    seed.price > 0 ? performance[index] / Math.log10(seed.price + 10) : 0,
  );
  const valueScores = normalizeSeries(valueRaw);
  const affordability = normalizeSeries(seeds.map((seed) => -seed.price));

  return seeds.map((seed, index) => {
    const portability = round(
      0.6 * scale(-seed.weight, -2.5, -1.1) + 0.4 * scale(seed.battery, 45, 95),
    );

    const display = round(
      0.35 * refreshScore(seed.refreshRate) +
        0.35 * scale(ppi(seed.resolution, seed.screenSize), 130, 260) +
        0.3 * panelScore(seed.panel),
    );

    const gaming = round(0.7 * seed.gpuIndex + 0.3 * seed.cpuIndex);
    const productivity = round(
      0.6 * seed.cpuIndex + 0.25 * ramScore(seed.ram) + 0.15 * logScale(seed.storage, 256, 2048),
    );

    return {
      id: `laptop-${seed.slug}`,
      slug: seed.slug,
      category: "laptop",
      brandSlug: seed.brandSlug,
      brandName: brandName(seed.brandSlug),
      model: seed.model,
      name: composeName(brandName(seed.brandSlug), seed.model),
      description:
        seed.description ??
        `${seed.model}: ${seed.cpu}, ${seed.gpu}, ${seed.ram} GB ${seed.ramType} y ${seed.storage} GB ${seed.storageType}. Pantalla de ${seed.screenSize}" a ${seed.refreshRate} Hz.`,
      image: seed.image,
      releaseYear: seed.releaseYear,
      popularity: popularityOf(seed, affordability[index]),
      performanceScore: round(performance[index]),
      referencePrice: seed.price,
      referenceCurrency: seed.currency ?? "BOB",
      productUrl: seed.productUrl,
      availableIn: availabilityFor(seed),
      provenance: demoProvenance(seededTimestamp(seed.slug)),
      specs: {
        cpu: seed.cpu,
        cpuSlug: seed.cpuSlug,
        gpu: seed.gpu,
        gpuSlug: seed.gpuSlug,
        ram: seed.ram,
        ramType: seed.ramType,
        storage: seed.storage,
        storageType: seed.storageType,
        screenSize: seed.screenSize,
        resolution: seed.resolution,
        refreshRate: seed.refreshRate,
        panel: seed.panel,
        weight: seed.weight,
        battery: seed.battery,
        os: seed.os,
        ports: seed.ports,
        wireless: seed.wireless,
        scores: { gaming, productivity, portability, display, value: valueScores[index] },
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Procesadores
// ---------------------------------------------------------------------------

export function buildCpus(seeds: CpuSeed[]): Cpu[] {
  const single = normalizeSeries(seeds.map((seed) => seed.singleCore));
  const multi = normalizeSeries(seeds.map((seed) => seed.multiCore));
  const efficiency = normalizeSeries(seeds.map((seed) => seed.multiCore / Math.max(seed.tdp, 1)));
  const performance = seeds.map((_, index) => round(0.45 * single[index] + 0.55 * multi[index]));
  const valueRaw = seeds.map((seed, index) =>
    seed.price > 0 ? performance[index] / Math.log10(seed.price + 10) : 0,
  );
  const valueScores = normalizeSeries(valueRaw);
  const affordability = normalizeSeries(seeds.map((seed) => -seed.price));

  return seeds.map((seed, index) => {
    const gaming = round(0.75 * single[index] + 0.25 * multi[index]);
    const productivity = round(0.25 * single[index] + 0.75 * multi[index]);
    const editing = round(0.35 * single[index] + 0.65 * multi[index]);

    return {
      id: `cpu-${seed.slug}`,
      slug: seed.slug,
      category: "cpu",
      brandSlug: seed.brandSlug,
      brandName: brandName(seed.brandSlug),
      model: seed.model,
      name: seed.model,
      description:
        seed.description ??
        `${seed.model}: ${seed.cores} núcleos y ${seed.threads} hilos, arquitectura ${seed.architecture} en ${seed.process}, hasta ${seed.boostClock} GHz con ${seed.tdp} W de TDP.`,
      image: seed.image,
      releaseYear: seed.releaseYear,
      popularity: popularityOf(seed, seed.price > 0 ? affordability[index] : 60),
      performanceScore: performance[index],
      referencePrice: seed.price,
      referenceCurrency: seed.currency ?? "BOB",
      productUrl: seed.productUrl,
      availableIn: availabilityFor(seed),
      provenance: demoProvenance(seededTimestamp(seed.slug)),
      specs: {
        vendor: seed.vendor,
        segment: seed.segment,
        cores: seed.cores,
        performanceCores: seed.performanceCores,
        efficiencyCores: seed.efficiencyCores,
        threads: seed.threads,
        baseClock: seed.baseClock,
        boostClock: seed.boostClock,
        architecture: seed.architecture,
        process: seed.process,
        tdp: seed.tdp,
        socket: seed.socket,
        integratedGpu: seed.integratedGpu,
        singleCore: seed.singleCore,
        multiCore: seed.multiCore,
        gaming,
        productivity,
        scores: {
          gaming,
          productivity,
          editing,
          efficiency: efficiency[index],
          value: valueScores[index],
        },
      },
    };
  });
}

// ---------------------------------------------------------------------------
// Tarjetas gráficas
// ---------------------------------------------------------------------------

export function buildGpus(seeds: GpuSeed[]): Gpu[] {
  const productivityRaw = seeds.map(
    (seed) => 0.6 * logScale(seed.shaders, 2000, 22000) + 0.4 * logScale(seed.vram, 8, 32),
  );
  const productivity = normalizeSeries(productivityRaw);
  const efficiency = normalizeSeries(seeds.map((seed) => seed.fps1440p / Math.max(seed.tdp, 1)));
  const performance = seeds.map((seed) =>
    round(0.25 * seed.fps1080p + 0.45 * seed.fps1440p + 0.3 * seed.fps4k),
  );
  const valueRaw = seeds.map((seed, index) =>
    seed.price > 0 ? performance[index] / Math.log10(seed.price + 10) : 0,
  );
  const valueScores = normalizeSeries(valueRaw);
  const affordability = normalizeSeries(seeds.map((seed) => -seed.price));

  return seeds.map((seed, index) => ({
    id: `gpu-${seed.slug}`,
    slug: seed.slug,
    category: "gpu" as const,
    brandSlug: seed.brandSlug,
    brandName: brandName(seed.brandSlug),
    model: seed.model,
    name: seed.model,
    description:
      seed.description ??
      `${seed.model}: ${seed.vram} GB ${seed.vramType} sobre bus de ${seed.memoryBus} bits, arquitectura ${seed.architecture} y ${seed.tdp} W de consumo.`,
    image: seed.image,
    releaseYear: seed.releaseYear,
    popularity: popularityOf(seed, affordability[index]),
    performanceScore: performance[index],
    referencePrice: seed.price,
    referenceCurrency: seed.currency ?? ("BOB" as const),
    productUrl: seed.productUrl,
    availableIn: availabilityFor(seed),
    provenance: demoProvenance(seededTimestamp(seed.slug)),
    specs: {
      vendor: seed.vendor,
      vram: seed.vram,
      vramType: seed.vramType,
      memoryBus: seed.memoryBus,
      architecture: seed.architecture,
      process: seed.process,
      tdp: seed.tdp,
      baseClock: seed.baseClock,
      boostClock: seed.boostClock,
      shaders: seed.shaders,
      rayTracing: seed.rayTracing,
      rtCores: seed.rtCores,
      upscaling: seed.upscaling,
      fps1080p: seed.fps1080p,
      fps1440p: seed.fps1440p,
      fps4k: seed.fps4k,
      productivity: productivity[index],
      scores: {
        gaming: round(0.3 * seed.fps1080p + 0.45 * seed.fps1440p + 0.25 * seed.fps4k),
        p1080: seed.fps1080p,
        p1440: seed.fps1440p,
        p4k: seed.fps4k,
        productivity: productivity[index],
        efficiency: efficiency[index],
        value: valueScores[index],
      },
    },
  }));
}

export { pixelCount };
