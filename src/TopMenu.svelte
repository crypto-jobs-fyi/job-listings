<script>
  // simple top menu component shared across pages
  export let active = ''; // expected values: 'ai', 'crypto', 'favorites'
</script>

<!-- Reusable top menu: use this component at the top of pages -->
<div class="top-menu">
  <div class="top-menu-inner">
    <a href="/" class="logo">Job Finder</a>
    <div class="top-actions">
      <a href="/ai-jobs.html" class="new-jobs-btn" class:active={active === 'ai'}>AI Jobs</a>
    <a href="/ai-companies.html" class="new-jobs-btn" class:active={active === 'ai-companies'}>AI Companies</a>
    <a href="/crypto-companies.html" class="new-jobs-btn" class:active={active === 'crypto-companies'}>Crypto Companies</a>
    <a href="/crypto-jobs.html" class="new-jobs-btn" class:active={active === 'crypto'}>Crypto Jobs</a>
      <a href="/favorites.html" class="new-jobs-btn" class:active={active === 'favorites'}>Favorites</a>
    </div>
  </div>
</div>
