import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { preferences } from '../../stores/preferences';
import { STORAGE_KEYS } from '../../utils/constants';

/**
 * Test suite for the preferences store
 */
describe('Preferences Store', () => {
  beforeEach(() => {
    localStorage.clear();
    preferences.clear();
  });

  afterEach(() => {
    localStorage.clear();
    preferences.clear();
  });

  describe('Setting locations', () => {
    it('should set preferred locations', () => {
      preferences.setLocations(['Remote', 'New York']);

      const prefs = get(preferences);
      expect(prefs.locations).toEqual(['Remote', 'New York']);
    });

    it('should persist locations to localStorage', () => {
      preferences.setLocations(['London', 'Berlin']);

      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.locations).toEqual(['London', 'Berlin']);
    });

    it('should replace existing locations', () => {
      preferences.setLocations(['Remote']);
      preferences.setLocations(['San Francisco']);

      const prefs = get(preferences);
      expect(prefs.locations).toEqual(['San Francisco']);
    });
  });

  describe('Setting titles', () => {
    it('should set preferred titles', () => {
      preferences.setTitles(['Engineer', 'Developer']);

      const prefs = get(preferences);
      expect(prefs.titles).toEqual(['Engineer', 'Developer']);
    });

    it('should persist titles to localStorage', () => {
      preferences.setTitles(['QA', 'DevOps']);

      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.titles).toEqual(['QA', 'DevOps']);
    });
  });

  describe('Setting all preferences', () => {
    it('should set both locations and titles at once', () => {
      preferences.setAll(['Remote', 'NYC'], ['Engineer', 'PM']);

      const prefs = get(preferences);
      expect(prefs.locations).toEqual(['Remote', 'NYC']);
      expect(prefs.titles).toEqual(['Engineer', 'PM']);
    });

    it('should set updatedAt timestamp', () => {
      const before = Date.now();
      preferences.setAll(['Remote'], ['Engineer']);
      const after = Date.now();

      const prefs = get(preferences);
      expect(prefs.updatedAt).toBeGreaterThanOrEqual(before);
      expect(prefs.updatedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('Adding individual items', () => {
    it('should add a single location', () => {
      preferences.addLocation('Remote');
      preferences.addLocation('Berlin');

      const prefs = get(preferences);
      expect(prefs.locations).toEqual(['Remote', 'Berlin']);
    });

    it('should not add duplicate location', () => {
      preferences.addLocation('Remote');
      preferences.addLocation('Remote');

      const prefs = get(preferences);
      expect(prefs.locations).toEqual(['Remote']);
    });

    it('should not add empty location', () => {
      preferences.addLocation('');
      preferences.addLocation('   ');

      const prefs = get(preferences);
      expect(prefs.locations).toEqual([]);
    });

    it('should add a single title', () => {
      preferences.addTitle('Engineer');
      preferences.addTitle('PM');

      const prefs = get(preferences);
      expect(prefs.titles).toEqual(['Engineer', 'PM']);
    });

    it('should not add duplicate title', () => {
      preferences.addTitle('Engineer');
      preferences.addTitle('Engineer');

      const prefs = get(preferences);
      expect(prefs.titles).toEqual(['Engineer']);
    });

    it('should not add empty title', () => {
      preferences.addTitle('');
      preferences.addTitle('   ');

      const prefs = get(preferences);
      expect(prefs.titles).toEqual([]);
    });
  });

  describe('Removing individual items', () => {
    beforeEach(() => {
      preferences.setAll(['Remote', 'Berlin', 'NYC'], ['Engineer', 'QA', 'DevOps']);
    });

    it('should remove a specific location', () => {
      preferences.removeLocation('Berlin');

      const prefs = get(preferences);
      expect(prefs.locations).toEqual(['Remote', 'NYC']);
    });

    it('should remove a specific title', () => {
      preferences.removeTitle('QA');

      const prefs = get(preferences);
      expect(prefs.titles).toEqual(['Engineer', 'DevOps']);
    });

    it('should not error when removing non-existent item', () => {
      preferences.removeLocation('Nowhere');
      preferences.removeTitle('CEO');

      const prefs = get(preferences);
      expect(prefs.locations).toEqual(['Remote', 'Berlin', 'NYC']);
      expect(prefs.titles).toEqual(['Engineer', 'QA', 'DevOps']);
    });

    it('should persist removal to localStorage', () => {
      preferences.removeLocation('Berlin');

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES)!);
      expect(stored.locations).toEqual(['Remote', 'NYC']);
    });
  });

  describe('Clearing preferences', () => {
    beforeEach(() => {
      preferences.setAll(['Remote'], ['Engineer']);
    });

    it('should clear all preferences', () => {
      preferences.clear();

      const prefs = get(preferences);
      expect(prefs.locations).toEqual([]);
      expect(prefs.titles).toEqual([]);
    });

    it('should remove localStorage entry when cleared', () => {
      expect(localStorage.getItem(STORAGE_KEYS.PREFERENCES)).toBeTruthy();

      preferences.clear();

      expect(localStorage.getItem(STORAGE_KEYS.PREFERENCES)).toBeNull();
    });
  });

  describe('hasPreferences', () => {
    it('should return false when no preferences saved', () => {
      expect(preferences.hasPreferences()).toBe(false);
    });

    it('should return true when locations are saved', () => {
      preferences.setLocations(['Remote']);
      expect(preferences.hasPreferences()).toBe(true);
    });

    it('should return true when titles are saved', () => {
      preferences.setTitles(['Engineer']);
      expect(preferences.hasPreferences()).toBe(true);
    });

    it('should return false after clearing', () => {
      preferences.setAll(['Remote'], ['Engineer']);
      expect(preferences.hasPreferences()).toBe(true);

      preferences.clear();
      expect(preferences.hasPreferences()).toBe(false);
    });
  });

  describe('Subscription', () => {
    it('should notify subscribers of changes', () => {
      let callCount = 0;
      const unsubscribe = preferences.subscribe(() => {
        callCount++;
      });

      // Initial subscription
      expect(callCount).toBe(1);

      preferences.addLocation('Remote');
      expect(callCount).toBe(2);

      preferences.addTitle('Engineer');
      expect(callCount).toBe(3);

      unsubscribe();
    });

    it('should provide current preferences to subscribers', () => {
      let received: { locations: string[]; titles: string[] } | null = null;

      const unsubscribe = preferences.subscribe((prefs) => {
        received = prefs;
      });

      preferences.setAll(['Remote'], ['Engineer']);

      expect(received).not.toBeNull();
      expect(received!.locations).toEqual(['Remote']);
      expect(received!.titles).toEqual(['Engineer']);

      unsubscribe();
    });
  });

  describe('LocalStorage persistence', () => {
    it('should load preferences from localStorage on initialization', () => {
      const testPrefs = {
        locations: ['Remote', 'Berlin'],
        titles: ['Engineer'],
        updatedAt: 123456,
      };

      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(testPrefs));

      // Verify data persists in localStorage
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      const parsed = JSON.parse(stored!);

      expect(parsed.locations).toEqual(['Remote', 'Berlin']);
      expect(parsed.titles).toEqual(['Engineer']);
      expect(parsed.updatedAt).toBe(123456);
    });
  });
});
