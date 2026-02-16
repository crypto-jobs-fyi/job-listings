<script lang="ts">
  import { debounce, SEARCH_DEBOUNCE_MS, MIN_SEARCH_LENGTH } from '../utils/search';

  /**
   * SearchBar Component - Reusable search input component
   *
   * Debounces user input to avoid excessive re-renders.
   * Filtering only activates after MIN_SEARCH_LENGTH characters.
   */
  export let companySearch: string = '';
  export let locationSearch: string = '';
  export let titleSearch: string = '';
  export let showCompanySearch: boolean = true;
  export let showTitleSearch: boolean = true;
  export let showLocationSearch: boolean = true;
  export let onCompanySearchChange: (value: string) => void = () => {};
  export let onLocationSearchChange: (value: string) => void = () => {};
  export let onTitleSearchChange: (value: string) => void = () => {};

  // Debounced callbacks — fire only after user stops typing for SEARCH_DEBOUNCE_MS
  const debouncedCompany = debounce(
    (val: string) => onCompanySearchChange(val),
    SEARCH_DEBOUNCE_MS
  );
  const debouncedLocation = debounce(
    (val: string) => onLocationSearchChange(val),
    SEARCH_DEBOUNCE_MS
  );
  const debouncedTitle = debounce((val: string) => onTitleSearchChange(val), SEARCH_DEBOUNCE_MS);

  const minLengthHint = `Type at least ${MIN_SEARCH_LENGTH} characters`;
</script>

<div class="search-bar">
  {#if showCompanySearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search company(s)"
      title={minLengthHint}
      value={companySearch}
      on:input={(e) => {
        companySearch = e.currentTarget.value;
        debouncedCompany(companySearch);
      }}
    />
  {/if}
  {#if showTitleSearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search title(s)"
      title={minLengthHint}
      value={titleSearch}
      on:input={(e) => {
        titleSearch = e.currentTarget.value;
        debouncedTitle(titleSearch);
      }}
    />
  {/if}
  {#if showLocationSearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search location(s)"
      title={minLengthHint}
      value={locationSearch}
      on:input={(e) => {
        locationSearch = e.currentTarget.value;
        debouncedLocation(locationSearch);
      }}
    />
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
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

  @media (max-width: 768px) {
    .search-input {
      max-width: 100%;
    }
  }
</style>
