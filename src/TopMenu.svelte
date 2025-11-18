<script>
  // simple top menu component shared across pages
  export let active = ''; // expected values: 'ai', 'crypto', 'favorites'
  let open = false;
  let showQR = false;

  function toggle() {
    open = !open;
  }

  function toggleQR() {
    showQR = !showQR;
  }

  function closeQR() {
    showQR = false;
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') closeQR();
  }
</script>

<!-- Reusable top menu: use this component at the top of pages -->
<div class="top-menu">
  <div class="top-menu-inner">
  <button type="button" class="logo new-jobs-btn" on:click={() => window.location.href = '/'} aria-label="Home">Home</button>

    <!-- hamburger for small screens -->
    <button class="menu-toggle" aria-expanded={open} aria-label="Toggle menu" on:click={toggle}>
      {#if open}
        <!-- close icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {:else}
        <!-- hamburger icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {/if}
    </button>

    <!-- QR code button -->
    <button class="qr-btn" aria-label="Share QR code" on:click={toggleQR} title="Show QR code">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="6" height="6" stroke="currentColor" stroke-width="2" />
        <rect x="4" y="4" width="2" height="2" fill="currentColor" />
        <rect x="16" y="2" width="6" height="6" stroke="currentColor" stroke-width="2" />
        <rect x="18" y="4" width="2" height="2" fill="currentColor" />
        <rect x="2" y="16" width="6" height="6" stroke="currentColor" stroke-width="2" />
        <rect x="4" y="18" width="2" height="2" fill="currentColor" />
        <rect x="10" y="3" width="1" height="1" fill="currentColor" />
        <rect x="10" y="5" width="1" height="1" fill="currentColor" />
        <rect x="12" y="3" width="1" height="1" fill="currentColor" />
        <rect x="14" y="3" width="1" height="1" fill="currentColor" />
        <rect x="10" y="10" width="1" height="1" fill="currentColor" />
        <rect x="14" y="10" width="1" height="1" fill="currentColor" />
        <rect x="16" y="12" width="1" height="1" fill="currentColor" />
        <rect x="18" y="12" width="1" height="1" fill="currentColor" />
        <rect x="20" y="12" width="1" height="1" fill="currentColor" />
        <rect x="16" y="14" width="1" height="1" fill="currentColor" />
        <rect x="18" y="14" width="1" height="1" fill="currentColor" />
        <rect x="20" y="14" width="1" height="1" fill="currentColor" />
      </svg>
    </button>


  <nav class:open={open} class="top-actions" aria-label="Main menu">
      <a href="/ai-jobs.html" class="new-jobs-btn" class:active={active === 'ai'}>AI Jobs</a>
      <a href="/ai-companies.html" class="new-jobs-btn" class:active={active === 'ai-companies'}>AI Companies</a>
      <a href="/crypto-companies.html" class="new-jobs-btn" class:active={active === 'crypto-companies'}>Crypto Companies</a>
      <a href="/crypto-jobs.html" class="new-jobs-btn" class:active={active === 'crypto'}>Crypto Jobs</a>
      <a href="/favorites.html" class="new-jobs-btn" class:active={active === 'favorites'}>Favorites</a>
    </nav>
  </div>
</div>

<!-- QR Code Modal -->
{#if showQR}
  <div class="qr-modal-overlay" on:click={closeQR} on:keydown={handleKeyDown} role="button" tabindex="0" aria-label="Close QR code modal">
    <div class="qr-modal" on:click|stopPropagation on:keydown={handleKeyDown} role="dialog" aria-modal="true" aria-label="QR code" tabindex="0">
      <button class="qr-close" on:click={closeQR} aria-label="Close QR code">✕</button>
      <div class="qr-content">
        <h2>Share Job Finder</h2>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.job-finder.org" alt="QR code for www.job-finder.org" class="qr-image" />
        <p class="qr-url">www.job-finder.org</p>
      </div>
    </div>
  </div>
{/if}

<style>
  .top-menu {
    width: 100%;
    background: transparent;
    border-bottom: 1px solid transparent;
  }
  .top-menu-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
  }
  .logo {
    font-weight: 700;
    color: #111827;
    text-decoration: none;
    font-size: 1.05rem;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  .top-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .top-actions .new-jobs-btn,
  .logo.new-jobs-btn {
    padding: 0.5rem 0.85rem;
    border-radius: 8px;
    text-decoration: none;
    color: #037dd6;
    font-weight: 600;
    background: transparent;
    transition: background 0.15s, transform 0.12s;
    border: none;
  }
  .top-actions .new-jobs-btn.active {
    background: rgba(3,125,214,0.12);
  }
  .menu-toggle {
    display: none;
    background: transparent;
    border: none;
    padding: 0.4rem;
    border-radius: 6px;
    cursor: pointer;
    color: #374151;
  }

  .qr-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0.4rem;
    border-radius: 6px;
    cursor: pointer;
    color: #374151;
    transition: background 0.15s;
  }

  .qr-btn:hover {
    background: rgba(3, 125, 214, 0.08);
  }

  .qr-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .qr-modal {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    position: relative;
    max-width: 320px;
    width: 90%;
  }

  .qr-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
  }

  .qr-close:hover {
    color: #111827;
  }

  .qr-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .qr-content h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    text-align: center;
    color: #111827;
  }

  .qr-image {
    width: 200px;
    height: 200px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
  }

  .qr-url {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
    text-align: center;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .menu-toggle { display: inline-flex; }
    .top-actions {
      position: absolute;
      top: 64px;
      right: 1rem;
      left: 1rem;
      flex-direction: column;
      gap: 0.5rem;
      background: white;
      border: 1px solid #e5e7eb;
      padding: 0.75rem;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      transform-origin: top right;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.98);
      transition: opacity 140ms ease, transform 140ms ease;
      z-index: 60;
    }
    .top-actions.open {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }
  .top-actions .new-jobs-btn {
      width: 100%;
      display: block;
      padding: 0.6rem 0.75rem;
      color: #111827;
      background: transparent;
      border-radius: 6px;
    }
  }
</style>
