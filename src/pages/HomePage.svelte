<script>
  import { onMount } from 'svelte';
  import { jobs } from '../stores/jobs';
  import { CATEGORIES } from '../utils/categories';

  export let toggleQR = () => {};
  export let closeQR = () => {};
  export let handleKeyDown = () => {};
  export let showQR = false;

  // Create reactive category data
  let categoryData = CATEGORIES.map((cat) => ({
    ...cat,
    jobsCount: 0,
    companiesCount: 0,
  }));

  onMount(() => {
    const unsubscribe = jobs.subscribe((state) => {
      // Update category data with counts from store
      categoryData = CATEGORIES.map((cat) => {
        // Type-safe access using mapped values
        const jobsCount =
          cat.id === 'crypto' ? state.cryptoTotal : cat.id === 'ai' ? state.aiTotal : 0;
        const companies =
          cat.id === 'crypto' ? state.cryptoCompanies : cat.id === 'ai' ? state.aiCompanies : [];

        return {
          ...cat,
          jobsCount: jobsCount || 0,
          companiesCount: companies?.length || 0,
        };
      });

      // Fetch data for categories that don't have it yet
      if (state.cryptoTotal === null && !state.loading) {
        jobs.fetchCryptoJobs();
      }
      if (state.aiTotal === null && !state.loading) {
        jobs.fetchAIJobs();
      }
    });

    return unsubscribe;
  });
</script>

