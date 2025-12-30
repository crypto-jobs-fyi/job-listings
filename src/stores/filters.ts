import { writable } from 'svelte/store';

export interface FilterState {
  companySearch: string;
  locationSearch: string;
  titleSearch: string;
  categoryFilter: 'all' | 'ai' | 'crypto';
}

const defaultFilters: FilterState = {
  companySearch: '',
  locationSearch: '',
  titleSearch: '',
  categoryFilter: 'all',
};

/**
 * Filters store - manages search and filter state
 */
function createFiltersStore() {
  const { subscribe, set, update } = writable<FilterState>(defaultFilters);

  return {
    subscribe,
    setCompanySearch: (search: string) => {
      update((state) => ({ ...state, companySearch: search }));
    },
    setLocationSearch: (search: string) => {
      update((state) => ({ ...state, locationSearch: search }));
    },
    setTitleSearch: (search: string) => {
      update((state) => ({ ...state, titleSearch: search }));
    },
    setCategoryFilter: (category: 'all' | 'ai' | 'crypto') => {
      update((state) => ({ ...state, categoryFilter: category }));
    },
    setAll: (filters: Partial<FilterState>) => {
      update((state) => ({ ...state, ...filters }));
    },
    reset: () => {
      set(defaultFilters);
    },
  };
}

export const filters = createFiltersStore();
