<script>
// @ts-nocheck
import { onMount } from 'svelte';
import TopMenu from './TopMenu.svelte';
import './lib/top-menu.css';
import { loadFavoritesArray, saveFavoritesArray, removeFavoriteByIdArray } from './lib/favorites.js';

let favorites = loadFavoritesArray();
let categoryFilter = 'all'; // all, ai, crypto
let companySearch = '';
let locationSearch = '';
let titleSearch = '';
let loaded = false;

onMount(() => {
  loadFavorites();
  loaded = true;
});

function loadFavorites() {
  favorites = loadFavoritesArray();
}

function saveFavorites() {
  try {
    saveFavoritesArray(favorites);
  } catch (e) {
    console.error('Error saving favorites to localStorage:', e);
  }
}

function removeFavorite(id) {
  favorites = removeFavoriteByIdArray(favorites, id);
  saveFavorites();
}

function clearAllFavorites() {
  if (confirm('Are you sure you want to remove all favorite jobs?')) {
    favorites = [];
    saveFavorites();
  }
}

// Function to check if any search term matches the target string
function matchesAnyTerm(target, searchTerms) {
  if (!target || !searchTerms) return false;
  const terms = searchTerms.split(',').map(term => term.trim().toLowerCase()).filter(Boolean);
  if (terms.length === 0) return false;
  return terms.some(term => target.toLowerCase().includes(term));
}

$: filteredJobs = favorites.filter(job =>
  (categoryFilter === 'all' || job.category === categoryFilter) &&
  (!companySearch || (job.company && matchesAnyTerm(job.company, companySearch))) &&
  (!locationSearch || (job.location && matchesAnyTerm(job.location, locationSearch))) &&
  (!titleSearch || (job.title && matchesAnyTerm(job.title, titleSearch)))
);

$: groupedJobs = filteredJobs.reduce((groups, job) => {
  const company = job.company || 'Unknown';
  if (!Array.isArray(groups[company])) {
    groups[company] = [];
  }
  groups[company].push(job);
  return groups;
}, Object.create(null));

function toggleCategory(category) {
  categoryFilter = category;
}
</script>

<TopMenu active="favorites" />

