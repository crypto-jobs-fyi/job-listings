import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

/**
 * Theme store - manages light/dark mode with persistence to localStorage
 */
function createThemeStore() {
  // Load from localStorage on initialization
  const loadFromLocalStorage = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem('theme') as Theme;
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
      // Fallback to system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error('Error loading theme from localStorage:', e);
    }
    return 'light';
  };

  const initial = loadFromLocalStorage();
  const { subscribe, set, update } = writable<Theme>(initial);

  return {
    subscribe,
    /**
     * Toggle between light and dark mode
     */
    toggle: () => {
      update((current) => {
        const next = current === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', next);
        return next;
      });
    },
    /**
     * Set a specific theme
     */
    setTheme: (newTheme: Theme) => {
      localStorage.setItem('theme', newTheme);
      set(newTheme);
    },
  };
}

export const theme = createThemeStore();
