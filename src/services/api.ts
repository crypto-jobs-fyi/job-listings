/**
 * Configuration for API endpoints and timeouts
 */
export const API_CONFIG = {
  TIMEOUT_MS: 15000,
  GITHUB_RAW_URL: 'https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main',
};

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
 * Fetch JSON with error handling
 */
export async function fetchJSON<T>(url: string, timeoutMs?: number): Promise<T> {
  try {
    const response = await fetchWithTimeout(url, {}, timeoutMs);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw new Error(`Failed to fetch data from ${url}: ${error}`);
  }
}
