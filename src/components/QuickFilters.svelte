<script lang="ts">
  /**
   * QuickFilters Component - Quick filter buttons for common searches
   */
  export let onQAClick: () => void = () => {};
  export let onDevOpsClick: () => void = () => {};
  export let onClearClick: () => void = () => {};
</script>

<div class="quick-filters">
  <span class="filter-label">Quick Filters:</span>
  <button class="filter-btn" on:click={onQAClick}>QA</button>
  <button class="filter-btn" on:click={onDevOpsClick}>DevOps</button>
  <button class="filter-btn clear-btn" on:click={onClearClick}>Clear</button>
</div>

<style>
  .quick-filters {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .filter-label {
    font-weight: 500;
    color: var(--secondary-text);
    font-size: 0.9rem;
    margin-right: 0.5rem;
  }

  .filter-btn {
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 100px; /* Pill shape */
    background-color: transparent;
    color: var(--text-color);
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.1s ease;
  }

  .filter-btn:hover {
    background-color: var(--hover-bg);
    border-color: var(--text-color);
  }

  .clear-btn {
    color: var(--secondary-text);
    border-style: dashed;
  }

  .clear-btn:hover {
    color: #ef4444;
    border-color: #ef4444;
    background-color: rgba(239, 68, 68, 0.05);
  }

  .filter-btn:active {
    transform: scale(0.98);
  }
</style>
