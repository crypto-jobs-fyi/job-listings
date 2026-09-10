import { writable } from 'svelte/store';
import { clearApiCache } from '../services/api';
import {
  fetchAICompanies,
  fetchCryptoCompanies,
  fetchFinTechCompanies,
} from '../services/companyService';
import {
  fetchAIJobs as loadAIJobs,
  fetchAINewJobs as loadAINewJobs,
  fetchCryptoJobs as loadCryptoJobs,
  fetchCryptoNewJobs as loadCryptoNewJobs,
  fetchFinJobs as loadFinJobs,
  fetchFinNewJobs as loadFinNewJobs,
} from '../services/jobService';
import type { Job } from '../types/job';
import type { Company } from '../types/company';

const resourceNames = [
  'cryptoJobs',
  'aiJobs',
  'finJobs',
  'cryptoCompanies',
  'aiCompanies',
  'finCompanies',
  'cryptoNewJobs',
  'aiNewJobs',
  'finNewJobs',
] as const;

export type JobsResource = (typeof resourceNames)[number];

export interface ResourceState {
  loading: boolean;
  error: string | null;
  loadedAt: number | null;
}

export interface JobsStoreState {
  cryptoJobs: Job[];
  aiJobs: Job[];
  finJobs: Job[];
  cryptoCompanies: Company[];
  aiCompanies: Company[];
  finCompanies: Company[];
  cryptoNewJobs: Job[];
  aiNewJobs: Job[];
  finNewJobs: Job[];
  cryptoTotal: number | null;
  aiTotal: number | null;
  finTotal: number | null;
  resources: Record<JobsResource, ResourceState>;
  loading: boolean;
  error: string | null;
}

function createDefaultState(): JobsStoreState {
  return {
    cryptoJobs: [],
    aiJobs: [],
    finJobs: [],
    cryptoCompanies: [],
    aiCompanies: [],
    finCompanies: [],
    cryptoNewJobs: [],
    aiNewJobs: [],
    finNewJobs: [],
    cryptoTotal: null,
    aiTotal: null,
    finTotal: null,
    resources: Object.fromEntries(
      resourceNames.map((resource) => [resource, { loading: false, error: null, loadedAt: null }])
    ) as Record<JobsResource, ResourceState>,
    loading: false,
    error: null,
  };
}