<main>
  <button
    class="main-banner"
    on:click={toggleQR}
    aria-label="Show QR code"
    title="Click to show QR code"
  >
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="banner-qr-icon"
    >
      <rect x="2" y="2" width="6" height="6" stroke="currentColor" stroke-width="2" />
      <rect x="4" y="4" width="2" height="2" fill="currentColor" />
      <rect x="16" y="2" width="6" height="6" stroke="currentColor" stroke-width="2" />
      <rect x="18" y="4" width="2" height="2" fill="currentColor" />
      <rect x="2" y="16" width="6" height="6" stroke="currentColor" stroke-width="2" />
      <rect x="4" y="18" width="2" height="2" fill="currentColor" />
      <rect x="10" y="3" width="1" height="1" fill="currentColor" />
      <rect x="10" y="5" width="1" height="1" fill="currentColor" />
      <rect x="12" y="3" width="1" height="1" fill="currentColor" />
      <rect x="14" y="3" width="1" height="1" fill="currentColor" />
      <rect x="10" y="10" width="1" height="1" fill="currentColor" />
      <rect x="14" y="10" width="1" height="1" fill="currentColor" />
      <rect x="16" y="12" width="1" height="1" fill="currentColor" />
      <rect x="18" y="12" width="1" height="1" fill="currentColor" />
      <rect x="20" y="12" width="1" height="1" fill="currentColor" />
      <rect x="16" y="14" width="1" height="1" fill="currentColor" />
      <rect x="18" y="14" width="1" height="1" fill="currentColor" />
      <rect x="20" y="14" width="1" height="1" fill="currentColor" />
    </svg>
    <div class="main-banner-text">
      <span class="main-banner-title">Welcome to Web3 & AI Jobs!</span>
    </div>
  </button>

  {#if showQR}
    <div
      class="qr-modal-overlay"
      on:click={closeQR}
      on:keydown={handleKeyDown}
      role="button"
      tabindex="0"
      aria-label="Close QR code modal"
    >
      <div class="qr-modal" role="dialog" aria-modal="true" tabindex="0">
        <button class="qr-close" on:click={closeQR} aria-label="Close">&times;</button>
        <div class="qr-content">
          <h2>Share this job finder</h2>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.job-finder.org"
            alt="QR Code for www.job-finder.org"
            class="qr-image"
          />
          <p class="qr-url">www.job-finder.org</p>
        </div>
      </div>
    </div>
  {/if}
  <div class="main-links">
    {#each categoryData as category (category.id)}
      <a
        class="main-link-btn"
        style="background: {category.color}; --hover-color: {category.hoverColor};"
        href="/{category.id}-jobs.html"
      >
        {category.name} Jobs
        {#if category.jobsCount > 0}
          <span class="job-count-badge">{category.jobsCount}</span>
        {/if}
      </a>
      <a
        class="main-link-btn"
        style="background: {category.color}; --hover-color: {category.hoverColor};"
        href="/{category.id}-companies.html"
      >
        {category.name} Companies
        {#if category.companiesCount > 0}
          <span class="job-count-badge">{category.companiesCount}</span>
        {/if}
      </a>
    {/each}
  </div>
</main>

<style>
  main {
    max-width: 600px;
    margin: 4rem auto;
    padding: 2rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
    color: var(--text-color);
  }

  @media (max-width: 768px) {
    main {
      margin: 2rem auto;
      padding: 1.5rem;
      max-width: 90%;
    }
  }

  @media (max-width: 480px) {
    main {
      margin: 1rem auto;
      padding: 1rem;
      max-width: 95%;
    }
  }

  .main-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--header-bg);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 1.5rem 2rem;
    gap: 1.5rem;
    margin: 0 auto 2.5rem auto;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    box-sizing: border-box;
  }

  .main-banner:hover {
    background: var(--hover-bg);
    border-color: var(--link-color);
  }

  @media (max-width: 768px) {
    .main-banner {
      margin: 0 auto 2rem auto;
      gap: 1rem;
      padding: 1rem;
    }
  }

  @media (max-width: 480px) {
    .main-banner {
      margin: 0 auto 1.5rem auto;
    }
  }

  .main-banner-text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .banner-qr-icon {
    color: var(--secondary-text);
    flex-shrink: 0;
  }

  .main-banner-title {
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-color);
    letter-spacing: -0.01em;
    text-align: center;
  }

  @media (max-width: 768px) {
    .main-banner-title {
      font-size: 1.6rem;
    }
  }

  @media (max-width: 480px) {
    .main-banner-title {
      font-size: 1.4rem;
    }
    .banner-qr-icon {
      width: 24px;
      height: 24px;
    }
  }

  .main-links {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-top: 2rem;
    padding: 0 1rem;
  }

  @media (max-width: 768px) {
    .main-links {
      gap: 1rem;
      margin-top: 1.5rem;
      padding: 0 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .main-links {
      grid-template-columns: 1fr;
      gap: 0.8rem;
      margin-top: 1rem;
      padding: 0;
    }
  }

  .main-link-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 1rem 2rem;
    border-radius: 6px;
    font-size: 1.25rem;
    font-weight: 600;
    text-decoration: none;
    color: #fff;
    background: var(--link-color);
    border: 1px solid transparent;
    transition: all 0.2s ease;
    text-align: center;
    box-sizing: border-box;
    width: 100%;
  }

  .main-link-btn:hover {
    background: var(--hover-color);
    transform: translateY(-1px);
  }

  .job-count-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 2px solid var(--card-bg);
  }

  @media (max-width: 768px) {
    .main-link-btn {
      padding: 0.8rem 1.5rem;
      font-size: 1.1rem;
    }
  }

  @media (max-width: 480px) {
    .main-link-btn {
      padding: 0.7rem 1.5rem;
      font-size: 1rem;
    }
  }

  .main-link-btn:hover {
    background: var(--hover-color);
    transform: translateY(-1px);
  }

  .qr-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    cursor: pointer;
  }

  .qr-modal {
    background: var(--card-bg);
    color: var(--text-color);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    position: relative;
    max-width: 400px;
    width: 90%;
    cursor: default;
    animation: slideIn 0.3s ease;
    border: 1px solid var(--border-color);
  }

  @keyframes slideIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .qr-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--secondary-text);
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .qr-close:hover {
    background: var(--hover-bg);
    color: var(--text-color);
  }

  .qr-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .qr-content h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-color);
    text-align: center;
  }

  .qr-image {
    border: 2px solid var(--border-color);
    border-radius: 8px;
    width: 200px;
    height: 200px;
    background: white; /* QR codes need white background to be scannable */
    padding: 10px;
  }

  .qr-url {
    margin: 0;
    color: var(--secondary-text);
    font-size: 0.95rem;
    text-align: center;
    word-break: break-all;
  }
</style>
