import { writable, get } from 'svelte/store';
import type { UserPreferences } from '../types/preferences';
import { auth } from './auth';
import { STORAGE_KEYS } from '../utils/constants';

const defaultPreferences: UserPreferences = {
  locations: [],
  titles: [],
  updatedAt: 0,
};

/**
 * Preferences store - manages user search preferences with persistence
 * Follows the same pattern as favorites: localStorage + Redis backend sync
 */
function createPreferencesStore() {
  const loadFromLocalStorage = (): UserPreferences => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (stored) {
        return JSON.parse(stored) as UserPreferences;
      }
    } catch (e) {
      console.error('Error loading preferences from localStorage:', e);
    }
    return { ...defaultPreferences };
  };

  const saveToLocalStorage = (prefs: UserPreferences) => {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  };

  const initial = loadFromLocalStorage();
  const { subscribe, set, update } = writable<UserPreferences>(initial);

  const store = {
    subscribe,

    /**
     * Set preferred locations
     */
    setLocations: (locations: string[]) => {
      update((prefs) => {
        const next = { ...prefs, locations, updatedAt: Date.now() };
        saveToLocalStorage(next);
        return next;
      });
      store.syncToBackend();
    },

    /**
     * Set preferred titles
     */
    setTitles: (titles: string[]) => {
      update((prefs) => {
        const next = { ...prefs, titles, updatedAt: Date.now() };
        saveToLocalStorage(next);
        return next;
      });
      store.syncToBackend();
    },

    /**
     * Set both locations and titles at once
     */
    setAll: (locations: string[], titles: string[]) => {
      const next: UserPreferences = { locations, titles, updatedAt: Date.now() };
      set(next);
      saveToLocalStorage(next);
      store.syncToBackend();
    },

    /**
     * Add a single location
     */
    addLocation: (location: string) => {
      const trimmed = location.trim();
      if (!trimmed) return;
      
      // Check for duplicate before calling update to avoid unnecessary store notifications
      const current = get({ subscribe });
      if (current.locations.includes(trimmed)) return;
      
      update((prefs) => {
        const next = {
          ...prefs,
          locations: [...prefs.locations, trimmed],
          updatedAt: Date.now(),
        };
        saveToLocalStorage(next);
        return next;
      });
      store.syncToBackend();
    },

    /**
     * Remove a single location
     */
    removeLocation: (location: string) => {
      update((prefs) => {
        const next = {
          ...prefs,
          locations: prefs.locations.filter((l) => l !== location),
          updatedAt: Date.now(),
        };
        saveToLocalStorage(next);
        return next;
      });
      store.syncToBackend();
    },

    /**
     * Add a single title
     */
    addTitle: (title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      
      // Check for duplicate before calling update to avoid unnecessary store notifications
      const current = get({ subscribe });
      if (current.titles.includes(trimmed)) return;
      
      update((prefs) => {
        const next = {
          ...prefs,
          titles: [...prefs.titles, trimmed],
          updatedAt: Date.now(),
        };
        saveToLocalStorage(next);
        return next;
      });
      store.syncToBackend();
    },

    /**
     * Remove a single title
     */
    removeTitle: (title: string) => {
      update((prefs) => {
        const next = {
          ...prefs,
          titles: prefs.titles.filter((t) => t !== title),
          updatedAt: Date.now(),
        };
        saveToLocalStorage(next);
        return next;
      });
      store.syncToBackend();
    },

    /**
     * Clear all preferences
     */
    clear: async () => {
      set({ ...defaultPreferences });
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);

      const authState = get(auth);
      if (authState.isAuthenticated && authState.user?.email && authState.user?.token) {
        try {
          await fetch('/api/preferences/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authState.user.token}`,
            },
            body: JSON.stringify({
              email: authState.user.email,
              preferences: defaultPreferences,
            }),
          });
        } catch (error) {
          console.error('Failed to clear preferences from backend:', error);
        }
      }
    },

    /**
     * Check if any preferences are saved
     */
    hasPreferences: (): boolean => {
      const prefs = get({ subscribe });
      return prefs.locations.length > 0 || prefs.titles.length > 0;
    },

    /**
     * Sync preferences to backend (Redis)
     */
    syncToBackend: async () => {
      const authState = get(auth);
      if (!authState.isAuthenticated || !authState.user?.email || !authState.user?.token) {
        return;
      }

      try {
        const currentPrefs = get({ subscribe });
        const response = await fetch('/api/preferences/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.user.token}`,
          },
          body: JSON.stringify({
            email: authState.user.email,
            preferences: currentPrefs,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to sync preferences to backend');
        }
      } catch (error) {
        console.error('Preferences backend sync error:', error);
      }
    },

    /**
     * Load preferences from backend (Redis) and merge with local
     */
    loadFromBackend: async () => {
      const authState = get(auth);
      if (!authState.isAuthenticated || !authState.user?.email || !authState.user?.token) {
        return;
      }

      try {
        const response = await fetch(
          `/api/preferences/sync?email=${encodeURIComponent(authState.user.email)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authState.user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load preferences from backend');
        }

        const data = await response.json();
        const remote =
          typeof data.preferences === 'string' ? JSON.parse(data.preferences) : data.preferences;

        if (remote && typeof remote === 'object') {
          const remotePrefs: UserPreferences = {
            locations: Array.isArray(remote.locations) ? remote.locations : [],
            titles: Array.isArray(remote.titles) ? remote.titles : [],
            updatedAt: remote.updatedAt || 0,
          };

          // Merge: union of arrays (deduplicated), keep most recent updatedAt
          const localPrefs = get({ subscribe });
          const mergedLocations = [...new Set([...remotePrefs.locations, ...localPrefs.locations])];
          const mergedTitles = [...new Set([...remotePrefs.titles, ...localPrefs.titles])];
          const merged: UserPreferences = {
            locations: mergedLocations,
            titles: mergedTitles,
            updatedAt: Math.max(remotePrefs.updatedAt, localPrefs.updatedAt),
          };

          set(merged);
          saveToLocalStorage(merged);
        }
      } catch (error) {
        console.error('Failed to load preferences from backend:', error);
      }
    },
  };

  return store;
}

export const preferences = createPreferencesStore();
