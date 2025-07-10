<script>
// @ts-nocheck
import { onMount } from 'svelte';
let companies = [];
let companiesLoaded = false;
let jobsCountByCompany = {};
let sortColumn = 'jobs';
let sortDirection = 'desc';

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

  companies.sort((a, b) => (jobsCountByCompany[b.company_name] || 0) - (jobsCountByCompany[a.company_name] || 0));
});
</script>

<main>
  <div class="ai-companies-banner">
    <span class="ai-companies-title">🤖 AI Companies</span>
    <span class="ai-companies-desc">Explore top AI companies and their careers pages.</span>
  </div>
  <table>
    <thead>
      <tr>
        <th on:click={() => sortCompanies('company_name')} style="cursor: pointer;">
          Company Name {sortColumn === 'company_name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
        </th>
        <th>Careers Page</th>
        <th on:click={() => sortCompanies('jobs')} style="cursor: pointer;">
          Jobs {sortColumn === 'jobs' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
        </th>
      </tr>
    </thead>
    <tbody>
      {#if !companiesLoaded}
        <tr><td colspan="3">Loading...</td></tr>
      {:else if companies.length === 0}
        <tr><td colspan="3">No companies found.</td></tr>
      {:else}
        {#each companies as company}
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
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .ai-companies-banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    margin-bottom: 2rem;
  }
  .ai-companies-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #222;
    letter-spacing: 0.01em;
  }
  .ai-companies-desc {
    font-size: 1.05rem;
    color: #333;
    opacity: 0.85;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
    table-layout: fixed;
  }
  th, td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    text-align: left;
    word-break: break-word;
  }
  th {
    background: #f8f8f8;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
  }
  tr:last-child td {
    border-bottom: none;
  }
  a {
    color: #646cff;
    text-decoration: underline;
    font-weight: 500;
  }
  a:hover {
    color: #222;
  }
</style>
