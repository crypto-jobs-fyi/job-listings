<script>
  import { onMount } from 'svelte';
  let jobs = [];
  let companies = [];
  let companySearch = '';
  let locationSearch = '';
  let titleSearch = '';
  let jobsLoaded = false;
  let companiesLoaded = false;
  let collapsedCompanies = new Set();

  onMount(async () => {
    const [jobsRes, companiesRes] = await Promise.all([
      fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/jobs_new.json'),
      fetch('https://raw.githubusercontent.com/crypto-jobs-fyi/crawler/refs/heads/main/companies.json')
    ]);
    const jobsData = await jobsRes.json();
    jobs = jobsData.data.filter(job => job.company && job.location);
    companies = await companiesRes.json();
    companiesLoaded = true;
    jobsLoaded = true;
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
  );

  $: groupedJobs = filteredJobs.reduce((groups, job) => {
    const company = job.company;
    if (!groups[company]) {
      groups[company] = [];
    }
    groups[company].push(job);
    return groups;
  }, {});

  function toggleCompany(companyName) {
    if (collapsedCompanies.has(companyName)) {
      collapsedCompanies.delete(companyName);
    } else {
      collapsedCompanies.add(companyName);
    }
    collapsedCompanies = collapsedCompanies; // Trigger reactivity
  }
</script>

<main>
  <div class="crypto-banner">
    <div class="crypto-banner-text">
      <span class="crypto-banner-title">🚀 New Crypto Jobs</span>
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
    <colgroup>
      <col style="width: 70%;">
      <col style="width: 30%;">
    </colgroup>
    <tbody>
      {#if jobs.length === 0 || !jobsLoaded}
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
                  <a href={job.link} target="_blank" rel="noopener noreferrer" class="job-title-link">
                    {job.title}
                  </a>
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
  .job-title-link {
    color: #037dd6;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
  }
  .job-title-link:hover {
    text-decoration: underline;
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
