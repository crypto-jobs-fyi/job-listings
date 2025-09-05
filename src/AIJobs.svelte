<script>
// @ts-nocheck
import { onMount } from 'svelte';
import TopMenu from './TopMenu.svelte';
import './lib/top-menu.css';
import { makeJobId, loadFavoritesMap, saveFavoritesMap, toggleFavoriteInMap } from './lib/favorites.js';
import { getCompanyUrlFromList, getCompanyLogoUrlFromList } from './lib/companyLogos.js';
let jobs = [];
let companies = [];
let companySearch = '';
let locationSearch = '';
let titleSearch = '';
let jobsLoaded = false;
let companiesLoaded = false;
let totalJobs = null;
let collapsedCompanies = new Set();
let favorites = loadFavoritesMap();

// Derive a plain Set of favorite IDs so Svelte's reactivity reliably updates the UI
$: favoriteIds = new Set(Array.from(favorites.keys()));

// Load jobs from remote JSON and companies from remote GitHub URL on mount
onMount(async () => {
  // Load favorites from localStorage
  loadFavorites();
  try {
    const [jobsRes, companiesRes, currentRes] = await Promise.all([
      fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_jobs.json'),
      fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_companies.json'),
      fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_current.json')
    ]);

    // Be defensive: check response.ok and JSON shape
    const jobsData = await jobsRes.json().catch(() => null);
    if (jobsData && Array.isArray(jobsData.data)) {
      jobs = jobsData.data.filter(job => job.company && job.location);
    } else if (Array.isArray(jobsData)) {
      jobs = jobsData.filter(job => job.company && job.location);
    } else {
      // fallback to empty array
      jobs = [];
    }

    const companiesJson = await companiesRes.json().catch(() => null);
    companies = companiesJson || [];

    const currentData = await currentRes.json().catch(() => null);
    if (currentData && currentData["Total Jobs"] !== undefined) {
      totalJobs = currentData["Total Jobs"];
    }
  } catch (err) {
    console.error('Error loading AI jobs or companies:', err);
    // keep jobs empty so UI shows 'No results' instead of stuck 'Loading...'
    jobs = [];
    companies = [];
  } finally {
    companiesLoaded = true;
    jobsLoaded = true;
  }
});

function loadFavorites() {
  favorites = loadFavoritesMap();
}

function saveFavorites() {
  saveFavoritesMap(favorites);
}

function toggleFavorite(job) {
  favorites = toggleFavoriteInMap(favorites, job, 'ai');
  saveFavorites();
}

function isFavorite(job) {
  const jobId = `${job.company}-${job.title}-${job.link}`.replace(/\s+/g, '-');
  // Use the derived Set for quick lookup and reliable reactivity
  return favoriteIds.has(jobId);
}

function getCompanyUrl(name) {
  return getCompanyUrlFromList(companies, name);
}

function getCompanyLogoUrl(name) {
  return getCompanyLogoUrlFromList(companies, name);
}

// Function to check if any search term matches the target string
function matchesAnyTerm(target, searchTerms) {
  if (!target || !searchTerms) return false;
  const terms = searchTerms.split(',').map(term => term.trim().toLowerCase()).filter(Boolean);
  if (terms.length === 0) return false;
  return terms.some(term => target.toLowerCase().includes(term));
}

$: filteredJobs = jobs.filter(job =>
  (!companySearch || (job.company && matchesAnyTerm(job.company, companySearch))) &&
  (!locationSearch || (job.location && matchesAnyTerm(job.location, locationSearch))) &&
  (!titleSearch || (job.title && matchesAnyTerm(job.title, titleSearch)))
);

$: groupedJobs = filteredJobs.reduce((groups, job) => {
  const company = String(job.company ?? '');
  // Use a null-prototype object to avoid collisions with Object.prototype keys
  if (!groups || groups === Object.prototype) groups = Object.create(null);
  if (!Array.isArray(groups[company])) {
    groups[company] = [];
  }
  groups[company].push(job);
  return groups;
}, Object.create(null));

function toggleCompany(companyName) {
  if (collapsedCompanies.has(companyName)) {
    collapsedCompanies.delete(companyName);
  } else {
    collapsedCompanies.add(companyName);
  }
  collapsedCompanies = collapsedCompanies; // Trigger reactivity
}

