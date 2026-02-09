<script>
  import { theme } from '../stores/theme';
  import { auth } from '../stores/auth';

  // simple top menu component shared across pages
  export let active = ''; // expected values: 'ai', 'crypto', 'favorites'
  export let showHome = true;
  let open = false;

  function toggle() {
    open = !open;
  }
</script>

<!-- Unified sticky header -->
<div class="page-header">
  <div class="header-container">
    <!-- Home button / Logo -->
    {#if showHome}
      <button
        type="button"
        class="logo"
        on:click={() => (window.location.href = '/')}
        aria-label="Home">Home</button
      >
    {/if}

    <!-- Desktop navigation - horizontal links -->
    <nav class="desktop-nav" aria-label="Main menu">
      <a href="/crypto-jobs.html" class="nav-link" class:active={active === 'crypto'}>Crypto Jobs</a
      >
      <a href="/ai-jobs.html" class="nav-link" class:active={active === 'ai'}>AI Jobs</a>
      <a href="/fin-jobs.html" class="nav-link" class:active={active === 'fin'}>FinTech Jobs</a>
      <span class="nav-separator">|</span>
      <a href="/crypto-companies.html" class="nav-link" class:active={active === 'crypto-companies'}
        >Crypto Companies</a
      >
      <a href="/ai-companies.html" class="nav-link" class:active={active === 'ai-companies'}
        >AI Companies</a
      >
      <a href="/fin-companies.html" class="nav-link" class:active={active === 'fin-companies'}
        >FinTech Companies</a
      >
      {#if $auth.isAuthenticated}
        <span class="nav-separator">|</span>
        <a href="/favorites.html" class="nav-link" class:active={active === 'favorites'}
          >Favorites</a
        >
      {/if}
    </nav>

    <!-- Right side controls -->
    <div class="header-actions">
      <!-- Mobile hamburger menu -->
      <button class="menu-toggle" aria-expanded={open} aria-label="Toggle menu" on:click={toggle}>
        {#if open}
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

      <!-- Theme toggle -->
      <button class="theme-toggle" on:click={theme.toggle} aria-label="Toggle theme">
        {#if $theme === 'light'}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        {:else}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
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

      <!-- Auth button -->
      {#if $auth.isAuthenticated}
        <a href="/account.html" class="auth-btn">My Account</a>
      {:else}
        <a href="/login.html" class="auth-btn auth-btn-login">Log In</a>
      {/if}
    </div>
  </div>

  <!-- Mobile dropdown navigation -->
  <nav class:open class="mobile-nav" aria-label="Main menu">
    <a href="/crypto-jobs.html" class="mobile-nav-link" class:active={active === 'crypto'}
      >Crypto Jobs</a
    >
    <a href="/ai-jobs.html" class="mobile-nav-link" class:active={active === 'ai'}>AI Jobs</a>
    <a href="/fin-jobs.html" class="mobile-nav-link" class:active={active === 'fin'}>FinTech Jobs</a
    >
    <div class="mobile-nav-divider"></div>
    <a
      href="/crypto-companies.html"
      class="mobile-nav-link"
      class:active={active === 'crypto-companies'}>Crypto Companies</a
    >
    <a href="/ai-companies.html" class="mobile-nav-link" class:active={active === 'ai-companies'}
      >AI Companies</a
    >
    <a href="/fin-companies.html" class="mobile-nav-link" class:active={active === 'fin-companies'}
      >FinTech Companies</a
    >
    {#if $auth.isAuthenticated}
      <div class="mobile-nav-divider"></div>
      <a href="/favorites.html" class="mobile-nav-link" class:active={active === 'favorites'}
        >Favorites</a
      >
      <a href="/account.html" class="mobile-nav-link btn-account">My Account</a>
    {/if}
  </nav>
</div>

<style>
  /* Unified sticky header */
  .page-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 1rem;
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  /* Logo / Home button */
  .logo {
    font-weight: 700;
    color: var(--text-color);
    font-size: 1.05rem;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .logo:hover {
    opacity: 0.8;
  }

  /* Desktop horizontal navigation */
  .desktop-nav {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex: 1;
  }

  .nav-link {
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    white-space: nowrap;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .nav-link:hover {
    background: var(--hover-bg);
  }

  .nav-link.active {
    background: var(--nav-link-active-bg);
    font-weight: 600;
  }

  .nav-separator {
    color: var(--border-color);
    font-weight: 300;
  }

  /* Right side controls */
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  /* Mobile menu toggle */
  .menu-toggle {
    display: none;
    background: transparent;
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-color);
    align-items: center;
    justify-content: center;
  }

  .menu-toggle:hover {
    background: var(--hover-bg);
  }

  /* Theme toggle */
  .theme-toggle {
    background: transparent;
    border: none;
    padding: 0.5rem;
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

  /* Auth buttons */
  .auth-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.2s;
    background: #6b7280;
    color: white;
    white-space: nowrap;
  }

  .auth-btn:hover {
    background: #4b5563;
  }

  .auth-btn-login {
    background: #f59e0b;
  }

  .auth-btn-login:hover {
    background: #d97706;
  }

  /* Mobile dropdown navigation */
  .mobile-nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    opacity: 0;
    pointer-events: none;
    max-height: 0;
    overflow: hidden;
    transition:
      opacity 200ms ease,
      max-height 200ms ease;
    z-index: 99;
  }

  .mobile-nav.open {
    opacity: 1;
    pointer-events: auto;
    max-height: 600px;
  }

  .mobile-nav-link {
    display: block;
    padding: 0.75rem 1rem;
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .mobile-nav-link:hover {
    background: var(--hover-bg);
  }

  .mobile-nav-link.active {
    background: var(--nav-link-active-bg);
    font-weight: 600;
  }

  .mobile-nav-link.btn-account {
    background: #6b7280;
    color: white;
  }

  .mobile-nav-link.btn-account:hover {
    background: #4b5563;
  }

  .mobile-nav-divider {
    height: 1px;
    background: var(--border-color);
    margin: 0.5rem 0;
  }

  /* Mobile responsive styles */
  @media (max-width: 1024px) {
    .desktop-nav {
      gap: 0.75rem;
    }

    .nav-link {
      font-size: 0.85rem;
      padding: 0.3rem 0.4rem;
    }
  }

  @media (max-width: 768px) {
    .header-container {
      gap: 0.75rem;
    }

    /* Hide desktop navigation on mobile */
    .desktop-nav {
      display: none;
    }

    /* Show mobile menu toggle */
    .menu-toggle {
      display: inline-flex;
    }

    /* Show mobile dropdown */
    .mobile-nav {
      display: flex;
    }
  }
</style>