function updateResourceStates(
  state: JobsStoreState,
  changes: Partial<Record<JobsResource, Partial<ResourceState>>>
): JobsStoreState {
  const resources = { ...state.resources };
  for (const [resource, change] of Object.entries(changes) as [
    JobsResource,
    Partial<ResourceState>,
  ][]) {
    resources[resource] = { ...resources[resource], ...change };
  }

  const failedResource = Object.values(resources).find((resource) => resource.error);
  return {
    ...state,
    resources,
    loading: Object.values(resources).some((resource) => resource.loading),
    error: failedResource?.error ?? null,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Jobs store - manages job data with caching
 */
function createJobsStore() {
  const { subscribe, set, update } = writable<JobsStoreState>(createDefaultState());

  const setResources = (changes: Partial<Record<JobsResource, Partial<ResourceState>>>) => {
    update((state) => updateResourceStates(state, changes));
  };

  const loadJobsAndCompanies = async <TJobs>(
    jobsResource: JobsResource,
    companiesResource: JobsResource,
    loadJobs: () => Promise<TJobs>,
    loadCompanies: () => Promise<Company[]>,
    applyJobs: (result: TJobs) => Partial<JobsStoreState>,
    applyCompanies: (result: Company[]) => Partial<JobsStoreState>
  ) => {
    setResources({
      [jobsResource]: { loading: true, error: null },
      [companiesResource]: { loading: true, error: null },
    });

    const [jobsResult, companiesResult] = await Promise.allSettled([loadJobs(), loadCompanies()]);
    const loadedAt = Date.now();

    update((state) => {
      let nextState = updateResourceStates(state, {
        [jobsResource]: {
          loading: false,
          error: jobsResult.status === 'rejected' ? errorMessage(jobsResult.reason) : null,
          loadedAt:
            jobsResult.status === 'fulfilled' ? loadedAt : state.resources[jobsResource].loadedAt,
        },
        [companiesResource]: {
          loading: false,
          error:
            companiesResult.status === 'rejected' ? errorMessage(companiesResult.reason) : null,
          loadedAt:
            companiesResult.status === 'fulfilled'
              ? loadedAt
              : state.resources[companiesResource].loadedAt,
        },
      });

      if (jobsResult.status === 'fulfilled') {
        nextState = { ...nextState, ...applyJobs(jobsResult.value) };
      } else {
        console.error(`Failed to load ${jobsResource}:`, jobsResult.reason);
      }

      if (companiesResult.status === 'fulfilled') {
        nextState = { ...nextState, ...applyCompanies(companiesResult.value) };
      } else {
        console.error(`Failed to load ${companiesResource}:`, companiesResult.reason);
      }

      return nextState;
    });
  };

  const loadCompanyData = async (
    resource: 'cryptoCompanies' | 'aiCompanies' | 'finCompanies',
    loader: () => Promise<Company[]>
  ) => {
    setResources({ [resource]: { loading: true, error: null } });

    try {
      const companies = await loader();
      update((state) => ({
        ...updateResourceStates(state, {
          [resource]: { loading: false, error: null, loadedAt: Date.now() },
        }),
        [resource]: companies,
      }));
    } catch (error) {
      console.error(`Failed to load ${resource}:`, error);
      setResources({ [resource]: { loading: false, error: errorMessage(error) } });
    }
  };

  return {
    subscribe,
    /**
     * Fetch crypto jobs
     */
    fetchCryptoJobs: () =>
      loadJobsAndCompanies(
        'cryptoJobs',
        'cryptoCompanies',
        loadCryptoJobs,
        fetchCryptoCompanies,
        ({ jobs, total }) => ({ cryptoJobs: jobs, cryptoTotal: total }),
        (companies) => ({ cryptoCompanies: companies })
      ),

    /**
     * Fetch AI jobs
     */
    fetchAIJobs: () =>
      loadJobsAndCompanies(
        'aiJobs',
        'aiCompanies',
        loadAIJobs,
        fetchAICompanies,
        ({ jobs, total }) => ({ aiJobs: jobs, aiTotal: total }),
        (companies) => ({ aiCompanies: companies })
      ),

    /**
     * Fetch FinTech jobs
     */
    fetchFinJobs: () =>
      loadJobsAndCompanies(
        'finJobs',
        'finCompanies',
        loadFinJobs,
        fetchFinTechCompanies,
        ({ jobs, total }) => ({ finJobs: jobs, finTotal: total }),
        (companies) => ({ finCompanies: companies })
      ),

    /**
     * Fetch new crypto jobs
     */
    fetchCryptoNewJobs: () =>
      loadJobsAndCompanies(
        'cryptoNewJobs',
        'cryptoCompanies',
        loadCryptoNewJobs,
        fetchCryptoCompanies,
        (jobs) => ({ cryptoNewJobs: jobs }),
        (companies) => ({ cryptoCompanies: companies })
      ),

    /**
     * Fetch new AI jobs
     */
    fetchAINewJobs: () =>
      loadJobsAndCompanies(
        'aiNewJobs',
        'aiCompanies',
        loadAINewJobs,
        fetchAICompanies,
        (jobs) => ({ aiNewJobs: jobs }),
        (companies) => ({ aiCompanies: companies })
      ),

    /**
     * Fetch new FinTech jobs
     */
    fetchFinNewJobs: () =>
      loadJobsAndCompanies(
        'finNewJobs',
        'finCompanies',
        loadFinNewJobs,
        fetchFinTechCompanies,
        (jobs) => ({ finNewJobs: jobs }),
        (companies) => ({ finCompanies: companies })
      ),

    /**
     * Fetch companies
     */
    fetchCompanies: (type: 'crypto' | 'ai' | 'fin') =>
      type === 'crypto'
        ? loadCompanyData('cryptoCompanies', fetchCryptoCompanies)
        : type === 'ai'
          ? loadCompanyData('aiCompanies', fetchAICompanies)
          : loadCompanyData('finCompanies', fetchFinTechCompanies),

    /**
     * Clear all data
     */
    invalidateCache: () => clearApiCache(),
    clear: () => set(createDefaultState()),
  };
}

export const jobs = createJobsStore();