function shareOnLinkedIn() {
  // Format the search terms for display - remove empty terms and format ,-separated terms
  const formatSearchTerms = (terms) => {
    if (!terms) return '';
    return terms.split(',')
      .map(term => term.trim())
      .filter(Boolean)
      .join(', ');
  };
  
  const companyTerms = formatSearchTerms(companySearch);
  const titleTerms = formatSearchTerms(titleSearch);
  const locationTerms = formatSearchTerms(locationSearch);
  
  // Combine search terms with labels if they exist
  const searchParts = [];
  if (companyTerms) searchParts.push(`Companies: ${companyTerms}`);
  if (titleTerms) searchParts.push(`Titles: ${titleTerms}`);
  if (locationTerms) searchParts.push(`Locations: ${locationTerms}`);
  
  const searchText = searchParts.length ? ` for ${searchParts.join(' | ')}` : '';
  const resultCount = filteredJobs.length;
  const url = 'https://job-finder.org/';
  
  // Create a table of top 5 jobs for the post
  const topJobs = filteredJobs.slice(0, 5);
  let jobTable = '';
  if (topJobs.length > 0) {
    jobTable = '\n\nTop opportunities:\n';
    topJobs.forEach((job, index) => {
      const location = job.location && job.location.length > 20 ? 
        job.location.slice(0, 20) + '...' : job.location;
      jobTable += `${index + 1}. ${job.title} - ${location}\n   Apply: ${job.link}\n`;
    });
    if (filteredJobs.length > 5) {
      jobTable += `\n...and ${filteredJobs.length - 5} more opportunities at ${url}!`;
    }
  }
  
  const text = `Found ${resultCount} AI job opportunities${searchText}! ${jobTable}\n\n#AIJobs`;
  
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(linkedInUrl, '_blank', 'width=600,height=400');
}
</script>

<TopMenu active="ai" />

