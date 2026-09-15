export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Escala lineal de `value` dentro de [min, max] al rango 0-100. */
export function scale(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return clamp(((value - min) / (max - min)) * 100);
}

/** Escala logarítmica: útil cuando duplicar la cifra no duplica la utilidad. */
export function logScale(value: number, min: number, max: number): number {
  if (value <= 0) return 0;
  const lo = Math.log(Math.max(min, 1));
  const hi = Math.log(Math.max(max, min + 1));
  return clamp(((Math.log(value) - lo) / (hi - lo)) * 100);
}

/** Normaliza una serie al rango 0-100 conservando las posiciones relativas. */
export function normalizeSeries(values: number[]): number[] {
  const finite = values.filter((value) => Number.isFinite(value));
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  return values.map((value) => (Number.isFinite(value) ? round(scale(value, min, max)) : 0));
}

export function parseResolution(resolution: string): { width: number; height: number } {
  const match = resolution.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!match) return { width: 0, height: 0 };
  const a = Number(match[1]);
  const b = Number(match[2]);
  return { width: Math.max(a, b), height: Math.min(a, b) };
}

export function pixelCount(resolution: string): number {
  const { width, height } = parseResolution(resolution);
  return width * height;
}

/** Píxeles por pulgada aproximados a partir de la resolución y el tamaño. */
export function ppi(resolution: string, diagonalInches: number): number {
  const { width, height } = parseResolution(resolution);
  if (!width || !height || !diagonalInches) return 0;
  return Math.round(Math.hypot(width, height) / diagonalInches);
}

export function refreshScore(hz: number): number {
  if (hz >= 165) return 100;
  if (hz >= 144) return 94;
  if (hz >= 120) return 88;
  if (hz >= 90) return 70;
  return 45;
}

export function panelScore(panel: string): number {
  const value = panel.toLowerCase();
  if (value.includes("xdr") || value.includes("mini-led")) return 98;
  if (value.includes("ltpo")) return 95;
  if (value.includes("oled") || value.includes("amoled")) return 90;
  if (value.includes("ips")) return 62;
  return 45;
}

/** Hash estable (FNV-1a) para señales deterministas derivadas del slug. */
export function stableHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}
