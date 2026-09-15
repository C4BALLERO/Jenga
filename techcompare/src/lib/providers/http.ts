import type { ProviderRateLimit } from "@/types/providers";
import { ProviderError } from "./provider.interface";

interface TokenBucketState {
  tokens: number;
  updatedAt: number;
  lastRequestAt: number;
}

const buckets = new Map<string, TokenBucketState>();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Limitador de peticiones por proveedor (token bucket en memoria).
 *
 * En serverless cada instancia tiene su propio bucket, por lo que los límites
 * configurados deben ser conservadores. La sincronización real se ejecuta desde
 * cron jobs por lotes, que es donde de verdad importa no exceder la cuota.
 */
export async function acquireSlot(providerId: string, limit: ProviderRateLimit): Promise<void> {
  const now = Date.now();
  const state = buckets.get(providerId) ?? {
    tokens: limit.requests,
    updatedAt: now,
    lastRequestAt: 0,
  };

  const refill = ((now - state.updatedAt) / (limit.windowSeconds * 1000)) * limit.requests;
  state.tokens = Math.min(limit.requests, state.tokens + refill);
  state.updatedAt = now;

  if (state.tokens < 1) {
    const waitMs = Math.ceil(((1 - state.tokens) * limit.windowSeconds * 1000) / limit.requests);
    await sleep(Math.min(waitMs, limit.windowSeconds * 1000));
    state.tokens = 1;
  }

  const sinceLast = now - state.lastRequestAt;
  if (state.lastRequestAt > 0 && sinceLast < limit.minDelayMs) {
    await sleep(limit.minDelayMs - sinceLast);
  }

  state.tokens -= 1;
  state.lastRequestAt = Date.now();
  buckets.set(providerId, state);
}

export interface ProviderFetchOptions extends RequestInit {
  providerId: string;
  rateLimit: ProviderRateLimit;
  /** Reintentos ante errores transitorios (429 / 5xx / red). */
  maxRetries?: number;
  timeoutMs?: number;
}

/**
 * `fetch` con limitación de peticiones, timeout y reintentos con backoff
 * exponencial. Honra siempre la cabecera `Retry-After` de la fuente.
 */
export async function providerFetch(
  url: string,
  { providerId, rateLimit, maxRetries = 3, timeoutMs = 15_000, ...init }: ProviderFetchOptions,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    await acquireSlot(providerId, rateLimit);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "TechCompare/1.0 (+https://techcompare.bo)",
          ...(init.headers ?? {}),
        },
      });

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const backoff = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 2 ** attempt * 1000;

        if (attempt < maxRetries) {
          await sleep(Math.min(backoff, 30_000));
          continue;
        }
        throw new ProviderError(
          `HTTP ${response.status} desde ${providerId}`,
          providerId,
          true,
        );
      }

      if (!response.ok) {
        throw new ProviderError(
          `HTTP ${response.status} desde ${providerId}`,
          providerId,
          false,
        );
      }

      return response;
    } catch (error) {
      lastError = error;
      if (error instanceof ProviderError && !error.retryable) throw error;
      if (attempt === maxRetries) break;
      await sleep(Math.min(2 ** attempt * 1000, 30_000));
    } finally {
      clearTimeout(timer);
    }
  }

  throw new ProviderError(
    `No se pudo contactar con ${providerId}: ${String(lastError)}`,
    providerId,
    true,
    lastError,
  );
}
