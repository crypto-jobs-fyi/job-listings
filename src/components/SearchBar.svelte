<script lang="ts">
  /**
   * SearchBar Component - Reusable search input component
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
</script>

<div class="search-bar">
  {#if showCompanySearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search company(s)"
      value={companySearch}
      on:input={(e) => {
        companySearch = e.currentTarget.value;
        onCompanySearchChange(companySearch);
      }}
    />
  {/if}
  {#if showTitleSearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search title(s)"
      value={titleSearch}
      on:input={(e) => {
        titleSearch = e.currentTarget.value;
        onTitleSearchChange(titleSearch);
      }}
    />
  {/if}
  {#if showLocationSearch}
    <input
      type="text"
      class="search-input"
      placeholder="Search location(s)"
      value={locationSearch}
      on:input={(e) => {
        locationSearch = e.currentTarget.value;
        onLocationSearchChange(locationSearch);
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
