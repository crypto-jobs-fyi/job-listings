<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '../stores/auth';

  interface RedisDataItem {
    key: string;
    value: unknown;
    ttl: number;
  }

  let loading = true;
  let error = '';
  let redisData: RedisDataItem[] = [];
  let isAuthorized = false;

  const ADMIN_EMAIL = 'yury.dubinin@gmail.com';

  onMount(async () => {
    // Check authentication
    auth.checkAuth();
    const authState = $auth;

    if (!authState.isAuthenticated) {
      window.location.href = '/login.html?return=/admin.html';
      return;
    }

    if (authState.user?.email !== ADMIN_EMAIL) {
      error = 'Access denied. Admin only.';
      loading = false;
      return;
    }

    isAuthorized = true;
    await loadRedisData();
  });

  async function loadRedisData() {
    loading = true;
    error = '';
    try {
      // Generate admin token from email (admin users have a special token)
      const adminToken = process.env.PUBLIC_ADMIN_TOKEN || btoa('admin-access');

      const response = await fetch('/api/admin/redis-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          error = 'Admin access denied';
        } else {
          throw new Error('Failed to fetch Redis data');
        }
        return;
      }

      const data = await response.json();
      redisData = data.keys || [];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }

  function formatValue(value: unknown): string {
    // Try to parse and format if it's a JSON string
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // If it parsed successfully and is an object, format it nicely
        if (typeof parsed === 'object' && parsed !== null) {
          return JSON.stringify(parsed, null, 2);
        }
      } catch {
        // Not JSON, return as-is
        return value;
      }
    }

    // If it's already an object, format it
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }

    // Return as string for other types
    return String(value);
  }

  function getKeyType(key: string): string {
    if (key.startsWith('code:')) return 'verification-code';
    if (key.startsWith('ratelimit:')) return 'rate-limit';
    if (key.startsWith('favorites:')) return 'favorites';
    return 'unknown';
  }

  function getKeyTypeIcon(key: string): string {
    const type = getKeyType(key);
    if (type === 'verification-code') return '🔑';
    if (type === 'rate-limit') return '🚦';
    if (type === 'favorites') return '📋';
    return '📦';
  }

  function getKeyTypeLabel(key: string): string {
    const type = getKeyType(key);
    if (type === 'verification-code') return 'Verification Code';
    if (type === 'rate-limit') return 'Rate Limit';
    if (type === 'favorites') return 'User Favorites';
    return 'Unknown';
  }

  function formatFavoritesValue(value: unknown): string {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (typeof parsed === 'object' && parsed !== null) {
        const count = Object.keys(parsed).length;
        const jobs = Object.values(parsed).map((job: unknown) => {
          const jobObj = job as { title?: string; company?: string; location?: string };
          return {
            title: jobObj.title || 'Unknown',
            company: jobObj.company || 'Unknown',
            location: jobObj.location || 'Unknown',
          };
        });
        return JSON.stringify({ count, jobs }, null, 2);
      }
    } catch {
      // Fall through to default formatting
    }
    return formatValue(value);
  }

  function shouldFormatAsFavorites(key: string): boolean {
    return key.startsWith('favorites:');
  }

  function formatTTL(ttl: number): string {
    if (ttl === -1) return 'No expiration';
    if (ttl === -2) return 'Key does not exist';

    const minutes = Math.floor(ttl / 60);
    const seconds = ttl % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
</script>

<main class="admin-page">
  <div class="admin-header">
    <h1>Redis Admin Dashboard</h1>
    <div class="admin-actions">
      <button class="btn-refresh" on:click={loadRedisData} disabled={loading}> 🔄 Refresh </button>
      <a href="/account.html" class="btn-back">← Back to Account</a>
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading Redis data...</p>
    </div>
  {:else if error}
    <div class="error-message">
      <p>❌ {error}</p>
      {#if !isAuthorized}
        <a href="/" class="btn-home">Go Home</a>
      {/if}
    </div>
  {:else if redisData.length === 0}
    <div class="empty-state">
      <h3>✅ No data in Redis</h3>
      <p class="info">Redis stores authentication and user data:</p>
      <ul class="info-list">
        <li><strong>Verification codes</strong> - Active for 10 minutes, deleted after use</li>
        <li><strong>Rate limit counters</strong> - Reset after 10 minutes or successful login</li>
        <li><strong>User favorites</strong> - Persisted for logged-in users (no expiration)</li>
      </ul>
      <p class="note">💡 Session data is stored in browser localStorage, not Redis.</p>
      <p class="note">Data will appear here when users login or save favorites.</p>
    </div>
  {:else}
    <div class="redis-data">
      <div class="data-summary">
        <p><strong>Total Keys:</strong> {redisData.length}</p>
        <div class="data-types">
          {#each redisData as item (item.key)}
            <span class="type-badge {getKeyType(item.key)}">
              {getKeyTypeIcon(item.key)}
              {getKeyTypeLabel(item.key)}
            </span>
          {/each}
        </div>
      </div>

      <div class="data-table">
        {#each redisData as item (item.key)}
          <div class="data-row">
            <div class="data-header">
              <div class="data-key">
                <span class="key-icon">{getKeyTypeIcon(item.key)}</span>
                <code>{item.key}</code>
                <span class="key-type-label">{getKeyTypeLabel(item.key)}</span>
              </div>
              <div class="data-meta">
                <span class="ttl">⏱️ {formatTTL(item.ttl)}</span>
              </div>
            </div>
            <div class="data-value">
              <pre>{shouldFormatAsFavorites(item.key)
                  ? formatFavoritesValue(item.value)
                  : formatValue(item.value)}</pre>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</main>

<style>
  .admin-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .admin-header h1 {
    margin: 0;
    color: var(--text-color);
  }

  .admin-actions {
    display: flex;
    gap: 1rem;
  }

  .btn-refresh,
  .btn-back,
  .btn-home {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .btn-refresh {
    background: #3b82f6;
    color: white;
  }

  .btn-refresh:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-refresh:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-back {
    background: #6b7280;
    color: white;
    display: inline-block;
  }

  .btn-back:hover {
    background: #4b5563;
  }

  .btn-home {
    background: #f59e0b;
    color: white;
    display: inline-block;
  }

  .btn-home:hover {
    background: #d97706;
  }

  .loading,
  .error-message,
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-message {
    color: #dc2626;
  }

  .empty-state h3 {
    margin: 0 0 1rem 0;
    color: var(--text-color);
  }

  .empty-state .info {
    color: var(--text-color);
    margin-bottom: 1rem;
  }

  .empty-state .info-list {
    text-align: left;
    max-width: 500px;
    margin: 1rem auto;
    padding-left: 1.5rem;
    color: var(--text-color);
  }

  .empty-state .info-list li {
    margin: 0.5rem 0;
  }

  .empty-state .note {
    color: var(--secondary-text);
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }

  .data-summary {
    background: var(--card-bg);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 1px solid var(--border-color);
  }

  .data-summary p {
    margin: 0 0 0.5rem 0;
  }

  .data-types {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .type-badge.verification-code {
    background: #dbeafe;
    color: #1e40af;
  }

  .type-badge.rate-limit {
    background: #fef3c7;
    color: #92400e;
  }

  .type-badge.favorites {
    background: #fce7f3;
    color: #9f1239;
  }

  .type-badge.unknown {
    background: #f3f4f6;
    color: #374151;
  }

  :global([data-theme='dark']) .type-badge.verification-code {
    background: #1e3a8a;
    color: #bfdbfe;
  }

  :global([data-theme='dark']) .type-badge.rate-limit {
    background: #78350f;
    color: #fef3c7;
  }

  :global([data-theme='dark']) .type-badge.favorites {
    background: #831843;
    color: #fce7f3;
  }

  :global([data-theme='dark']) .type-badge.unknown {
    background: #374151;
    color: #f3f4f6;
  }

  .data-table {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .data-row {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
  }

  .data-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
    gap: 1rem;
  }

  .data-key {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
  }

  .key-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .data-key code {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #3b82f6;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .key-type-label {
    background: #e5e7eb;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    flex-shrink: 0;
  }

  :global([data-theme='dark']) .data-key code {
    background: #374151;
  }

  :global([data-theme='dark']) .key-type-label {
    background: #4b5563;
    color: #e5e7eb;
  }

  .data-meta {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .ttl {
    font-size: 0.85rem;
    color: var(--secondary-text);
  }

  .data-value {
    background: #f9fafb;
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
    border: 1px solid #e5e7eb;
  }

  :global([data-theme='dark']) .data-value {
    background: #1f2937;
    border-color: #4b5563;
  }

  .data-value pre {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--text-color);
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace;
  }

  @media (max-width: 768px) {
    .admin-page {
      padding: 1rem;
    }

    .admin-header {
      flex-direction: column;
      align-items: stretch;
    }

    .admin-actions {
      flex-direction: column;
    }

    .data-meta {
      justify-content: flex-start;
    }
  }
</style>
