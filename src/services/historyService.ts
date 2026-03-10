import { ENDPOINTS } from '../utils/constants';

export type HistoryData = Record<string, Record<string, number>>;

const cache = new Map<string, HistoryData>();

export async function fetchHistory(category: 'ai' | 'crypto' | 'fin'): Promise<HistoryData> {
  if (cache.has(category)) {
    return cache.get(category)!;
  }

  const url =
    category === 'ai'
      ? ENDPOINTS.AI_HISTORY
      : category === 'crypto'
        ? ENDPOINTS.CRYPTO_HISTORY
        : ENDPOINTS.FIN_HISTORY;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch history for ${category}: ${response.status}`);
  }

  const raw: HistoryData = await response.json();
  const data: HistoryData = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v])
  );
  cache.set(category, data);
  return data;
}
