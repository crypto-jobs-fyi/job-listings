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

<!-- Sticky header with theme toggle and login -->
<div class="page-header">
  <div class="header-container">
    {#if showHome}
      <button
        type="button"
        class="logo-mobile"
        on:click={() => (window.location.href = '/')}
        aria-label="Home">Home</button
      >
    {/if}

    <!-- hamburger for mobile - shown on same level as other controls -->
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

    <div class="header-actions">
      <button class="theme-toggle-header" on:click={theme.toggle} aria-label="Toggle theme">
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
      {#if $auth.isAuthenticated}
        <a href="/account.html" class="auth-btn">My Account</a>
      {:else}
        <a href="/login.html" class="auth-btn auth-btn-login">Log In</a>
      {/if}
    </div>
  </div>

  <!-- Mobile dropdown navigation -->
  <nav class:open class="top-actions" aria-label="Main menu">
    <div class="nav-row nav-row-jobs">
      <a href="/crypto-jobs.html" class="new-jobs-btn" class:active={active === 'crypto'}
        >Crypto Jobs</a
      >
      <a href="/ai-jobs.html" class="new-jobs-btn" class:active={active === 'ai'}>AI Jobs</a>
      <a href="/fin-jobs.html" class="new-jobs-btn" class:active={active === 'fin'}>FinTech Jobs</a>
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
      {#if $auth.isAuthenticated}
        <a href="/favorites.html" class="new-jobs-btn" class:active={active === 'favorites'}
          >Favorites</a
        >
        <a href="/account.html" class="new-jobs-btn btn-account">My Account</a>
      {/if}
    </div>
  </nav>
</div>

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

    <nav class="top-actions-desktop" aria-label="Main menu">
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
        {#if $auth.isAuthenticated}
          <a href="/favorites.html" class="new-jobs-btn" class:active={active === 'favorites'}
            >Favorites</a
          >
          <a href="/account.html" class="new-jobs-btn btn-account">My Account</a>
        {/if}
      </div>
    </nav>
  </div>
</div>

<style>
  .page-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 1rem;
    position: relative;
  }

  .header-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .logo-mobile {
    display: none;
  }

  .header-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
  }

  .theme-toggle-header {
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

  .theme-toggle-header:hover {
    background: var(--hover-bg);
  }

  .auth-btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    background: #6b7280;
    color: white;
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
    color: var(--text-color);
    text-decoration: none;
    font-size: 1.05rem;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  .top-actions-desktop {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
  .top-actions {
    display: none;
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
  .btn-account {
    background: #6b7280 !important;
    color: white !important;
  }
  .btn-account:hover {
    background: #4b5563 !important;
  }
  .top-actions .new-jobs-btn.active {
    background: var(--nav-link-active-bg);
  }
  .menu-toggle {
    display: none;
    background: transparent;
    border: 1px solid var(--border-color);
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-color);
  }
  .menu-toggle:hover {
    background: var(--hover-bg);
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .header-container {
      justify-content: space-between;
    }

    .logo-mobile {
      display: block;
      font-weight: 700;
      color: var(--text-color);
      text-decoration: none;
      font-size: 1.05rem;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
    }

    .menu-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .top-menu {
      display: none;
    }

    .top-actions {
      display: flex;
      position: absolute;
      top: 100%;
      right: 0;
      left: 0;
      flex-direction: column;
      gap: 0.5rem;
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
    .top-actions.open {
      opacity: 1;
      pointer-events: auto;
      max-height: 600px;
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
