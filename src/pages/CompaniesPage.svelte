<script lang="ts">
  import { onMount } from 'svelte';
  import JobBoard from '../components/JobBoard.svelte';
  import { jobs as jobsStore, type JobsStoreState } from '../stores/jobs';
  import { getCompanyUrl, getCompanyLogoUrl } from '../services/companyService';
  import type { Company } from '../types/company';
  import type { Job } from '../types/job';

  export let pageConfig: { type: string; category: 'crypto' | 'ai' | 'fin' | 'all' } = {
    type: 'companies',
    category: 'crypto',
  };

  let storeData: JobsStoreState | null = null;
  let loading = true;
  let error: string | null = null;

  const bannerTitles: Record<'crypto' | 'ai' | 'fin' | 'all', string> = {
    crypto: '🏢 Crypto Companies',
    ai: '🏢 AI Companies',
    fin: '🏢 FinTech Companies',
    all: '🏢 All Companies',
  };

  $: bannerTitle = bannerTitles[pageConfig.category] || 'Companies';

  let companies: Company[] = [];
  let jobs: Job[] = [];

  // Compute companies from store data
  $: companies = storeData
    ? pageConfig.category === 'crypto'
      ? storeData.cryptoCompanies
      : pageConfig.category === 'ai'
        ? storeData.aiCompanies
        : storeData.finCompanies
    : [];

  $: jobs = storeData
    ? pageConfig.category === 'crypto'
      ? storeData.cryptoJobs
      : pageConfig.category === 'ai'
        ? storeData.aiJobs
        : storeData.finJobs
    : [];

  // Subscribe to store
  onMount(() => {
    console.log('CompaniesPage mounted with category:', pageConfig.category);

    const unsubscribe = jobsStore.subscribe((data) => {
      console.log('CompaniesPage store updated:', {
        category: pageConfig.category,
        cryptoCompaniesLength: data.cryptoCompanies?.length,
        aiCompaniesLength: data.aiCompanies?.length,
        loading: data.loading,
        error: data.error,
      });
      storeData = data;
      loading = data.loading;
      error = data.error;
    });

    console.log('Fetching companies for category:', pageConfig.category);

    // Load companies
    if (pageConfig.category === 'crypto') {
      jobsStore.fetchCryptoJobs(); // This also fetches jobs for counts
    } else if (pageConfig.category === 'ai') {
      jobsStore.fetchAIJobs(); // This also fetches jobs for counts
    } else {
      jobsStore.fetchFinJobs(); // This also fetches jobs for counts
    }

    return unsubscribe;
  });
</script>

<div class="companies-page">
  {#if error}
    <div class="error">
      <p>Error: {error}</p>
      <p>Please try refreshing the page.</p>
    </div>
  {:else if loading && companies.length === 0}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading companies...</p>
    </div>
  {:else}
    <JobBoard
      {jobs}
      {companies}
      {bannerTitle}
      totalJobs={companies.length}
      category={pageConfig.category}
      showTitleSearch={false}
      showLocationSearch={false}
      isCompaniesView={true}
      getCompanyUrl={(name) => getCompanyUrl(companies, name)}
      getCompanyLogoUrl={(name) => getCompanyLogoUrl(companies, name)}
    />
  {/if}
</div>

<style>
  .companies-page {
    width: 100%;
  }

  .loading,
  .error {
    text-align: center;
    padding: 4rem 2rem;
    margin: 0 auto;
    max-width: 600px;
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading {
    flex-direction: column;
    gap: 1.5rem;
    animation: fadeIn 0.3s ease-in;
  }

  .loading p {
    color: var(--secondary-text);
    font-size: 1rem;
    font-weight: 500;
  }

  .spinner {
    border: 5px solid rgba(59, 130, 246, 0.1);
    border-top: 5px solid #3b82f6;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
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
