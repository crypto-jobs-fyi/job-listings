<script lang="ts">
  import { onMount } from 'svelte';
  import JobBoard from '../components/JobBoard.svelte';
  import { jobs as jobsStore, type JobsStoreState } from '../stores/jobs';
  import { getCompanyUrl, getCompanyLogoUrl } from '../services/companyService';
  import type { Job } from '../types/job';
  import type { Company } from '../types/company';

  export let pageConfig: { type: string; category: 'crypto' | 'ai' } = {
    type: 'jobs',
    category: 'crypto',
  };
  export let isNewJobs = false;

  let storeData: JobsStoreState | null = null;
  let loading = true;
  let error: string | null = null;

  const bannerTitles: Record<string, string> = {
    'crypto-jobs': '🚀 Crypto Jobs',
    'crypto-new-jobs': '🆕 New Crypto Jobs',
    'ai-jobs': '🤖 AI & ML Jobs',
    'ai-new-jobs': '🆕 New AI Jobs',
  };

  $: bannerKey = `${pageConfig.category}-${isNewJobs ? 'new-' : ''}jobs`;
  $: bannerTitle = bannerTitles[bannerKey];

  let jobs: Job[] = [];
  let companies: Company[] = [];

  // Compute jobs and companies from store data
  $: jobs = storeData
    ? isNewJobs
      ? pageConfig.category === 'crypto'
        ? storeData.cryptoNewJobs
        : storeData.aiNewJobs
      : pageConfig.category === 'crypto'
        ? storeData.cryptoJobs
        : storeData.aiJobs
    : [];

  $: companies = storeData
    ? pageConfig.category === 'crypto'
      ? storeData.cryptoCompanies
      : storeData.aiCompanies
    : [];

  $: totalJobs = storeData
    ? pageConfig.category === 'crypto'
      ? storeData.cryptoTotal || 0
      : storeData.aiTotal || 0
    : 0;

  // Subscribe to store
  onMount(() => {
    const unsubscribe = jobsStore.subscribe((data) => {
      storeData = data;
      loading = data.loading;
      error = data.error;
    });

    console.log('Fetching jobs for category:', pageConfig.category, 'isNewJobs:', isNewJobs);

    // Set initial loading state
    loading = true;
    error = null;

    // Load jobs
    const fetchPromise =
      pageConfig.category === 'crypto'
        ? isNewJobs
          ? jobsStore.fetchCryptoNewJobs()
          : jobsStore.fetchCryptoJobs()
        : isNewJobs
          ? jobsStore.fetchAINewJobs()
          : jobsStore.fetchAIJobs();

    fetchPromise
      .then(() => {
        console.log('Fetch completed for category:', pageConfig.category);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
      });

    return unsubscribe;
  });
</script>

<div class="jobs-page">
  {#if error}
    <div class="error">
      <p>Error: {error}</p>
      <p>Please try refreshing the page.</p>
    </div>
  {:else if loading && jobs.length === 0}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading jobs...</p>
    </div>
  {:else}
    <JobBoard
      {jobs}
      {companies}
      {bannerTitle}
      {totalJobs}
      category={pageConfig.category}
      isCompaniesView={false}
      getCompanyUrl={(name) => getCompanyUrl(companies, name)}
      getCompanyLogoUrl={(name) => getCompanyLogoUrl(companies, name)}
    />
  {/if}
</div>

<style>
  .jobs-page {
    width: 100%;
  }

  .loading,
  .error {
    text-align: center;
    padding: 2rem;
    margin: 2rem auto;
    max-width: 600px;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    border: 4px solid var(--header-bg);
    border-top: 4px solid var(--link-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .error {
    background: rgba(220, 53, 69, 0.1);
    border: 1px solid #dc3545;
    border-radius: 6px;
    color: #dc3545;
  }

  .error p {
    margin: 0.5rem 0;
  }
</style>
