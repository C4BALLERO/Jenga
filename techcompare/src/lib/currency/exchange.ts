import { serverEnv } from "@/lib/env";
import type { Currency } from "@/types/common";

/**
 * Abstracción de tipos de cambio.
 *
 * Regla del proyecto: los precios se almacenan SIEMPRE en su moneda original
 * (`originalPrice` + `originalCurrency`). La conversión a bolivianos se calcula
 * en el momento de mostrarlos, nunca se persiste convertida.
 */
export interface ExchangeRateProvider {
  readonly id: string;
  /** Cuántas unidades de `to` equivalen a 1 unidad de `from`. */
  getRate(from: Currency, to: Currency): Promise<number>;
  getRates(base: Currency): Promise<Record<Currency, number>>;
}

const DEFAULT_USD_BOB = 6.96;
const DEFAULT_EUR_BOB = 7.6;

/**
 * Proveedor por defecto: tasas fijas configurables por entorno.
 *
 * Bolivia mantiene un tipo de cambio oficial estable frente al dólar, por lo
 * que una tasa configurada cubre el caso habitual. Para mercados con cambio
 * volátil se registra `ApiExchangeRateProvider`.
 */
export class StaticExchangeRateProvider implements ExchangeRateProvider {
  readonly id = "static-rates";

  private readonly toBob: Record<Currency, number> = {
    BOB: 1,
    USD: serverEnv.EXCHANGE_RATE_USD_BOB ?? DEFAULT_USD_BOB,
    EUR: serverEnv.EXCHANGE_RATE_EUR_BOB ?? DEFAULT_EUR_BOB,
  };

  async getRate(from: Currency, to: Currency): Promise<number> {
    if (from === to) return 1;
    return this.toBob[from] / this.toBob[to];
  }

  async getRates(base: Currency): Promise<Record<Currency, number>> {
    const entries = (Object.keys(this.toBob) as Currency[]).map((currency) => [
      currency,
      this.toBob[base] / this.toBob[currency],
    ]);
    return Object.fromEntries(entries) as Record<Currency, number>;
  }
}

interface CachedRates {
  fetchedAt: number;
  rates: Record<string, number>;
}

/**
 * Proveedor basado en una API de tipos de cambio configurada por entorno.
 * Cachea el resultado una hora para no consumir cuota en cada petición.
 */
export class ApiExchangeRateProvider implements ExchangeRateProvider {
  readonly id = "api-rates";
  private cache: CachedRates | null = null;
  private readonly ttlMs = 3_600_000;
  private readonly fallback = new StaticExchangeRateProvider();

  constructor(private readonly endpoint = serverEnv.EXCHANGE_RATE_API_URL) {}

  private async load(): Promise<Record<string, number> | null> {
    if (!this.endpoint) return null;
    if (this.cache && Date.now() - this.cache.fetchedAt < this.ttlMs) return this.cache.rates;

    try {
      const response = await fetch(this.endpoint, { next: { revalidate: 3600 } });
      if (!response.ok) return this.cache?.rates ?? null;
      const payload = (await response.json()) as { rates?: Record<string, number> };
      if (!payload.rates) return this.cache?.rates ?? null;
      this.cache = { fetchedAt: Date.now(), rates: payload.rates };
      return payload.rates;
    } catch {
      // Ante fallo se conservan las últimas tasas válidas.
      return this.cache?.rates ?? null;
    }
  }

  async getRate(from: Currency, to: Currency): Promise<number> {
    if (from === to) return 1;
    const rates = await this.load();
    if (!rates || !rates[from] || !rates[to]) return this.fallback.getRate(from, to);
    return rates[to] / rates[from];
  }

  async getRates(base: Currency): Promise<Record<Currency, number>> {
    const rates = await this.load();
    if (!rates) return this.fallback.getRates(base);
    const currencies: Currency[] = ["BOB", "USD", "EUR"];
    const entries = currencies.map((currency) => [
      currency,
      rates[currency] && rates[base] ? rates[currency] / rates[base] : 1,
    ]);
    return Object.fromEntries(entries) as Record<Currency, number>;
  }
}

let provider: ExchangeRateProvider | null = null;

export function getExchangeRateProvider(): ExchangeRateProvider {
  if (!provider) {
    provider = serverEnv.EXCHANGE_RATE_API_URL
      ? new ApiExchangeRateProvider()
      : new StaticExchangeRateProvider();
  }
  return provider;
}

export async function convert(amount: number, from: Currency, to: Currency): Promise<number> {
  if (from === to) return amount;
  const rate = await getExchangeRateProvider().getRate(from, to);
  return amount * rate;
}

/** Conversión síncrona con tasas fijas, para render en servidor sin await. */
export function convertStatic(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  const table: Record<Currency, number> = {
    BOB: 1,
    USD: serverEnv.EXCHANGE_RATE_USD_BOB ?? DEFAULT_USD_BOB,
    EUR: serverEnv.EXCHANGE_RATE_EUR_BOB ?? DEFAULT_EUR_BOB,
  };
  return (amount * table[from]) / table[to];
}
