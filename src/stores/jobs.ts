import { writable } from 'svelte/store';
import type { Job, JobsResponse, CurrentResponse } from '../types/job';
import type { Company } from '../types/company';
import { ENDPOINTS } from '../utils/constants';

export interface JobsStoreState {
  cryptoJobs: Job[];
  aiJobs: Job[];
  cryptoCompanies: Company[];
  aiCompanies: Company[];
  cryptoNewJobs: Job[];
  aiNewJobs: Job[];
  cryptoTotal: number | null;
  aiTotal: number | null;
  loading: boolean;
  error: string | null;
}

const defaultState: JobsStoreState = {
  cryptoJobs: [],
  aiJobs: [],
  cryptoCompanies: [],
  aiCompanies: [],
  cryptoNewJobs: [],
  aiNewJobs: [],
  cryptoTotal: null,
  aiTotal: null,
  loading: false,
  error: null,
};

/**
 * Jobs store - manages job data with caching
 */
function createJobsStore() {
  const { subscribe, set, update } = writable<JobsStoreState>(defaultState);

  return {
    subscribe,
    /**
     * Fetch crypto jobs
     */
    fetchCryptoJobs: async () => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const [jobsRes, companiesRes, currentRes] = await Promise.all([
          fetch(ENDPOINTS.CRYPTO_JOBS),
          fetch(ENDPOINTS.CRYPTO_COMPANIES),
          fetch(ENDPOINTS.CRYPTO_CURRENT),
        ]);

        const jobsData = (await jobsRes.json()) as JobsResponse;
        const companiesData = await companiesRes.json();
        const currentData = (await currentRes.json()) as CurrentResponse;

        const jobs = jobsData.data.filter((job) => job.company && job.location);

        update((state) => ({
          ...state,
          cryptoJobs: jobs,
          cryptoCompanies: companiesData,
          cryptoTotal: currentData['Total Jobs'],
          loading: false,
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          error: `Failed to fetch crypto jobs: ${error}`,
          loading: false,
        }));
        console.error('Error fetching crypto jobs:', error);
      }
    },

    /**
     * Fetch AI jobs
     */
    fetchAIJobs: async () => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const [jobsRes, companiesRes, currentRes] = await Promise.all([
          fetch(ENDPOINTS.AI_JOBS),
          fetch(ENDPOINTS.AI_COMPANIES),
          fetch(ENDPOINTS.AI_CURRENT),
        ]);

        const jobsData = (await jobsRes.json()) as JobsResponse;
        const companiesData = await companiesRes.json();
        const currentData = (await currentRes.json()) as CurrentResponse;

        const jobs = jobsData.data.filter((job) => job.company && job.location);

        update((state) => ({
          ...state,
          aiJobs: jobs,
          aiCompanies: companiesData,
          aiTotal: currentData['Total Jobs'],
          loading: false,
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          error: `Failed to fetch AI jobs: ${error}`,
          loading: false,
        }));
        console.error('Error fetching AI jobs:', error);
      }
    },

    /**
     * Fetch new crypto jobs
     */
    fetchCryptoNewJobs: async () => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          fetch(ENDPOINTS.CRYPTO_NEW_JOBS),
          fetch(ENDPOINTS.CRYPTO_COMPANIES),
        ]);

        const jobsData = (await jobsRes.json()) as JobsResponse;
        const companiesData = await companiesRes.json();

        const jobs = jobsData.data.filter((job) => job.company && job.location);

        update((state) => ({
          ...state,
          cryptoNewJobs: jobs,
          cryptoCompanies: companiesData,
          loading: false,
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          error: `Failed to fetch crypto new jobs: ${error}`,
          loading: false,
        }));
        console.error('Error fetching crypto new jobs:', error);
      }
    },

    /**
     * Fetch new AI jobs
     */
    fetchAINewJobs: async () => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          fetch(ENDPOINTS.AI_NEW_JOBS),
          fetch(ENDPOINTS.AI_COMPANIES),
        ]);

        const jobsData = (await jobsRes.json()) as JobsResponse;
        const companiesData = await companiesRes.json();

        const jobs = jobsData.data.filter((job) => job.company && job.location);

        update((state) => ({
          ...state,
          aiNewJobs: jobs,
          aiCompanies: companiesData,
          loading: false,
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          error: `Failed to fetch AI new jobs: ${error}`,
          loading: false,
        }));
        console.error('Error fetching AI new jobs:', error);
      }
    },

    /**
     * Fetch companies
     */
    fetchCompanies: async (type: 'crypto' | 'ai') => {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const url = type === 'crypto' ? ENDPOINTS.CRYPTO_COMPANIES : ENDPOINTS.AI_COMPANIES;
        const companiesRes = await fetch(url);

        const companiesData = await companiesRes.json();

        const key = type === 'crypto' ? 'cryptoCompanies' : 'aiCompanies';
        update((state) => ({
          ...state,
          [key]: companiesData,
          loading: false,
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          error: `Failed to fetch ${type} companies: ${error}`,
          loading: false,
        }));
        console.error(`Error fetching ${type} companies:`, error);
      }
    },

    /**
     * Clear all data
     */
    clear: () => {
      set(defaultState);
    },
  };
}

export const jobs = createJobsStore();