<main>
  <div class="crypto-banner">
    <div class="crypto-banner-text">
      <span class="crypto-banner-title">🤖 AI Jobs</span>
      <span class="crypto-banner-desc">Find your next opportunity in the world of AI, ML, and data science!</span>
      {#if totalJobs !== null}
        <span class="total-jobs-text">Total Jobs: <span>{totalJobs}</span></span>
      {/if}
    </div>
    <div class="banner-actions">
      <a href="/ai-new-jobs.html" class="new-jobs-btn">New Jobs</a>
      <button class="share-btn" on:click={shareOnLinkedIn} title="Share on LinkedIn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Share
      </button>
    </div>
  </div>
  <div class="search-bar">
    <input
      type="text"
      placeholder="Search company(s)"
      bind:value={companySearch}
      style="padding:0.5rem; width:100%; max-width:220px;"
    />
    <input
      type="text"
      placeholder="Search title(s)"
      bind:value={titleSearch}
      style="padding:0.5rem; width:100%; max-width:220px;"
    />
    <input
      type="text"
      placeholder="Search location(s)"
      bind:value={locationSearch}
      style="padding:0.5rem; width:100%; max-width:220px;"
    />
  </div>
  <table>
    <colgroup>
      <col style="width: 70%;">
      <col style="width: 30%;">
    </colgroup>
    <tbody>
      {#if jobs.length === 0 || !companiesLoaded}
        <tr><td colspan="2">Loading...</td></tr>
      {:else if filteredJobs.length === 0}
        <tr><td colspan="2">No results found.</td></tr>
      {:else}
        {#each Object.entries(groupedJobs) as [companyName, companyJobs]}
          <tr class="company-header" on:click={() => toggleCompany(companyName)}>
            <td colspan="2" class="company-cell">
              <div class="company-row">
                <span class="toggle-icon" class:collapsed={collapsedCompanies.has(companyName)}>
                  ▼
                </span>
                {#if getCompanyUrl(companyName)}
                  <a href={getCompanyUrl(companyName)} target="_blank" rel="noopener noreferrer" class="company-link" on:click|stopPropagation>
                    {#if getCompanyLogoUrl(companyName)}
                      <img src={getCompanyLogoUrl(companyName)} alt="logo" style="vertical-align:middle;width:20px;height:20px;margin-right:6px;border-radius:3px;" />
                    {/if}
                    {companyName}
                  </a>
                {:else}
                  <span class="company-name">
                    {#if getCompanyLogoUrl(companyName)}
                      <img src={getCompanyLogoUrl(companyName)} alt="logo" style="vertical-align:middle;width:20px;height:20px;margin-right:6px;border-radius:3px;" />
                    {/if}
                    {companyName}
                  </span>
                {/if}
                <span class="job-count">({companyJobs.length} job{companyJobs.length !== 1 ? 's' : ''})</span>
              </div>
            </td>
          </tr>
          {#if !collapsedCompanies.has(companyName)}
            {#each companyJobs as job}
              <tr class="job-row">
                <td>
                  <div class="job-title-container">
                    <a href={job.link} target="_blank" rel="noopener noreferrer" class="job-title-link">
                      {job.title}
                    </a>
                    <button 
                      class="favorite-btn" 
                      class:favorited={isFavorite(job)} 
                      on:click|stopPropagation={() => toggleFavorite(job)}
                      title={isFavorite(job) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {#if isFavorite(job)}
                        ★
                      {:else}
                        ☆
                      {/if}
                    </button>
                  </div>
                </td>
                <td>
                  {#if job.location && job.location.length > 36}
                    <span title={job.location}>{job.location.slice(0, 36)}&hellip;</span>
                  {:else}
                    {job.location}
                  {/if}
                </td>
              </tr>
            {/each}
          {/if}
        {/each}
      {/if}
    </tbody>
  </table>
</main>

<style>
  main {
    max-width: 80vw;
    margin: 2rem auto;
    padding: 2rem;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 90vw) {
    main {
      margin: 0 5vw;
      padding: 1rem;
      border-radius: 6px;
      max-width: 90vw;
    }
  }
  .search-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    .search-bar {
      gap: 0.5rem;
      flex-direction: column;
      align-items: center;
    }
  }
  input {
    margin-bottom: 1rem;
    padding: 0.5rem;
    width: 100%;
    max-width: 180px;
    height: 40px;
    box-sizing: border-box;
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    input {
      max-width: 100%;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      padding: 0.4rem;
    }
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
    table-layout: fixed;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
  }
  
  @media (max-width: 768px) {
    table {
      font-size: 0.75rem;
    }
  }
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
    word-break: break-word;
  }
  
  @media (max-width: 768px) {
    td {
      padding: 0.5rem 0.3rem;
      font-size: 0.75rem;
    }
  }
  tr:last-child td {
    border-bottom: none;
  }
  .crypto-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f7f7f7;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 1.5rem 2rem;
    margin-bottom: 2rem;
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    .crypto-banner {
      flex-direction: column;
      padding: 1rem;
      margin-bottom: 1.5rem;
      gap: 1rem;
      text-align: center;
    }
  }
  .crypto-banner-text {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    text-align: center;
    flex: 1;
  }
  .crypto-banner-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #333;
    letter-spacing: -0.01em;
  }
  
  @media (max-width: 768px) {
    .crypto-banner-title {
      font-size: 1.1rem;
    }
  }
  .crypto-banner-desc {
    font-size: 0.95rem;
    color: #666;
  }
  
  @media (max-width: 768px) {
    .crypto-banner-desc {
      font-size: 0.8rem;
    }
  }
  /* top menu and .new-jobs-btn styles are provided by src/lib/top-menu.css */
  .banner-actions {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    align-items: center;
  }
  .share-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.48rem 1rem;
    border-radius: 8px;
    background: #0077b5;
    color: white;
    border: none;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0,119,181,0.20);
    transition: background 0.2s, transform 0.2s;
    white-space: nowrap;
  }
  
  @media (max-width: 768px) {
    .share-btn {
      font-size: 0.64rem;
      padding: 0.4rem 0.8rem;
    }
    .banner-actions {
      gap: 0.6rem;
    }
  }
  .share-btn:hover {
    background: #005885;
    transform: translateY(-2px) scale(1.03);
  }
  .total-jobs-text {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
    margin-top: 0.2rem;
  }
  
  @media (max-width: 768px) {
    .total-jobs-text {
      font-size: 0.75rem;
    }
  }
  .job-title-link {
    color: #037dd6;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }
  .job-title-link:hover {
    text-decoration: underline;
  }
  .job-title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .favorite-btn {
    background: none;
    border: none;
    color: #999;
    font-size: 1.2rem;
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;
    padding: 0 0.5rem;
  }
  .favorite-btn.favorited {
    color: #ffb300;
  }
  .favorite-btn:hover {
    transform: scale(1.2);
  }
  .company-header {
    background: #f9f9f9;
    cursor: pointer;
    border-bottom: 2px solid #e0e0e0 !important;
  }
  .company-header:hover {
    background: #f0f0f0;
  }
  .company-cell {
    padding: 1rem !important;
    font-weight: 600;
    font-size: 1.1rem;
  }
  .company-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .toggle-icon {
    font-size: 0.8rem;
    transition: transform 0.2s ease;
    color: #666;
  }
  .toggle-icon.collapsed {
    transform: rotate(-90deg);
  }
  .company-link, .company-name {
    display: flex;
    align-items: center;
    color: #333;
    text-decoration: none;
  }
  .company-link:hover {
    text-decoration: underline;
  }
  .job-count {
    color: #666;
    font-size: 0.9rem;
    margin-left: auto;
  }
  .job-row {
    background: #fafafa;
  }
  .job-row:hover {
    background: #f5f5f5;
  }
  
  @media (max-width: 768px) {
    .company-cell {
      padding: 0.75rem 0.3rem !important;
      font-size: 0.9rem;
    }
    .job-count {
      font-size: 0.75rem;
    }
  }
</style>
