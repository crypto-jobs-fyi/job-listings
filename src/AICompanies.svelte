<script>
// @ts-nocheck
import { onMount } from 'svelte';
let companies = [];
let companiesLoaded = false;

function getCompanyLogoUrl(url) {
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

onMount(async () => {
  const res = await fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_companies.json');
  companies = await res.json();
  companiesLoaded = true;
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
        <th>Company Name</th>
        <th>Careers Page</th>
      </tr>
    </thead>
    <tbody>
      {#if !companiesLoaded}
        <tr><td colspan="2">Loading...</td></tr>
      {:else if companies.length === 0}
        <tr><td colspan="2">No companies found.</td></tr>
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
