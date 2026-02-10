import { writable, get } from 'svelte/store';
import type { FavoriteJob } from '../types/favorites';
import { auth } from './auth';

/**
 * Favorites store - manages all favorite jobs with persistence to localStorage
 * Note: Favorites are stored locally but require login to sync across devices
 */
function createFavoritesStore() {
  // Load from localStorage on initialization
  const loadFromLocalStorage = (): Map<string, FavoriteJob> => {
    try {
      const stored = localStorage.getItem('favoriteJobs');
      if (stored) {
        const arr = JSON.parse(stored) as FavoriteJob[];
        return new Map(arr.map((job) => [job.id, job]));
      }
    } catch (e) {
      console.error('Error loading favorites from localStorage:', e);
    }
    return new Map();
  };

  const initial = loadFromLocalStorage();
  const { subscribe, set, update } = writable<Map<string, FavoriteJob>>(initial);

  return {
    subscribe,
    /**
     * Check if user is authenticated (for UI feedback)
     */
    requiresAuth: (): boolean => {
      const authState = get(auth);
      return !authState.isAuthenticated;
    },
    /**
     * Add or remove a favorite
     */
    toggle: (job: FavoriteJob) => {
      let updatedFavorites!: Map<string, FavoriteJob>;
      
      update((map) => {
        const next = new Map(map);
        if (next.has(job.id)) {
          next.delete(job.id);
        } else {
          next.set(job.id, job);
        }
        // Persist to localStorage
        localStorage.setItem('favoriteJobs', JSON.stringify(Array.from(next.values())));
        
        // Store the updated map to sync after state is committed
        updatedFavorites = next;
        return next;
      });

      // Sync to backend if authenticated (after state update is committed)
      const authState = get(auth);
      if (authState.isAuthenticated) {
        favorites.syncToBackendWithData(updatedFavorites);
      }
    },
    /**
     * Add a favorite
     */
    add: (job: FavoriteJob) => {
      update((map) => {
        const next = new Map(map);
        next.set(job.id, job);
        localStorage.setItem('favoriteJobs', JSON.stringify(Array.from(next.values())));
        return next;
      });
    },
    /**
     * Remove a favorite by ID
     */
    remove: (jobId: string) => {
      update((map) => {
        const next = new Map(map);
        next.delete(jobId);
        localStorage.setItem('favoriteJobs', JSON.stringify(Array.from(next.values())));
        return next;
      });
    },
    /**
     * Check if a job is favorited
     */
    isFavorite: (jobId: string): boolean => {
      let result = false;
      subscribe((map) => {
        result = map.has(jobId);
      })();
      return result;
    },
    /**
     * Get all favorites
     */
    getAll: (): FavoriteJob[] => {
      let result: FavoriteJob[] = [];
      subscribe((map) => {
        result = Array.from(map.values());
      })();
      return result;
    },
    /**
     * Clear all favorites
     */
    clear: async () => {
      set(new Map());
      localStorage.removeItem('favoriteJobs');

      // Also clear from backend if authenticated
      const authState = get(auth);
      if (authState.isAuthenticated && authState.user?.email) {
        try {
          await fetch('/api/favorites/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authState.user.email}`,
            },
            body: JSON.stringify({
              email: authState.user.email,
              favorites: {},
            }),
          });
        } catch (error) {
          console.error('Failed to clear favorites from backend:', error);
        }
      }
    },
    /**
     * Sync favorites to backend (Redis)
     */
    syncToBackend: async () => {
      const currentFavorites = get({ subscribe });
      await favorites.syncToBackendWithData(currentFavorites);
    },
    /**
     * Sync specific favorites data to backend (Redis)
     * Used when we have the updated state and don't want to read stale data
     */
    syncToBackendWithData: async (favoritesMap: Map<string, FavoriteJob>) => {
      const authState = get(auth);
      if (!authState.isAuthenticated || !authState.user?.email) {
        console.warn('Cannot sync favorites: user not authenticated');
        return;
      }

      try {
        const favoritesObject: Record<string, FavoriteJob> = {};
        favoritesMap.forEach((job, id) => {
          favoritesObject[id] = job;
        });

        const response = await fetch('/api/favorites/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authState.user.email}`,
          },
          body: JSON.stringify({
            email: authState.user.email,
            favorites: favoritesObject,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to sync favorites to backend');
        }

        await response.json();
      } catch (error) {
        console.error('Backend sync error:', error);
      }
    },
    /**
     * Load favorites from backend (Redis)
     */
    loadFromBackend: async () => {
      const authState = get(auth);
      if (!authState.isAuthenticated || !authState.user?.email) {
        console.warn('Cannot load favorites: user not authenticated');
        return;
      }

      try {
        const response = await fetch(
          `/api/favorites/sync?email=${encodeURIComponent(authState.user.email)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authState.user.email}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load favorites from backend');
        }

        const data = await response.json();
        const favoritesObject =
          typeof data.favorites === 'string' ? JSON.parse(data.favorites) : data.favorites;

        if (favoritesObject && typeof favoritesObject === 'object') {
          const favoritesMap = new Map<string, FavoriteJob>();
          Object.entries(favoritesObject).forEach(([id, job]) => {
            favoritesMap.set(id, job as FavoriteJob);
          });

          // Merge with local favorites (keep union of both)
          const localFavorites = get({ subscribe });
          localFavorites.forEach((job, id) => {
            if (!favoritesMap.has(id)) {
              favoritesMap.set(id, job);
            }
          });

          set(favoritesMap);
          localStorage.setItem('favoriteJobs', JSON.stringify(Array.from(favoritesMap.values())));
        }
      } catch (error) {
        console.error('Failed to load favorites from backend:', error);
      }
    },
  };
}

export const favorites = createFavoritesStore();
