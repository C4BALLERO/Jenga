/**
 * Diccionario de sinónimos de especificaciones.
 *
 * Cada API o feed nombra las mismas cosas de forma distinta ("RAM", "memory",
 * "ram_size", "Memoria RAM"). Aquí se reduce todo a la clave canónica que usa
 * el dominio de TechCompare.
 */
export const CANONICAL_SPEC_KEYS = [
  "ram",
  "storage",
  "screenSize",
  "resolution",
  "refreshRate",
  "panel",
  "battery",
  "fastCharge",
  "mainCamera",
  "frontCamera",
  "cameraCount",
  "chipset",
  "cpu",
  "gpu",
  "vram",
  "cores",
  "threads",
  "baseClock",
  "boostClock",
  "tdp",
  "socket",
  "architecture",
  "process",
  "os",
  "weight",
  "dimensions",
  "fiveG",
  "nfc",
  "price",
  "currency",
  "color",
] as const;

export type CanonicalSpecKey = (typeof CANONICAL_SPEC_KEYS)[number];

const ALIASES: Record<CanonicalSpecKey, string[]> = {
  ram: ["ram", "memory", "ram_size", "ramsize", "memoria", "memoria ram", "system memory", "ram_gb"],
  storage: [
    "storage",
    "rom",
    "internal storage",
    "almacenamiento",
    "capacidad",
    "disk",
    "ssd",
    "hdd",
    "storage_gb",
    "capacity",
  ],
  screenSize: ["screen size", "screensize", "display size", "pantalla", "tamano de pantalla", "diagonal", "size_inches"],
  resolution: ["resolution", "display resolution", "resolucion", "screen resolution", "pixels"],
  refreshRate: ["refresh rate", "refreshrate", "hz", "tasa de refresco", "frecuencia de pantalla"],
  panel: ["panel", "display type", "tipo de pantalla", "screen technology"],
  battery: ["battery", "battery capacity", "bateria", "mah", "battery_mah", "capacidad bateria"],
  fastCharge: ["fast charge", "charging", "carga rapida", "charge power", "watts", "fast_charging"],
  mainCamera: ["main camera", "rear camera", "camera", "camara principal", "camara trasera", "primary camera"],
  frontCamera: ["front camera", "selfie camera", "camara frontal", "selfie"],
  cameraCount: ["camera count", "numero de camaras", "rear camera count"],
  chipset: ["chipset", "soc", "processor", "procesador", "cpu model", "platform"],
  cpu: ["cpu", "processor", "procesador", "cpu model"],
  gpu: ["gpu", "graphics", "graphics card", "tarjeta grafica", "video card"],
  vram: ["vram", "video memory", "memoria de video", "graphics memory"],
  cores: ["cores", "core count", "nucleos", "cpu cores"],
  threads: ["threads", "hilos", "thread count"],
  baseClock: ["base clock", "base frequency", "frecuencia base", "clock speed"],
  boostClock: ["boost clock", "turbo", "max frequency", "frecuencia turbo", "boost frequency"],
  tdp: ["tdp", "power", "consumo", "power draw", "wattage"],
  socket: ["socket", "zocalo", "cpu socket"],
  architecture: ["architecture", "arquitectura", "microarchitecture", "codename"],
  process: ["process", "proceso", "lithography", "litografia", "node", "fabrication"],
  os: ["os", "operating system", "sistema operativo", "platform os"],
  weight: ["weight", "peso", "weight_g", "item weight"],
  dimensions: ["dimensions", "dimensiones", "size", "medidas"],
  fiveG: ["5g", "five g", "5g support", "soporte 5g", "network 5g"],
  nfc: ["nfc", "nfc support", "soporte nfc"],
  price: ["price", "precio", "amount", "sale price", "current price"],
  currency: ["currency", "moneda", "currency code"],
  color: ["color", "colour", "colors"],
};

function simplify(key: string): string {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^g:/, "")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const LOOKUP = new Map<string, CanonicalSpecKey>();
for (const [canonical, aliases] of Object.entries(ALIASES) as [CanonicalSpecKey, string[]][]) {
  LOOKUP.set(simplify(canonical), canonical);
  for (const alias of aliases) LOOKUP.set(simplify(alias), canonical);
}

/** Devuelve la clave canónica de una especificación, o `null` si no se reconoce. */
export function normalizeSpecKey(rawKey: string): CanonicalSpecKey | null {
  return LOOKUP.get(simplify(rawKey)) ?? null;
}

export function isCanonicalSpecKey(key: string): key is CanonicalSpecKey {
  return (CANONICAL_SPEC_KEYS as readonly string[]).includes(key);
}
