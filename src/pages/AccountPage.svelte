<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '../stores/auth';
  import { favorites } from '../stores/favorites';

  const ADMIN_EMAIL = 'yury.dubinin@gmail.com';

  let favoritesCount = 0;
  let sessionExpiration: Date | null = null;
  let isAdmin = false;

  onMount(() => {
    // Check if user is authenticated
    if (!$auth.isAuthenticated) {
      window.location.href = '/login.html?return=/account.html';
      return;
    }

    // Check if user is admin
    isAdmin = $auth.user?.email === ADMIN_EMAIL;

    // Load favorites from backend
    favorites.loadFromBackend();

    // Get session expiration
    sessionExpiration = auth.getSessionExpiration();

    // Subscribe to favorites to get count
    const unsubscribe = favorites.subscribe((favs) => {
      favoritesCount = favs.size;
    });

    return unsubscribe;
  });

  function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
      auth.logout();
      window.location.href = '/';
    }
  }

  function formatDate(date: Date | null): string {
    if (!date) return 'Unknown';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatLoginTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
</script>

<main>
  <div class="account-card">
    <h1>My Account</h1>

    {#if $auth.user}
      <div class="info-section">
        <div class="info-item">
          <span class="info-label">Email</span>
          <span class="info-value">{$auth.user.email}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Logged in since</span>
          <span class="info-value">{formatLoginTime($auth.user.loginTime)}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Session expires</span>
          <span class="info-value">{formatDate(sessionExpiration)}</span>
        </div>

        <div class="info-item">
          <span class="info-label">Session type</span>
          <span class="info-value">
            {$auth.user.rememberMe ? '30 days (Remember me)' : '7 days (Standard)'}
          </span>
        </div>

        <div class="info-item">
          <span class="info-label">Saved jobs</span>
          <span class="info-value">
            {favoritesCount}
            {favoritesCount === 1 ? 'job' : 'jobs'}
          </span>
        </div>
      </div>

      <div class="actions">
        <a href="/favorites.html" class="btn btn-secondary"> View Favorites </a>

        {#if isAdmin}
          <a href="/admin.html" class="btn btn-admin"> Dashboard </a>
        {/if}

        <button class="btn btn-logout" on:click={handleLogout}> Log Out </button>
      </div>
    {:else}
      <p class="loading">Loading account information...</p>
    {/if}
  </div>
</main>

<style>
  main {
    max-width: 600px;
    margin: 4rem auto;
    padding: 2rem;
  }

  .account-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 2.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0 0 2rem 0;
    font-size: 2rem;
    color: var(--text-color);
    text-align: center;
  }

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
  }

  .info-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .info-label {
    font-size: 0.85rem;
    color: var(--secondary-text);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    font-size: 1.1rem;
    color: var(--text-color);
    font-weight: 500;
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn {
    flex: 1;
    padding: 0.85rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    text-align: center;
    display: block;
    box-sizing: border-box;
  }

  .btn-secondary {
    background: #059669;
    color: white;
  }

  .btn-secondary:hover {
    background: #047857;
    transform: translateY(-1px);
  }

  .btn-admin {
    background: #8b5cf6;
    color: white;
  }

  .btn-admin:hover {
    background: #7c3aed;
    transform: translateY(-1px);
  }

  .btn-logout {
    background: #6b7280;
    color: white;
  }

  .btn-logout:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }

  .loading {
    text-align: center;
    color: var(--secondary-text);
    padding: 2rem;
  }

  @media (max-width: 768px) {
    main {
      margin: 2rem auto;
      padding: 1rem;
    }

    .account-card {
      padding: 2rem 1.5rem;
    }

    h1 {
      font-size: 1.75rem;
    }

    .actions {
      flex-direction: column;
    }

    .btn {
      width: 100%;
      flex: none;
    }
  }
</style>
