<script>
// @ts-nocheck
import { onMount } from 'svelte';
let companies = [];
let companiesLoaded = false;
let jobsCountByCompany = {};
let sortColumn = 'jobs';
let sortDirection = 'desc';
let companySearch = '';

function getCompanyLogoUrl(url) {
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

function sortCompanies(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'asc';
  }

  companies.sort((a, b) => {
    let aValue = column === 'jobs' ? (jobsCountByCompany[a.company_name] || 0) : a.company_name.toLowerCase();
    let bValue = column === 'jobs' ? (jobsCountByCompany[b.company_name] || 0) : b.company_name.toLowerCase();

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Trigger reactivity by reassigning the companies array
  companies = [...companies];
}

onMount(async () => {
  const [companiesRes, currentRes] = await Promise.all([
    fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_companies.json'),
    fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_current.json')
  ]);
  companies = await companiesRes.json();
  jobsCountByCompany = await currentRes.json();
  companiesLoaded = true;

  // Sort companies by jobs count in descending order (highest first)
  companies.sort((a, b) => (jobsCountByCompany[b.company_name] || 0) - (jobsCountByCompany[a.company_name] || 0));
  companies = [...companies]; // Trigger reactivity
});

$: filteredCompanies = companies.filter(company =>
  !companySearch || company.company_name.toLowerCase().includes(companySearch.toLowerCase())
);
</script>

<main>
  <div class="crypto-banner">
    <div class="crypto-banner-text">
      <span class="crypto-banner-title">AI Companies</span>
      <span class="crypto-banner-desc">Explore top AI companies and their careers pages.</span>
    </div>
  </div>
  <div class="search-bar">
    <input
      type="text"
      placeholder="Search company..."
      bind:value={companySearch}
      style="padding:0.5rem; width:100%; max-width:300px; margin-bottom:1rem;"
    />
  </div>
  <table>
    <tbody>
      {#if !companiesLoaded}
        <tr><td colspan="3">Loading...</td></tr>
      {:else if filteredCompanies.length === 0}
        <tr><td colspan="3">No companies found.</td></tr>
      {:else}
        {#each filteredCompanies as company}
          <tr>
            <td>
              {#if company.company_url && getCompanyLogoUrl(company.company_url)}
                <img src={getCompanyLogoUrl(company.company_url)} alt="logo" style="vertical-align:middle;width:20px;height:20px;margin-right:6px;border-radius:3px;" />
              {/if}
              {#if company.company_url}
                <a href={company.company_url} target="_blank" rel="noopener noreferrer">{company.company_name}</a>
              {:else}
                {company.company_name}
              {/if}
            </td>
            <td>
              {#if company.jobs_url}
                <a href={company.jobs_url} target="_blank" rel="noopener noreferrer">Careers</a>
              {:else}
                —
              {/if}
            </td>
            <td>{jobsCountByCompany[company.company_name] || 0}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</main>

<style>
  main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
  .crypto-banner-text {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .crypto-banner-title {
    font-size: 1.4rem;
    font-weight: 600;
    color: #333;
    letter-spacing: -0.01em;
  }
  .crypto-banner-desc {
    font-size: 0.95rem;
    color: #666;
  }
  .search-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
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
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
    word-break: break-word;
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr:hover {
    background: #f9f9f9;
  }
  a {
    color: #037dd6;
    text-decoration: none;
    font-weight: 500;
  }
  a:hover {
    text-decoration: underline;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    main {
      margin: 1rem auto;
      padding: 1rem;
    }
    .search-bar {
      flex-direction: column;
      align-items: stretch;
    }
    input {
      max-width: 100%;
      width: 100%;
      margin-bottom: 0.5rem;
    }
    table {
      display: block;
      overflow-x: auto;
      white-space: nowrap;
    }
    td {
      padding: 0.5rem;
      font-size: 0.75rem;
    }
  }
</style>
