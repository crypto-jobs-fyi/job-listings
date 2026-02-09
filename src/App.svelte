<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { theme } from './stores/theme';
  import TopMenu from './components/TopMenu.svelte';
  import HomePage from './pages/HomePage.svelte';
  import JobsPage from './pages/JobsPage.svelte';
  import CompaniesPage from './pages/CompaniesPage.svelte';
  import FavoritesPage from './pages/FavoritesPage.svelte';
  import LoginPage from './pages/LoginPage.svelte';
  import AccountPage from './pages/AccountPage.svelte';
  import AdminPage from './pages/AdminPage.svelte';

  // Accept pageConfig as prop, but also allow window override
  export let pageConfig: {
    type: string;
    category: 'crypto' | 'ai' | 'fin' | 'all';
    title: string;
    description: string;
  } = {
    type: 'home',
    category: 'all',
    title: 'Job Finder',
    description: 'Find your next job',
  };

  let showQR = false;

  onMount(() => {
    console.log('App mounted, initial pageConfig:', pageConfig);

    // Load page config from window if available (set by entry point)
    if (typeof window !== 'undefined' && window.__PAGE_CONFIG__) {
      console.log('Found window.__PAGE_CONFIG__:', window.__PAGE_CONFIG__);
      pageConfig = window.__PAGE_CONFIG__;
    }

    console.log('Final pageConfig:', pageConfig);

    // Inject analytics
    import('@vercel/analytics').then(({ inject }) => {
      inject();
    });
  });

  // Apply theme to document
  $: if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', $theme);
  }

  function toggleQR() {
    showQR = !showQR;
  }

  function closeQR() {
    showQR = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeQR();
  }

  // Determine which page to render
  $: isHomePage = pageConfig.type === 'home' || !pageConfig.type;
  $: isJobsPage = pageConfig.type === 'jobs';
  $: isCompaniesPage = pageConfig.type === 'companies';
  $: isNewJobsPage = pageConfig.type === 'new-jobs';
  $: isNewJobs = isNewJobsPage;
  $: isFavoritesPage = pageConfig.type === 'favorites';
  $: isLoginPage = pageConfig.type === 'login';
  $: isAccountPage = pageConfig.type === 'account';
  $: isAdminPage = pageConfig.type === 'admin';
</script>

<svelte:head>
  <title>{pageConfig.title}</title>
  <meta name="description" content={pageConfig.description} />
</svelte:head>

<TopMenu showHome={!isHomePage && !isLoginPage} />

<div in:fade={{ duration: 300, delay: 100 }}>
  {#if isHomePage}
    <HomePage {toggleQR} {closeQR} {handleKeyDown} {showQR} />
  {:else if isJobsPage || isNewJobsPage}
    <JobsPage {pageConfig} {isNewJobs} />
  {:else if isCompaniesPage}
    <CompaniesPage {pageConfig} />
  {:else if isFavoritesPage}
    <FavoritesPage />
  {:else if isLoginPage}
    <LoginPage />
  {:else if isAccountPage}
    <AccountPage />
  {:else if isAdminPage}
    <AdminPage />
  {/if}
</div>

<style>
  /* Styles moved to HomePage.svelte */
</style>
