<script>
  import { theme } from '../stores/theme';
  // simple top menu component shared across pages
  export let active = ''; // expected values: 'ai', 'crypto', 'favorites'
  export let showHome = true;
  let open = false;

  function toggle() {
    open = !open;
  }
</script>

<!-- Reusable top menu: use this component at the top of pages -->
<div class="top-menu">
  <div class="top-menu-inner">
    {#if showHome}
      <button
        type="button"
        class="logo new-jobs-btn"
        on:click={() => (window.location.href = '/')}
        aria-label="Home">Home</button
      >
    {/if}

    <div class="top-menu-right">
      <button class="theme-toggle" on:click={theme.toggle} aria-label="Toggle theme">
        {#if $theme === 'light'}
          <!-- moon icon -->
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        {:else}
          <!-- sun icon -->
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        {/if}
      </button>

      <!-- hamburger for small screens -->
      <button class="menu-toggle" aria-expanded={open} aria-label="Toggle menu" on:click={toggle}>
        {#if open}
          <!-- close icon -->
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {:else}
          <!-- hamburger icon -->
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6h18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 12h18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 18h18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        {/if}
      </button>
    </div>

    <nav class:open class="top-actions" aria-label="Main menu">
      <div class="nav-row nav-row-jobs">
        <a href="/crypto-jobs.html" class="new-jobs-btn" class:active={active === 'crypto'}
          >Crypto Jobs</a
        >
        <a href="/ai-jobs.html" class="new-jobs-btn" class:active={active === 'ai'}>AI Jobs</a>
        <a href="/fin-jobs.html" class="new-jobs-btn" class:active={active === 'fin'}
          >FinTech Jobs</a
        >
      </div>
      <div class="nav-row nav-row-companies">
        <a
          href="/crypto-companies.html"
          class="new-jobs-btn"
          class:active={active === 'crypto-companies'}>Crypto Companies</a
        >
        <a href="/ai-companies.html" class="new-jobs-btn" class:active={active === 'ai-companies'}
          >AI Companies</a
        >
        <a href="/fin-companies.html" class="new-jobs-btn" class:active={active === 'fin-companies'}
          >FinTech Companies</a
        >
      </div>
      <div class="nav-row nav-row-extras">
        <a href="/favorites.html" class="new-jobs-btn" class:active={active === 'favorites'}
          >Favorites</a
        >
      </div>
    </nav>
  </div>
</div>

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
  .top-menu-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .theme-toggle {
    background: transparent;
    border: none;
    padding: 0.4rem;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .theme-toggle:hover {
    background: var(--hover-bg);
  }
  .logo {
    font-weight: 700;
    color: var(--text-color);
    text-decoration: none;
    font-size: 1.05rem;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  .top-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
  .nav-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    max-width: 600px;
  }
  .nav-row-extras {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 0.25rem;
  }
  .top-actions .new-jobs-btn,
  .logo.new-jobs-btn {
    padding: 0.5rem 0.85rem;
    border-radius: 8px;
    text-decoration: none;
    color: var(--nav-link-color);
    font-weight: 600;
    background: transparent;
    transition:
      background 0.15s,
      transform 0.12s;
    border: none;
    text-align: center;
    white-space: nowrap;
  }
  .top-actions .new-jobs-btn.active {
    background: var(--nav-link-active-bg);
  }
  .menu-toggle {
    display: none;
    background: transparent;
    border: none;
    padding: 0.4rem;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-color);
  }
  .menu-toggle:hover {
    background: var(--hover-bg);
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .menu-toggle {
      display: inline-flex;
    }
    .top-actions {
      position: absolute;
      top: 64px;
      right: 1rem;
      left: 1rem;
      flex-direction: column;
      gap: 0.5rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transform-origin: top right;
      opacity: 0;
      pointer-events: none;
      transform: scale(0.98);
      transition:
        opacity 140ms ease,
        transform 140ms ease;
      z-index: 60;
    }
    .top-actions.open {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }
    .nav-row {
      grid-template-columns: 1fr;
      width: 100%;
      max-width: 100%;
    }
    .nav-row-extras {
      flex-direction: column;
      width: 100%;
    }
    .top-actions .new-jobs-btn {
      width: 100%;
      display: block;
      padding: 0.6rem 0.75rem;
      color: var(--text-color);
      background: transparent;
      border-radius: 6px;
    }
  }
</style>
