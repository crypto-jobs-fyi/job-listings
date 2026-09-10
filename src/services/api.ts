/**
 * Configuration for API endpoints and timeouts
 */
export const API_CONFIG = {
  TIMEOUT_MS: 15000,
  CACHE_TTL_MS: 5 * 60 * 1000,
  GITHUB_RAW_URL: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main',
};

export type ResponseValidator<T> = (data: unknown) => T;

export interface FetchJSONOptions<T> {
  timeoutMs?: number;
  ttlMs?: number;
  validate?: ResponseValidator<T>;
}

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export function clearApiCache(url?: string): void {
  if (url) {
    responseCache.delete(url);
    return;
  }

  responseCache.clear();
}

/**
 * Fetch with timeout wrapper
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = API_CONFIG.TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch validated JSON with timeout, cache, and in-flight request deduplication.
 */
export async function fetchJSON<T>(
  url: string,
  { timeoutMs, ttlMs = API_CONFIG.CACHE_TTL_MS, validate }: FetchJSONOptions<T> = {}
): Promise<T> {
  const cachedResponse = responseCache.get(url);
  if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
    return cachedResponse.data as T;
  }

  const activeRequest = inFlightRequests.get(url);
  if (activeRequest) {
    return activeRequest as Promise<T>;
  }

  const request = (async () => {
    try {
      const response = await fetchWithTimeout(url, {}, timeoutMs);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = (await response.json()) as unknown;
      const data = validate ? validate(json) : (json as T);

      if (ttlMs > 0) {
        responseCache.set(url, { data, expiresAt: Date.now() + ttlMs });
      }

      return data;
    } catch (error) {
      console.error(`Failed to fetch ${url}:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch data from ${url}: ${message}`);
    } finally {
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, request);

  try {
    return await request;
  } finally {
    inFlightRequests.delete(url);
  }
}
