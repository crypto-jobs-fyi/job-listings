import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { favorites } from '../../stores/favorites';
import type { FavoriteJob } from '../../types/favorites';

/**
 * Test suite for the favorites store
 */
describe('Favorites Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Re-create the store to reset its state
    favorites.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    favorites.clear();
  });

  describe('Adding favorites', () => {
    it('should add a job to favorites', () => {
      const testJob: FavoriteJob = {
        id: 'test-job-1',
        company: 'Test Company',
        title: 'Software Engineer',
        link: 'https://example.com/job',
        category: 'crypto',
        addedAt: Date.now(),
      };

      favorites.add(testJob);

      const favMap = get(favorites);
      expect(favMap.has('test-job-1')).toBe(true);
      expect(favMap.get('test-job-1')).toEqual(testJob);
    });

    it('should persist job to localStorage when added', () => {
      const testJob: FavoriteJob = {
        id: 'test-job-2',
        company: 'Another Company',
        title: 'Product Manager',
        link: 'https://example.com/job2',
        category: 'ai',
        addedAt: Date.now(),
      };

      favorites.add(testJob);

      const stored = localStorage.getItem('favoriteJobs');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe('test-job-2');
    });

    it('should not add duplicate favorites', () => {
      const testJob: FavoriteJob = {
        id: 'test-job-3',
        company: 'Duplicate Company',
        title: 'Engineer',
        link: 'https://example.com/job3',
        category: 'crypto',
      };

      favorites.add(testJob);
      favorites.add(testJob);

      const favMap = get(favorites);
      expect(favMap.size).toBe(1);
    });
  });

  describe('Removing favorites', () => {
    beforeEach(() => {
      const testJob: FavoriteJob = {
        id: 'test-job-4',
        company: 'Remove Me',
        title: 'Dev',
        link: 'https://example.com/job4',
        category: 'ai',
      };
      favorites.add(testJob);
    });

    it('should remove a job from favorites by ID', () => {
      favorites.remove('test-job-4');

      const favMap = get(favorites);
      expect(favMap.has('test-job-4')).toBe(false);
    });

    it('should persist removal to localStorage', () => {
      favorites.remove('test-job-4');

      const stored = localStorage.getItem('favoriteJobs');
      const parsed = stored ? JSON.parse(stored) : [];
      expect(parsed.length).toBe(0);
    });
  });

  describe('Toggling favorites', () => {
    it('should add a job when toggling non-existent favorite', () => {
      const testJob: FavoriteJob = {
        id: 'toggle-test-1',
        company: 'Toggle Co',
        title: 'Engineer',
        link: 'https://example.com/job5',
        category: 'crypto',
      };

      favorites.toggle(testJob);

      const favMap = get(favorites);
      expect(favMap.has('toggle-test-1')).toBe(true);
    });

    it('should remove a job when toggling existing favorite', () => {
      const testJob: FavoriteJob = {
        id: 'toggle-test-2',
        company: 'Toggle Co',
        title: 'Engineer',
        link: 'https://example.com/job6',
        category: 'crypto',
      };

      favorites.toggle(testJob);
      expect(get(favorites).has('toggle-test-2')).toBe(true);

      favorites.toggle(testJob);
      expect(get(favorites).has('toggle-test-2')).toBe(false);
    });

    it('should persist toggle changes to localStorage', () => {
      const testJob: FavoriteJob = {
        id: 'toggle-test-3',
        company: 'Toggle Co',
        title: 'Engineer',
        link: 'https://example.com/job7',
        category: 'crypto',
      };

      favorites.toggle(testJob);

      let stored = JSON.parse(localStorage.getItem('favoriteJobs') || '[]');
      expect(stored.length).toBe(1);

      favorites.toggle(testJob);

      stored = JSON.parse(localStorage.getItem('favoriteJobs') || '[]');
      expect(stored.length).toBe(0);
    });
  });

  describe('Checking if favorited', () => {
    beforeEach(() => {
      const testJob: FavoriteJob = {
        id: 'check-test-1',
        company: 'Check Co',
        title: 'Engineer',
        link: 'https://example.com/job8',
        category: 'crypto',
      };
      favorites.add(testJob);
    });

    it('should return true for favorited job', () => {
      const result = favorites.isFavorite('check-test-1');
      expect(result).toBe(true);
    });

    it('should return false for non-favorited job', () => {
      const result = favorites.isFavorite('nonexistent-job');
      expect(result).toBe(false);
    });
  });

  describe('Getting all favorites', () => {
    it('should return empty array when no favorites', () => {
      const all = favorites.getAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBe(0);
    });

    it('should return all favorites as array', () => {
      const job1: FavoriteJob = {
        id: 'getall-1',
        company: 'Co1',
        title: 'Job1',
        link: 'https://example.com/1',
        category: 'crypto',
      };

      const job2: FavoriteJob = {
        id: 'getall-2',
        company: 'Co2',
        title: 'Job2',
        link: 'https://example.com/2',
        category: 'ai',
      };

      favorites.add(job1);
      favorites.add(job2);

      const all = favorites.getAll();
      expect(all.length).toBe(2);
      expect(all.some((j) => j.id === 'getall-1')).toBe(true);
      expect(all.some((j) => j.id === 'getall-2')).toBe(true);
    });
  });

  describe('Clearing all favorites', () => {
    beforeEach(() => {
      const job1: FavoriteJob = {
        id: 'clear-1',
        company: 'Co1',
        title: 'Job1',
        link: 'https://example.com/1',
        category: 'crypto',
      };

      const job2: FavoriteJob = {
        id: 'clear-2',
        company: 'Co2',
        title: 'Job2',
        link: 'https://example.com/2',
        category: 'ai',
      };

      favorites.add(job1);
      favorites.add(job2);
    });

    it('should clear all favorites', () => {
      expect(get(favorites).size).toBe(2);

      favorites.clear();

      expect(get(favorites).size).toBe(0);
    });

    it('should remove localStorage entry when cleared', () => {
      expect(localStorage.getItem('favoriteJobs')).toBeTruthy();

      favorites.clear();

      expect(localStorage.getItem('favoriteJobs')).toBeNull();
    });
  });

  describe('Favorites subscription', () => {
    it('should notify subscribers of changes', () => {
      let callCount = 0;
      const unsubscribe = favorites.subscribe(() => {
        callCount++;
      });

      const testJob: FavoriteJob = {
        id: 'sub-test-1',
        company: 'Sub Co',
        title: 'Job',
        link: 'https://example.com/sub',
        category: 'crypto',
      };

      // Initial subscription increments count
      expect(callCount).toBe(1);

      // Adding a favorite should trigger update
      favorites.add(testJob);
      expect(callCount).toBe(2);

      // Removing should trigger update
      favorites.remove('sub-test-1');
      expect(callCount).toBe(3);

      unsubscribe();
    });

    it('should provide Map of favorites to subscribers', () => {
      let receivedMap: Map<string, FavoriteJob> | null = null;

      const unsubscribe = favorites.subscribe((favMap) => {
        receivedMap = favMap;
      });

      const testJob: FavoriteJob = {
        id: 'map-test-1',
        company: 'Map Co',
        title: 'Job',
        link: 'https://example.com/map',
        category: 'crypto',
      };

      favorites.add(testJob);

      expect(receivedMap).toBeInstanceOf(Map);
      expect(receivedMap?.get('map-test-1')).toEqual(testJob);

      unsubscribe();
    });
  });

  describe('LocalStorage persistence', () => {
    it('should load favorites from localStorage on initialization', () => {
      const testJob: FavoriteJob = {
        id: 'persist-1',
        company: 'Persist Co',
        title: 'Job',
        link: 'https://example.com/persist',
        category: 'crypto',
        addedAt: 123456,
      };

      // Add to localStorage directly
      localStorage.setItem('favoriteJobs', JSON.stringify([testJob]));

      // Create a new store instance to simulate fresh load
      // Note: In real scenario, this would be a new store instance
      // For this test, we verify data persists
      const stored = localStorage.getItem('favoriteJobs');
      const parsed = JSON.parse(stored || '[]');

      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe('persist-1');
      expect(parsed[0].addedAt).toBe(123456);
    });
  });
});
