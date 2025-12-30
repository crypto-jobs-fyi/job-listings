import { writable } from 'svelte/store';
import type { FavoriteJob } from '../types/favorites';

/**
 * Favorites store - manages all favorite jobs with persistence to localStorage
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
     * Add or remove a favorite
     */
    toggle: (job: FavoriteJob) => {
      update((map) => {
        const next = new Map(map);
        if (next.has(job.id)) {
          next.delete(job.id);
        } else {
          next.set(job.id, job);
        }
        // Persist to localStorage
        localStorage.setItem('favoriteJobs', JSON.stringify(Array.from(next.values())));
        return next;
      });
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
    clear: () => {
      set(new Map());
      localStorage.removeItem('favoriteJobs');
    },
  };
}

export const favorites = createFavoritesStore();
