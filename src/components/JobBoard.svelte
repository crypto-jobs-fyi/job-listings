<script lang="ts">
  import type { Job } from '../types/job';
  import type { FavoriteJob } from '../types/favorites';
  import type { Company } from '../types/company';
  import { favorites } from '../stores/favorites';
  import { filterJobs, groupJobsByCompany, makeJobId } from '../utils/search';
  import SearchBar from './SearchBar.svelte';
  import QuickFilters from './QuickFilters.svelte';

  /**
   * Generic JobBoard Component - Can be used for any job listing type (Crypto/AI, Jobs/NewJobs)
   *
   * Props:
   * - jobs: Array of jobs to display
   * - bannerTitle: Title for the banner
   * - bannerDesc: Description for the banner
   * - totalJobs: Total number of jobs available
   * - category: 'crypto' | 'ai'
   * - getCompanyUrl: Function to get company URL
   * - getCompanyLogoUrl: Function to get company logo URL
   */

  export let jobs: Job[] = [];
  export let companies: Company[] = [];
  export let bannerTitle: string = 'Jobs';
  export let totalJobs: number | null = null;
  export let category: 'crypto' | 'ai' = 'crypto';
  export let showBanner: boolean = true;
  export let showCompanySearch: boolean = true;
  export let showTitleSearch: boolean = true;
  export let showLocationSearch: boolean = true;
  export let isCompaniesView: boolean = false;
  export let isFavoritesView: boolean = false;
  export let onClearFavorites: () => void = () => {};
  export let getCompanyUrl: (name: string) => string | null = () => null;
  export let getCompanyLogoUrl: (name: string) => string | null = () => null;

  let companySearch = '';
  let locationSearch = '';
  let titleSearch = '';
  let collapsedCompanies = new Set<string>();

  $: isCompaniesPage = isCompaniesView;

  // Filter jobs based on search
  $: filteredJobs = filterJobs(jobs, companySearch, locationSearch, titleSearch);

  // Deduplicate jobs based on their unique ID
  $: dedupedJobs = (() => {
    const seen = new Set<string>();
    return filteredJobs.filter((job) => {
      const id = makeJobId(job);
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  })();

  // Group jobs by company
  $: groupedJobs = groupJobsByCompany(dedupedJobs);

  // Group ALL jobs by company for the companies view (to show total job counts)
  $: allGroupedJobs = groupJobsByCompany(jobs);

  // Filter companies based on search
  $: filteredCompanies = companies.filter(
    (c) => !companySearch || c.company_name.toLowerCase().includes(companySearch.toLowerCase())
  );

  function toggleFavorite(job: Job) {
    const jobId = makeJobId(job);
    const favorite: FavoriteJob = {
      id: jobId,
      company: job.company,
      title: job.title,
      location: job.location,
      link: job.link,
      category,
      addedAt: Date.now(),
    };
    favorites.toggle(favorite);
  }

  function toggleCompany(companyName: string) {
    collapsedCompanies = new Set(
      collapsedCompanies.has(companyName)
        ? Array.from(collapsedCompanies).filter((c) => c !== companyName)
        : [...Array.from(collapsedCompanies), companyName]
    );
  }

  function shareOnLinkedIn() {
    const formatSearchTerms = (terms: string) => {
      if (!terms) return '';
      return terms
        .split(',')
        .map((term) => term.trim())
        .filter(Boolean)
        .join(', ');
    };

    const companyTerms = formatSearchTerms(companySearch);
    const titleTerms = formatSearchTerms(titleSearch);
    const locationTerms = formatSearchTerms(locationSearch);

    const searchParts = [];
    if (companyTerms) searchParts.push(`Companies: ${companyTerms}`);
    if (titleTerms) searchParts.push(`Titles: ${titleTerms}`);
    if (locationTerms) searchParts.push(`Locations: ${locationTerms}`);

    const searchText = searchParts.length ? ` for ${searchParts.join(' | ')}` : '';
    const resultCount = filteredJobs.length;
    const url = 'https://job-finder.org/';

    const topJobs = filteredJobs.slice(0, 5);
    let jobTable = '';
    if (topJobs.length > 0) {
      jobTable = '\n\nTop opportunities:\n';
      topJobs.forEach((job, index) => {
        const location =
          job.location && job.location.length > 20
            ? job.location.slice(0, 20) + '...'
            : job.location;
        jobTable += `${index + 1}. ${job.title} - ${location}\n   Apply: ${job.link}\n`;
      });
      if (filteredJobs.length > 5) {
        jobTable += `\n...and ${filteredJobs.length - 5} more opportunities at ${url}!`;
      }
    }

    const text = `Found ${resultCount} job opportunities${searchText}! 🚀 Check out these amazing opportunities! ${jobTable}\n\n#${category === 'crypto' ? 'CryptoJobs' : 'AIJobs'}`;

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  }
</script>

<main>
  {#if showBanner}
    <div class="crypto-banner {category}">
      <div class="crypto-banner-text">
        <span class="crypto-banner-title">
          {bannerTitle}
          {totalJobs !== null ? `(${totalJobs})` : ''}
        </span>
      </div>
      <div class="banner-actions">
        {#if isFavoritesView}
          <button class="clear-btn" on:click={onClearFavorites}>
            <span class="icon">🗑️</span> Clear all
          </button>
        {:else if !isCompaniesView}
          <a href="/favorites.html" class="new-jobs-btn">
            <span class="icon">⭐</span> Favorites
          </a>
        {/if}
        {#if !isCompaniesView}
          <button class="share-btn" on:click={shareOnLinkedIn} title="Share on LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
              />
            </svg>
            Share
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <SearchBar
    {companySearch}
    {locationSearch}
    {titleSearch}
    {showCompanySearch}
    {showTitleSearch}
    {showLocationSearch}
    onCompanySearchChange={(val) => (companySearch = val)}
    onLocationSearchChange={(val) => (locationSearch = val)}
    onTitleSearchChange={(val) => (titleSearch = val)}
  />

  {#if !isCompaniesPage}
    <QuickFilters
      onQAClick={() => (titleSearch = 'QA, Test, Quality')}
      onDevOpsClick={() => (titleSearch = 'DevOps, SRE, Infrastructure, Cloud')}
      onClearClick={() => {
        companySearch = '';
        locationSearch = '';
        titleSearch = '';
      }}
    />
  {/if}

  <table>
    <colgroup>
      {#if isCompaniesPage}
        <col style="width: 50%;" />
        <col style="width: 25%;" />
        <col style="width: 25%;" />
      {:else}
        <col style="width: 70%;" />
        <col style="width: 30%;" />
      {/if}
    </colgroup>
    <tbody>
      {#if isCompaniesPage}
        <!-- Companies view -->
        {#if companies.length === 0}
          <tr><td colspan="3" class="empty-state">Loading companies...</td></tr>
        {:else if filteredCompanies.length === 0}
          <tr><td colspan="3" class="empty-state">No companies found matching your search.</td></tr>
        {:else}
          {#each filteredCompanies as company (company.company_name)}
            {@const jobCount = allGroupedJobs[company.company_name]?.length || 0}
            <tr class="company-row-item">
              <td>
                <div class="company-row">
                  {#if getCompanyLogoUrl(company.company_name)}
                    <img
                      src={getCompanyLogoUrl(company.company_name)}
                      alt="logo"
                      class="company-logo"
                    />
                  {/if}
                  {#if company.company_url}
                    <a
                      href={company.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="company-link"
                    >
                      {company.company_name}
                    </a>
                  {:else}
                    {company.company_name}
                  {/if}
                </div>
              </td>
              <td>
                {#if jobCount > 0}
                  <span class="job-count-text">{jobCount} job{jobCount !== 1 ? 's' : ''}</span>
                {:else}
                  <span class="text-muted">—</span>
                {/if}
              </td>
              <td>
                {#if company.jobs_url}
                  <a
                    href={company.jobs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="careers-link">Careers ↗</a
                  >
                {:else}
                  <span class="text-muted">—</span>
                {/if}
              </td>
            </tr>
          {/each}
        {/if}
      {:else if jobs.length === 0}
        <tr><td colspan="2" class="empty-state">Loading...</td></tr>
      {:else if filteredJobs.length === 0}
        <tr><td colspan="2" class="empty-state">No results found.</td></tr>
      {:else}
        {#each Object.entries(groupedJobs) as [companyName, companyJobs] (companyName)}
          <tr class="company-header" on:click={() => toggleCompany(companyName)}>
            <td colspan="2" class="company-cell">
              <div class="company-row">
                <span class="toggle-icon" class:collapsed={collapsedCompanies.has(companyName)}>
                  ▼
                </span>
                {#if getCompanyUrl(companyName)}
                  <a
                    href={getCompanyUrl(companyName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="company-link"
                    on:click|stopPropagation
                  >
                    {#if getCompanyLogoUrl(companyName)}
                      <img src={getCompanyLogoUrl(companyName)} alt="logo" class="company-logo" />
                    {/if}
                    {companyName}
                  </a>
                {:else}
                  {#if getCompanyLogoUrl(companyName)}
                    <img src={getCompanyLogoUrl(companyName)} alt="logo" class="company-logo" />
                  {/if}
                  {companyName}
                {/if}
                <span class="job-count">({companyJobs.length})</span>
              </div>
            </td>
          </tr>
          {#if !collapsedCompanies.has(companyName)}
            {#each companyJobs as job (makeJobId(job))}
              {@const favorited = $favorites.has(makeJobId(job))}
              <tr class="job-row">
                <td>
                  <div class="job-title-container">
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="job-title-link"
                    >
                      {job.title}
                    </a>
                    <button
                      class="favorite-btn"
                      class:favorited
                      on:click|stopPropagation={() => toggleFavorite(job)}
                      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <span style="color: {favorited ? '#FFD700' : 'var(--border-color)'};">
                        {favorited ? '★' : '☆'}
                      </span>
                    </button>
                  </div>
                </td>
                <td><span class="location-tag">{job.location}</span></td>
              </tr>
            {/each}
          {/if}
        {/each}
      {/if}
    </tbody>
  </table>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      'Roboto',
      sans-serif;
    background-color: var(--bg-color);
    color: var(--text-color);
  }

  main {
    padding: 2rem 1rem;
    max-width: 960px;
    margin: 0 auto;
  }

  /* Banner as Page Title */
  .crypto-banner {
    background: transparent;
    color: var(--text-color);
    padding: 2rem 0;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--border-color);
  }

  .crypto-banner-text {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .crypto-banner-title {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .banner-actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  /* Notion-style buttons */
  .new-jobs-btn,
  .share-btn,
  .clear-btn {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.1s ease;
    background-color: transparent;
    color: var(--secondary-text);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .new-jobs-btn:hover,
  .share-btn:hover,
  .clear-btn:hover {
    background-color: var(--hover-bg);
    color: var(--text-color);
  }

  .icon {
    font-size: 1rem;
  }

  /* Table Styles */
  table {
    width: 100%;
    border-collapse: collapse;
    border: none;
    font-size: 0.95rem;
  }

  tbody tr:nth-child(odd) {
    background-color: transparent;
  }

  tbody tr:hover {
    background-color: var(--hover-bg);
  }

  /* Group Headers */
  .company-header {
    background-color: transparent !important;
    color: var(--text-color);
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    border-top: 1px solid var(--border-color);
  }

  .company-header:hover {
    background-color: var(--hover-bg) !important;
  }

  .company-cell {
    padding: 0.75rem 0.5rem;
    color: var(--text-color);
  }

  .company-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
  }

  .company-logo {
    vertical-align: middle;
    width: 20px;
    height: 20px;
    border-radius: 3px;
  }

  .toggle-icon {
    color: var(--secondary-text);
    font-size: 0.8rem;
    transition: transform 0.2s ease;
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 3px;
  }

  .toggle-icon:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .toggle-icon.collapsed {
    transform: rotate(-90deg);
  }

  .company-link {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid transparent;
  }

  .company-link:hover {
    border-bottom-color: var(--text-color);
  }

  .job-count {
    margin-left: auto;
    color: var(--secondary-text);
    font-size: 0.9rem;
    font-weight: normal;
  }

  .job-count-text {
    color: var(--secondary-text);
    font-size: 0.9rem;
  }

  .careers-link {
    color: var(--secondary-text);
    text-decoration: none;
    font-size: 0.9rem;
    border-bottom: 1px solid transparent;
  }

  .careers-link:hover {
    color: var(--text-color);
    border-bottom-color: var(--text-color);
  }

  /* Job Rows */
  .job-row td {
    padding: 0.5rem 0.5rem 0.5rem 2.5rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-color);
  }

  .job-row:last-child td {
    border-bottom: none;
  }

  .job-title-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .job-title-link {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px solid transparent;
  }

  .job-title-link:hover {
    border-bottom-color: var(--text-color);
  }

  .location-tag {
    color: var(--secondary-text);
    font-size: 0.9rem;
  }

  .favorite-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease;
    opacity: 0;
  }

  .job-row:hover .favorite-btn,
  .favorite-btn:focus,
  .favorite-btn.favorited {
    opacity: 1;
  }

  .empty-state {
    padding: 2rem;
    text-align: center;
    color: var(--secondary-text);
  }

  .text-muted {
    color: var(--secondary-text);
  }

  @media (max-width: 768px) {
    .crypto-banner {
      flex-direction: column;
      align-items: flex-start;
    }

    .crypto-banner-title {
      font-size: 2rem;
    }

    /* Mobile Table Refactor */
    table,
    tbody,
    tr,
    td {
      display: block;
      width: 100%;
      box-sizing: border-box;
    }

    colgroup {
      display: none;
    }

    .company-header {
      margin-top: 1rem;
      border-radius: 6px 6px 0 0;
      border: 1px solid var(--border-color);
      border-bottom: none;
    }

    .company-cell {
      padding: 1rem;
    }

    .job-row {
      border: 1px solid var(--border-color);
      border-top: none;
      background: var(--card-bg);
    }

    .job-row:last-child {
      border-radius: 0 0 6px 6px;
    }

    .job-row td {
      padding: 0.5rem 1rem;
      border: none;
    }

    .job-row td:first-child {
      padding-top: 1rem;
    }

    .job-row td:last-child {
      padding-bottom: 1rem;
      color: var(--secondary-text);
    }

    .job-title-container {
      flex-direction: row; /* Keep title and star on same line */
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }

    .job-title-link {
      font-size: 1.1rem;
      font-weight: 600;
      white-space: normal; /* Allow wrapping */
    }

    .favorite-btn {
      opacity: 1; /* Always show on mobile */
      padding: 0;
      margin-left: 0.5rem;
    }

    /* Companies View Mobile */
    .company-row-item {
      border: 1px solid var(--border-color);
      margin-bottom: 1rem;
      border-radius: 6px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .company-row-item td {
      padding: 0;
      border: none;
    }

    .company-row-item td:nth-child(2)::before {
      content: 'Open Jobs: ';
      color: var(--secondary-text);
    }

    .company-row-item td:nth-child(3) {
      margin-top: 0.5rem;
    }
  }
</style>
