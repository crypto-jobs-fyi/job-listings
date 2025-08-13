<script>
// @ts-nocheck
import { onMount } from 'svelte';
let jobs = [];
let companies = [];
let companySearch = '';
let locationSearch = '';
let titleSearch = '';
let jobsLoaded = false;
let companiesLoaded = false;
let totalJobs = null;

// Load jobs from remote JSON and companies from remote GitHub URL on mount
onMount(async () => {
  const [jobsRes, companiesRes, currentRes] = await Promise.all([
    fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_jobs.json'),
    fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_companies.json'),
    fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/ai_current.json')
  ]);
  const jobsData = await jobsRes.json();
  jobs = jobsData.data.filter(job => job.company && job.location);
  companies = await companiesRes.json();
  companiesLoaded = true;
  jobsLoaded = true;
  const currentData = await currentRes.json();
  totalJobs = currentData["Total Jobs"];
});

function getCompanyUrl(name) {
  const found = companies.find(c => c.company_name.toLowerCase() === name?.toLowerCase());
  return found ? found.company_url : null;
}

function getCompanyLogoUrl(name) {
  const url = getCompanyUrl(name);
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

$: filteredJobs = jobs.filter(job =>
  (!companySearch || (job.company && job.company.toLowerCase().includes(companySearch.toLowerCase()))) &&
  (!locationSearch || (job.location && job.location.toLowerCase().includes(locationSearch.toLowerCase()))) &&
  (!titleSearch || (job.title && job.title.toLowerCase().includes(titleSearch.toLowerCase())))
).map(job => ({
  ...job,
  location: job.location
    ? job.location.replace(/United States/g, 'US').replace(/United Kingdom/g, 'UK')
    : job.location
}));
</script>

<main>
  {#if totalJobs !== null}
    <div class="total-jobs-banner">Total Jobs: <span>{totalJobs}</span></div>
  {/if}
  <div class="crypto-banner">
    <img src="/ai-logo.svg" alt="AI Logo" class="crypto-banner-logo" />
    <div class="crypto-banner-text">
      <span class="crypto-banner-title">🤖 AI Jobs</span>
      <span class="crypto-banner-desc">Find your next opportunity in the world of AI, ML, and data science!</span>
    </div>
  </div>
  <div class="search-bar">
    <input
      type="text"
      placeholder="Search company..."
      bind:value={companySearch}
      style="padding:0.5rem; width:100%; max-width:180px;"
    />
    <input
      type="text"
      placeholder="Search title..."
      bind:value={titleSearch}
      style="padding:0.5rem; width:100%; max-width:180px;"
    />
    <input
      type="text"
      placeholder="Search location..."
      bind:value={locationSearch}
      style="padding:0.5rem; width:100%; max-width:180px;"
    />
  </div>
  <table>
    <thead>
      <tr>
        <th class="company-col">Company</th>
        <th class="title-col">Title</th>
        <th class="location-col">Location</th>
      </tr>
    </thead>
    <tbody>
      {#if jobs.length === 0 || !companiesLoaded}
        <tr><td colspan="3">Loading...</td></tr>
      {:else if filteredJobs.length === 0}
        <tr><td colspan="3">No results found.</td></tr>
      {:else}
        {#each filteredJobs as job}
          <tr>
            <td>
              {#if getCompanyUrl(job.company)}
                <a href={getCompanyUrl(job.company)} target="_blank" rel="noopener noreferrer">
                  {#if getCompanyLogoUrl(job.company)}
                    <img src={getCompanyLogoUrl(job.company)} alt="logo" style="vertical-align:middle;width:20px;height:20px;margin-right:6px;border-radius:3px;" />
                  {/if}
                  {job.company}
                </a>
              {:else}
                {job.company}
              {/if}
            </td>
            <td>
              <a href={job.link} target="_blank" rel="noopener noreferrer" class="job-title-link">
                {job.title}
              </a>
            </td>
            <td>
              {#if job.location && job.location.length > 24}
                <span title={job.location}>{job.location.slice(0, 24)}&hellip;</span>
              {:else}
                {job.location}
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
    max-width: 900px;
    margin: 2rem auto;
    padding: 2rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  @media (max-width: 768px) {
    main {
      margin: 1rem;
      padding: 1rem;
      border-radius: 6px;
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
  }
  
  @media (max-width: 768px) {
    table {
      font-size: 0.75rem;
    }
  }
  th, td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    text-align: left;
    word-break: break-word;
  }
  
  @media (max-width: 768px) {
    th, td {
      padding: 0.5rem 0.3rem;
      font-size: 0.75rem;
    }
  }
  th {
    background: #f8f8f8;
    font-weight: 600;
  }
  th.company-col {
    width: 25%;
  }
  th.title-col {
    width: 50%;
  }
  th.location-col {
    width: 25%;
  }
  tr:last-child td {
    border-bottom: none;
  }
  .crypto-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(90deg, #f8ffae 0%, #43c6ac 100%);
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(67,198,172,0.10);
    padding: 1.5rem 2rem;
    margin-bottom: 2.5rem;
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
  .crypto-banner-logo {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 8px rgba(67,198,172,0.10);
  }
  .crypto-banner-text {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  .crypto-banner-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #222;
    letter-spacing: 0.01em;
  }
  
  @media (max-width: 768px) {
    .crypto-banner-title {
      font-size: 1.1rem;
    }
  }
  .crypto-banner-desc {
    font-size: 1.05rem;
    color: #333;
    opacity: 0.85;
  }
  
  @media (max-width: 768px) {
    .crypto-banner-desc {
      font-size: 0.8rem;
    }
  }
  .total-jobs-banner {
    width: 100%;
    background: #43c6ac;
    color: #fff;
    font-size: 1.15rem;
    font-weight: 600;
    text-align: center;
    padding: 0.7rem 0;
    border-radius: 8px;
    margin-bottom: 1.2rem;
    letter-spacing: 0.01em;
    box-shadow: 0 2px 8px rgba(67,198,172,0.10);
  }
  
  @media (max-width: 768px) {
    .total-jobs-banner {
      font-size: 0.9rem;
      padding: 0.5rem 0;
    }
  }
  .job-title-link {
    color: #646cff;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }
  .job-title-link:hover {
    color: #222;
    text-decoration: underline;
  }
</style>
