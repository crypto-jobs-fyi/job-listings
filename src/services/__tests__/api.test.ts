import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearApiCache, fetchJSON } from '../api';

const testUrl = 'https://example.test/jobs.json';

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  clearApiCache();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchJSON', () => {
  it('deduplicates concurrent requests and caches a validated response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: ['job'] }));
    vi.stubGlobal('fetch', fetchMock);

    const validate = (data: unknown): { data: string[] } => {
      if (!data || typeof data !== 'object' || !Array.isArray((data as { data?: unknown }).data)) {
        throw new Error('Expected a jobs response');
      }
      return data as { data: string[] };
    };

    const [first, second] = await Promise.all([
      fetchJSON(testUrl, { validate }),
      fetchJSON(testUrl, { validate }),
    ]);
    const cached = await fetchJSON(testUrl, { validate });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ data: ['job'] });
    expect(second).toEqual(first);
    expect(cached).toEqual(first);
  });

  it('does not cache invalid responses', async () => {
    const fetchMock = vi.fn().mockImplementation(() => jsonResponse({ invalid: true }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      fetchJSON(testUrl, {
        validate: () => {
          throw new Error('Expected a jobs response');
        },
      })
    ).rejects.toThrow('Expected a jobs response');

    await expect(
      fetchJSON(testUrl, {
        validate: () => {
          throw new Error('Expected a jobs response');
        },
      })
    ).rejects.toThrow('Expected a jobs response');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
