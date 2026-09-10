import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

vi.mock('../../services/jobService', () => ({
  fetchCryptoJobs: vi.fn(),
  fetchAIJobs: vi.fn(),
  fetchFinJobs: vi.fn(),
  fetchCryptoNewJobs: vi.fn(),
  fetchAINewJobs: vi.fn(),
  fetchFinNewJobs: vi.fn(),
}));

vi.mock('../../services/companyService', () => ({
  fetchCryptoCompanies: vi.fn(),
  fetchAICompanies: vi.fn(),
  fetchFinTechCompanies: vi.fn(),
}));

import { fetchCryptoCompanies } from '../../services/companyService';
import { fetchCryptoJobs } from '../../services/jobService';
import { jobs } from '../jobs';

describe('jobs resource state', () => {
  beforeEach(() => {
    jobs.clear();
    vi.clearAllMocks();
  });

  it('loads through services and records independent resource state', async () => {
    vi.mocked(fetchCryptoJobs).mockResolvedValue({
      jobs: [
        {
          company: 'Example',
          title: 'Engineer',
          location: 'Remote',
          link: 'https://example.test',
        },
      ],
      total: 1,
    });
    vi.mocked(fetchCryptoCompanies).mockResolvedValue([{ company_name: 'Example' }]);

    const request = jobs.fetchCryptoJobs();
    expect(get(jobs).resources.cryptoJobs.loading).toBe(true);
    expect(get(jobs).resources.cryptoCompanies.loading).toBe(true);

    await request;

    const state = get(jobs);
    expect(fetchCryptoJobs).toHaveBeenCalledOnce();
    expect(fetchCryptoCompanies).toHaveBeenCalledOnce();
    expect(state.cryptoJobs).toHaveLength(1);
    expect(state.resources.cryptoJobs).toMatchObject({ loading: false, error: null });
    expect(state.resources.cryptoCompanies).toMatchObject({ loading: false, error: null });
    expect(state.resources.cryptoJobs.loadedAt).toEqual(expect.any(Number));
  });

  it('keeps a company failure scoped to the company resource', async () => {
    vi.mocked(fetchCryptoJobs).mockResolvedValue({ jobs: [], total: 0 });
    vi.mocked(fetchCryptoCompanies).mockRejectedValue(new Error('Company data unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await jobs.fetchCryptoJobs();

    const state = get(jobs);
    expect(state.resources.cryptoJobs.error).toBeNull();
    expect(state.resources.cryptoCompanies.error).toBe('Company data unavailable');
    expect(state.loading).toBe(false);
  });
});
