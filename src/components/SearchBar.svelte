<script lang="ts">
  import { MIN_SEARCH_LENGTH } from '../utils/search';

  /**
   * SearchBar Component - Reusable search input component
   *
   * Users type into the inputs and click "Search" (or press Enter) to apply filters.
   */
  export let companySearch: string = '';
  export let locationSearch: string = '';
  export let titleSearch: string = '';
  export let showCompanySearch: boolean = true;
  export let showTitleSearch: boolean = true;
  export let showLocationSearch: boolean = true;
  export let onSearch: () => void = () => {};

  const minLengthHint = `Type at least ${MIN_SEARCH_LENGTH} characters`;

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      onSearch();
    }
  }
</script>

<div class="search-bar">
  {#if showCompanySearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search company(s)"
      title={minLengthHint}
      bind:value={companySearch}
      on:keydown={handleKeydown}
    />
  {/if}
  {#if showTitleSearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search title(s)"
      title={minLengthHint}
      bind:value={titleSearch}
      on:keydown={handleKeydown}
    />
  {/if}
  {#if showLocationSearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search location(s)"
      title={minLengthHint}
      bind:value={locationSearch}
      on:keydown={handleKeydown}
    />
  {/if}
  <button class="search-btn" on:click={onSearch}>Search</button>
</div>

<style>
  .search-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .search-input {
    padding: 0.5rem 0.75rem;
    width: 100%;
    max-width: 220px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 0.9rem;
    background-color: transparent;
    color: var(--text-color);
    transition: all 0.1s ease;
    font-family: inherit;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--text-color);
    background-color: var(--card-bg);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  }

  .search-input::placeholder {
    color: var(--secondary-text);
  }

  .search-btn {
    padding: 0.5rem 1.25rem;
    border: 1px solid var(--text-color);
    border-radius: 4px;
    background-color: var(--text-color);
    color: var(--bg-color);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.1s ease;
    font-family: inherit;
    white-space: nowrap;
  }

  .search-btn:hover {
    opacity: 0.85;
  }

  .search-btn:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    .search-input {
      max-width: 100%;
    }

    .search-btn {
      width: 100%;
    }
  }
</style>
