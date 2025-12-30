<script lang="ts">
  import { onMount } from 'svelte';
  import type { FavoriteJob } from '../types/favorites';
  import type { Company } from '../types/company';
  import { favorites } from '../stores/favorites';
  import { companyService, getCompanyUrl, getCompanyLogoUrl } from '../services/companyService';
  import JobBoard from '../components/JobBoard.svelte';

  let favoriteJobs: FavoriteJob[] = [];
  let companies: Company[] = [];
  let loading = true;
  let error: string | null = null;

  onMount(() => {
    // Subscribe to favorites store
    const unsubscribe = favorites.subscribe((favMap) => {
      favoriteJobs = Array.from(favMap.values());
    });

    // Load companies
    (async () => {
      try {
        const [cryptoCompanies, aiCompanies] = await Promise.all([
          companyService.fetchCryptoCompanies(),
          companyService.fetchAICompanies(),
        ]);
        companies = [...cryptoCompanies, ...aiCompanies] as Company[];
      } catch (e) {
        error = `Failed to load companies: ${e}`;
        console.error(error, e);
      } finally {
        loading = false;
      }
    })();

    return unsubscribe;
  });

  function clearAllFavorites() {
    favorites.clear();
  }

  // Convert FavoriteJob back to Job for JobBoard component
  $: jobsForBoard = favoriteJobs.map((fav) => ({
    id: fav.id,
    company: fav.company,
    title: fav.title,
    link: fav.link,
    location: fav.location,
    category: fav.category,
  }));
</script>

<main>
  {#if error}
    <div class="error-message">
      <p>{error}</p>
    </div>
  {/if}

  {#if loading}
    <div class="loading-message">
      <p>Loading your favorites...</p>
    </div>
  {:else if favoriteJobs.length === 0}
    <div class="no-favorites">
      <p>You haven't saved any favorites yet!</p>
      <p>Browse jobs and click the ★ icon to save your favorite opportunities.</p>
      <a href="/crypto-jobs.html" class="cta-link">Browse Crypto Jobs</a>
      <a href="/ai-jobs.html" class="cta-link">Browse AI Jobs</a>
    </div>
  {:else}
    <JobBoard
      jobs={jobsForBoard}
      {companies}
      bannerTitle={`⭐ My Favorite Jobs (${favoriteJobs.length})`}
      category="all"
      isFavoritesView={true}
      onClearFavorites={clearAllFavorites}
      getCompanyUrl={(name) => getCompanyUrl(companies, name)}
      getCompanyLogoUrl={(name) => getCompanyLogoUrl(companies, name)}
    />
  {/if}
</main>

<style>
  main {
    width: 100%;
  }

  .error-message {
    background: #fee;
    border: 1px solid #f99;
    color: #c33;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .loading-message {
    text-align: center;
    padding: 2rem;
    color: var(--secondary-text);
  }

  .no-favorites {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--card-bg);
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }

  .no-favorites p {
    margin: 0.5rem 0;
    color: var(--secondary-text);
  }

  .no-favorites p:first-child {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .cta-link {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background: var(--link-color);
    color: white;
    text-decoration: none;
    border-radius: 4px;
    margin-right: 0.5rem;
    transition: background 0.2s ease;
  }

  .cta-link:hover {
    opacity: 0.9;
  }
</style>
