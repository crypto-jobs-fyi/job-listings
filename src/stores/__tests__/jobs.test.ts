import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { jobs as jobsStore } from '../jobs';

describe('Jobs Store Data Loading', () => {
  beforeEach(() => {
    // Clear store state before each test
    // (reset would be called if it existed)
  });

  it('should load crypto jobs with at least 10 jobs', async () => {
    await jobsStore.fetchCryptoJobs();
    const state = get(jobsStore);

    expect(state.cryptoJobs, 'Should load crypto jobs').toBeDefined();
    expect(state.cryptoJobs.length, 'Should have at least 10 jobs').toBeGreaterThanOrEqual(10);
    expect(state.loading, 'Should not be loading after fetch').toBe(false);
    expect(state.error, 'Should not have error').toBeNull();
  });

  it('should load at least 2 crypto companies', async () => {
    await jobsStore.fetchCryptoJobs();
    const state = get(jobsStore);

    expect(state.cryptoCompanies, 'Should load companies').toBeDefined();
    expect(state.cryptoCompanies.length, 'Should have at least 2 companies').toBeGreaterThanOrEqual(
      2
    );
  });

  it('should load AI jobs with at least 10 jobs', async () => {
    await jobsStore.fetchAIJobs();
    const state = get(jobsStore);

    expect(state.aiJobs, 'Should load AI jobs').toBeDefined();
    expect(state.aiJobs.length, 'Should have at least 10 jobs').toBeGreaterThanOrEqual(10);
    expect(state.loading, 'Should not be loading after fetch').toBe(false);
  });

  it('should load at least 2 AI companies', async () => {
    await jobsStore.fetchAIJobs();
    const state = get(jobsStore);

    expect(state.aiCompanies, 'Should load companies').toBeDefined();
    expect(state.aiCompanies.length, 'Should have at least 2 companies').toBeGreaterThanOrEqual(2);
  });
});