<main>
  <div class="favorites-banner">
    <div class="favorites-banner-text">
      <span class="favorites-banner-title">My Favorite Jobs</span>
      <span class="favorites-banner-desc">A curated list of roles you've saved</span>
      <span class="total-jobs-text">{favorites.length} favorites</span>
    </div>
    <div class="banner-actions">
      {#if favorites.length > 0}
        <button class="clear-btn" on:click={clearAllFavorites} aria-label="Clear all favorites">
          Clear all
        </button>
      {/if}
    </div>
  </div>
  
  <div class="filter-bar">
    <div class="category-filter">
      <button 
        class="category-btn" 
        class:active={categoryFilter === 'all'} 
        on:click={() => toggleCategory('all')}
      >
        All Jobs
      </button>
      <button 
        class="category-btn crypto-btn" 
        class:active={categoryFilter === 'crypto'} 
        on:click={() => toggleCategory('crypto')}
      >
        Crypto Jobs
      </button>
      <button 
        class="category-btn ai-btn" 
        class:active={categoryFilter === 'ai'} 
        on:click={() => toggleCategory('ai')}
      >
        AI Jobs
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
      {#if !loaded}
        <tr><td colspan="2">Loading...</td></tr>
      {:else if favorites.length === 0}
        <tr><td colspan="2">
          <div class="empty-state">
            <div class="empty-icon">⭐</div>
            <div class="empty-text">No favorite jobs yet</div>
            <div class="empty-subtext">Add jobs to your favorites by clicking the star icon next to job titles</div>
          </div>
        </td></tr>
      {:else if filteredJobs.length === 0}
        <tr><td colspan="2">No jobs match your search.</td></tr>
      {:else}
        {#each Object.entries(groupedJobs) as [companyName, companyJobs]}
          <tr class="company-header">
            <td colspan="2" class="company-cell">
              <div class="company-row">
                {companyName}
                <span class="job-count">({companyJobs.length} job{companyJobs.length !== 1 ? 's' : ''})</span>
              </div>
            </td>
          </tr>
          {#each companyJobs as job}
            <tr class="job-row">
              <td>
                <div class="job-title-container">
                  <div>
                    <a href={job.link} target="_blank" rel="noopener noreferrer" class="job-title-link">
                      {job.title}
                    </a>
                    <span class="job-category-tag {job.category}">{job.category === 'ai' ? 'AI' : 'Crypto'}</span>
                  </div>
                  <button 
                    class="remove-btn" 
                    on:click|stopPropagation={() => removeFavorite(job.id)}
                    title="Remove from favorites"
                  >
                    ✕
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
  .favorites-banner {
    /* Use a 3-column grid so the center column can be visually centered
       while the actions live on the right. Left and right columns grow
       equally which balances the center column in the middle. */
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    background: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    gap: 1rem;
    box-shadow: 0 1px 0 rgba(15,15,15,0.03);
    color: #111827;
  }

  /* Mobile: stack the banner content as before */
  @media (max-width: 768px) {
    .favorites-banner {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      margin-bottom: 1.5rem;
      gap: 1rem;
      text-align: center;
    }
  }
  .favorites-banner-text {
    grid-column: 2;
  }
  /* favorites banner icon removed - styles cleaned up */
  .favorites-banner-text {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    text-align: center;
    align-items: center;
    min-width: 0; /* allow text to truncate/wrap within available space */
  }
  .favorites-banner-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #111827;
  }
  .favorites-banner-desc {
    font-size: 0.9rem;
    color: #6b7280;
  }
  
  @media (max-width: 768px) {
    .favorites-banner-desc {
      font-size: 0.8rem;
    }
  }
  .banner-actions {
    /* place actions into the right grid column and align them to the
       far right of the banner. On mobile the layout becomes static */
    grid-column: 3;
    justify-self: end;
    display: flex;
    flex-direction: row;
    gap: 0.8rem;
    align-items: center;
    flex: 0 0 auto;
  }

  /* top-menu and .new-jobs-btn styles are provided by src/lib/top-menu.css */
  .nav-btn {
    padding: 0.56rem 1.2rem;
    border-radius: 8px;
    background: rgba(255,255,255,0.2);
    color: #fff;
    font-weight: 600;
    font-size: 0.8rem;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: background 0.2s, transform 0.2s;
    white-space: nowrap;
  }
  .nav-btn:hover {
    background: rgba(255,255,255,0.3);
    transform: translateY(-2px) scale(1.03);
  }
  .clear-btn {
    padding: 0.48rem 1rem;
    border-radius: 8px;
    background: rgba(255,0,0,0.2);
    color: #fff;
    border: none;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(255,0,0,0.10);
    transition: background 0.2s, transform 0.2s;
    white-space: nowrap;
  }
  .clear-btn:hover {
    background: rgba(255,0,0,0.3);
    transform: translateY(-2px) scale(1.03);
  }
  .filter-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }
  .category-filter {
    display: flex;
    gap: 0.5rem;
    background: #f5f5f5;
    padding: 0.4rem;
    border-radius: 8px;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  }
  .category-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #666;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .category-btn.active {
    background: white;
    color: #333;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .crypto-btn.active {
    background: #ffb300;
    color: white;
  }
  .ai-btn.active {
    background: #037dd6;
    color: white;
  }
  
  @media (max-width: 768px) {
    .category-filter {
      padding: 0.3rem;
      width: 100%;
      justify-content: center;
    }
    .category-btn {
      padding: 0.4rem 0.6rem;
      font-size: 0.75rem;
      flex: 1;
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
  .job-title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
  .job-category-tag {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    margin-left: 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    color: white;
  }
  .job-category-tag.ai {
    background: #037dd6;
  }
  .job-category-tag.crypto {
    background: #ffb300;
  }
  .remove-btn {
    background: none;
    border: none;
    color: #999;
    font-size: 0.9rem;
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;
    padding: 0 0.5rem;
  }
  .remove-btn:hover {
    color: #ff5252;
    transform: scale(1.2);
  }
  .company-header {
    background: #f9f9f9;
    border-bottom: 2px solid #e0e0e0 !important;
  }
  .company-cell {
    padding: 1rem !important;
    font-weight: 600;
    font-size: 1.1rem;
  }
  .company-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .job-count {
    color: #666;
    font-size: 0.9rem;
  }
  .job-row {
    background: #fafafa;
  }
  .job-row:hover {
    background: #f5f5f5;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: #888;
  }
  .empty-icon {
    font-size: 3rem;
    color: #ddd;
    margin-bottom: 1rem;
  }
  .empty-text {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  .empty-subtext {
    font-size: 0.9rem;
    max-width: 300px;
  }
  
  @media (max-width: 768px) {
    .company-cell {
      padding: 0.75rem 0.3rem !important;
      font-size: 0.9rem;
    }
    .job-count {
      font-size: 0.75rem;
    }
    .empty-icon {
      font-size: 2rem;
    }
    .empty-text {
      font-size: 1rem;
    }
    .empty-subtext {
      font-size: 0.8rem;
    }
  }
  .total-jobs-text {
    display: inline-block;
    font-size: 0.9rem;
    color: #374151; /* slightly darker gray for readability */
    background: #f3f4f6; /* subtle neutral badge background */
    padding: 0.18rem 0.5rem;
    border-radius: 999px;
    font-weight: 600;
    margin-top: 0.2rem;
    box-shadow: 0 1px 0 rgba(15,15,15,0.03);
  }
  
  @media (max-width: 768px) {
    .total-jobs-text {
      font-size: 0.75rem;
    }
  }
</style>
