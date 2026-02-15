<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '../stores/auth';
  import { favorites } from '../stores/favorites';
  import { preferences } from '../stores/preferences';

  const ADMIN_EMAIL = 'yury.dubinin@gmail.com';

  let favoritesCount = 0;
  let sessionExpiration: Date | null = null;
  let isAdmin = false;

  // Preferences state
  let prefLocations: string[] = [];
  let prefTitles: string[] = [];
  let newLocation = '';
  let newTitle = '';
  let prefSaved = false;

  onMount(() => {
    // Check if user is authenticated (validates current session state from storage)
    auth.checkAuth();

    if (!$auth.isAuthenticated) {
      window.location.href = '/login.html?return=/account.html';
      return;
    }

    // Check if user is admin
    isAdmin = $auth.user?.email === ADMIN_EMAIL;

    // Load favorites from backend
    favorites.loadFromBackend();

    // Load preferences from backend
    preferences.loadFromBackend();

    // Get session expiration
    sessionExpiration = auth.getSessionExpiration();

    // Subscribe to favorites to get count
    const unsubFavorites = favorites.subscribe((favs) => {
      favoritesCount = favs.size;
    });

    // Subscribe to preferences
    const unsubPreferences = preferences.subscribe((prefs) => {
      prefLocations = [...prefs.locations];
      prefTitles = [...prefs.titles];
    });

    return () => {
      unsubFavorites();
      unsubPreferences();
    };
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

  function addLocation() {
    const trimmed = newLocation.trim();
    if (trimmed && !prefLocations.includes(trimmed)) {
      prefLocations = [...prefLocations, trimmed];
    }
    newLocation = '';
  }

  function removeLocation(loc: string) {
    prefLocations = prefLocations.filter((l) => l !== loc);
  }

  function addTitle() {
    const trimmed = newTitle.trim();
    if (trimmed && !prefTitles.includes(trimmed)) {
      prefTitles = [...prefTitles, trimmed];
    }
    newTitle = '';
  }

  function removeTitle(t: string) {
    prefTitles = prefTitles.filter((title) => title !== t);
  }

  function savePreferences() {
    preferences.setAll(prefLocations, prefTitles);
    prefSaved = true;
    setTimeout(() => (prefSaved = false), 2000);
  }

  function handleLocationKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLocation();
    }
  }

  function handleTitleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTitle();
    }
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

      <!-- Search Preferences Section -->
      <div class="preferences-section">
        <h2>Search Preferences</h2>
        <p class="pref-description">
          Save preferred locations and titles. Use the <strong>My Filters</strong> button on any jobs
          page to quickly apply them.
        </p>

        <div class="pref-field">
          <label class="pref-label" for="pref-location">Preferred Locations</label>
          <div class="pref-input-row">
            <input
              id="pref-location"
              type="text"
              class="pref-input"
              placeholder="e.g. Remote, New York"
              bind:value={newLocation}
              on:keydown={handleLocationKeydown}
            />
            <button class="pref-add-btn" on:click={addLocation}>Add</button>
          </div>
          {#if prefLocations.length > 0}
            <div class="pref-tags">
              {#each prefLocations as loc (loc)}
                <span class="pref-tag">
                  {loc}
                  <button
                    class="pref-tag-remove"
                    on:click={() => removeLocation(loc)}
                    aria-label="Remove {loc}">&times;</button
                  >
                </span>
              {/each}
            </div>
          {/if}
        </div>

        <div class="pref-field">
          <label class="pref-label" for="pref-title">Preferred Titles</label>
          <div class="pref-input-row">
            <input
              id="pref-title"
              type="text"
              class="pref-input"
              placeholder="e.g. Engineer, Product Manager"
              bind:value={newTitle}
              on:keydown={handleTitleKeydown}
            />
            <button class="pref-add-btn" on:click={addTitle}>Add</button>
          </div>
          {#if prefTitles.length > 0}
            <div class="pref-tags">
              {#each prefTitles as t (t)}
                <span class="pref-tag">
                  {t}
                  <button
                    class="pref-tag-remove"
                    on:click={() => removeTitle(t)}
                    aria-label="Remove {t}">&times;</button
                  >
                </span>
              {/each}
            </div>
          {/if}
        </div>

        <button class="btn btn-save" on:click={savePreferences}>
          {prefSaved ? 'Saved!' : 'Save Preferences'}
        </button>
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

  .btn-save {
    background: #f59e0b;
    color: white;
    width: 100%;
    margin-top: 0.5rem;
  }

  .btn-save:hover {
    background: #d97706;
    transform: translateY(-1px);
  }

  /* Preferences section */
  .preferences-section {
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
  }

  .preferences-section h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
    color: var(--text-color);
  }

  .pref-description {
    color: var(--secondary-text);
    font-size: 0.9rem;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .pref-field {
    margin-bottom: 1.25rem;
  }

  .pref-label {
    display: block;
    font-size: 0.85rem;
    color: var(--secondary-text);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
  }

  .pref-input-row {
    display: flex;
    gap: 0.5rem;
  }

  .pref-input {
    flex: 1;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--card-bg);
    color: var(--text-color);
    font-size: 0.95rem;
  }

  .pref-input:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
  }

  .pref-add-btn {
    padding: 0.6rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: transparent;
    color: var(--text-color);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .pref-add-btn:hover {
    background: var(--hover-bg);
    border-color: var(--text-color);
  }

  .pref-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .pref-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 100px;
    font-size: 0.85rem;
    color: var(--text-color);
  }

  .pref-tag-remove {
    background: none;
    border: none;
    color: var(--secondary-text);
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    padding: 0 0.15rem;
    border-radius: 50%;
    transition: all 0.15s;
  }

  .pref-tag-remove:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
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
