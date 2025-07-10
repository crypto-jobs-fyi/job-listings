<script>
  import { onMount } from 'svelte';
  let jobs = [];
  let companies = [];
  let companySearch = '';
  let locationSearch = '';
  let titleSearch = '';
  let jobsLoaded = false;
  let companiesLoaded = false;
  let showPopup = false;
  let popupJob = null;
  let popupLoading = false;
  let popupError = '';

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
  ).map(job => ({
    ...job,
    location: job.location
      ? job.location.replace(/United States/g, 'US').replace(/United Kingdom/g, 'UK')
      : job.location
  }));

  async function openPopup(job) {
    showPopup = true;
    popupJob = job;
    popupLoading = true;
    popupError = '';
    try {
      // Try to fetch the job description from the apply URL (expecting HTML)
      const url = job.link;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load description');
      const html = await res.text();
      // Try to extract a main content or fallback to body
      const match = html.match(/<main[\s\S]*?<\/main>/i) || html.match(/<body[\s\S]*?<\/body>/i);
    } catch (e) {
      popupError = 'Could not load job description.';
    } finally {
      popupLoading = false;
    }
  }

  function closePopup() {
    showPopup = false;
    popupJob = null;
    popupError = '';
  }
</script>

<main>
  <div class="crypto-banner">
    <img src="/crypto-logo.svg" alt="Crypto Logo" class="crypto-banner-logo" />
    <div class="crypto-banner-text">
      <span class="crypto-banner-title">🚀 New Crypto Jobs</span>
      <span class="crypto-banner-desc">Find your next opportunity in the world of blockchain, DeFi, and digital assets!</span>
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
        <th>Link</th>
      </tr>
    </thead>
    <tbody>
      {#if jobs.length === 0 || !jobsLoaded}
        <tr><td colspan="4">Loading...</td></tr>
      {:else if filteredJobs.length === 0}
        <tr><td colspan="4">No results found.</td></tr>
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
              <span style="display:flex;align-items:center;gap:6px;">
                {job.title}
                <button class="desc-icon-btn" type="button" title="Show description" on:click|preventDefault={() => openPopup(job)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { openPopup(job); e.preventDefault(); } }} tabindex="0" aria-label="Show job description">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="9" fill="#646cff" stroke="#222" stroke-width="1.5"/>
                    <text x="10" y="15" text-anchor="middle" font-size="12" font-family="Arial, Helvetica, sans-serif" fill="#fff">i</text>
                  </svg>
                </button>
              </span>
            </td>
            <td>
              {#if job.location && job.location.length > 24}
                <span title={job.location}>{job.location.slice(0, 24)}&hellip;</span>
              {:else}
                {job.location}
              {/if}
            </td>
            <td>{@html job.link}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>

  {#if showPopup && popupJob}
    <div
      class="popup-overlay"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      on:click={closePopup}
      on:keydown={(e) => { if (e.key === 'Escape') { closePopup(); } }}
    >
      <div
        class="popup-window"
        role="document"
        on:click|stopPropagation
        on:keydown={(e) => { if (e.key === 'Escape') { closePopup(); } }}
      >
        <button class="popup-close" on:click={closePopup}>&times;</button>
        <h2>{popupJob.title}</h2>
        {#if popupJob.link}
          <div class="popup-iframe-container">
            <iframe src={popupJob.link.replace(/<a [^>]*href=["']([^"']+)["'][^>]*>.*<\/a>/, '$1')} width="100%" height="400" style="border:1px solid #eee; border-radius:6px; margin-top:1.5rem;" title="Job Posting"></iframe>
          </div>
        {/if}
      </div>
    </div>
  {/if}
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
  .search-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  input {
    margin-bottom: 1rem;
    padding: 0.5rem;
    width: 100%;
    max-width: 300px;
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
  th.company-col {
    width: 20%;
  }
  th.title-col {
    width: 40%;
  }
  th.location-col {
    width: 20%;
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
  .crypto-banner-desc {
    font-size: 1.05rem;
    color: #333;
    opacity: 0.85;
  }
  .desc-icon-btn {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    position: relative;
  }
  .desc-icon-btn[title]:hover:after,
  .desc-icon-btn[title]:focus:after {
    content: attr(title);
    position: absolute;
    left: 50%;
    top: 120%;
    transform: translateX(-50%);
    background: #ffe066;
    color: #222;
    padding: 0.35em 0.8em;
    border-radius: 6px;
    font-size: 0.95em;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    z-index: 10;
    pointer-events: none;
  }
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .popup-window {
    background: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    width: 90%;
    position: relative;
  }
  .popup-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
  .popup-iframe-container {
    width: 100%;
    margin-top: 1.5rem;
  }
  .popup-iframe-container iframe {
    width: 100%;
    height: 400px;
    border: 1px solid #eee;
    border-radius: 6px;
    background: #fff;
  }
</style>
