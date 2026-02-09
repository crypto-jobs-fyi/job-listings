/**
 * Authentication store
 * Manages user authentication state with localStorage persistence
 */

import { writable } from 'svelte/store';
import type { User, AuthState } from '../types/user';

const STORAGE_KEY = 'auth_state';
const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_DAYS_REMEMBER = 30;

// Load auth state from localStorage
function loadAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false, loading: false, error: null };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { user: null, isAuthenticated: false, loading: false, error: null };
    }

    const user: User = JSON.parse(stored);

    // Check if session is expired
    const now = Date.now();
    const sessionDuration = user.rememberMe
      ? SESSION_DURATION_DAYS_REMEMBER
      : SESSION_DURATION_DAYS;
    const expirationTime = user.loginTime + sessionDuration * 24 * 60 * 60 * 1000;

    if (now > expirationTime) {
      localStorage.removeItem(STORAGE_KEY);
      return { user: null, isAuthenticated: false, loading: false, error: null };
    }

    return { user, isAuthenticated: true, loading: false, error: null };
  } catch (error) {
    console.error('Failed to load auth state:', error);
    return { user: null, isAuthenticated: false, loading: false, error: null };
  }
}

// Save auth state to localStorage
function saveAuthState(user: User | null) {
  if (typeof window === 'undefined') return;

  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Create the store
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(loadAuthState());

  return {
    subscribe,

    login: (email: string, rememberMe: boolean = false) => {
      const user: User = {
        email,
        loginTime: Date.now(),
        rememberMe,
      };
      saveAuthState(user);
      set({ user, isAuthenticated: true, loading: false, error: null });
    },

    logout: () => {
      saveAuthState(null);
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    },

    setLoading: (loading: boolean) => {
      update((state) => ({ ...state, loading }));
    },

    setError: (error: string | null) => {
      update((state) => ({ ...state, error }));
    },

    checkAuth: (): boolean => {
      const state = loadAuthState();
      set(state);
      return state.isAuthenticated;
    },

    getSessionExpiration: (): Date | null => {
      const state = loadAuthState();
      if (!state.user) return null;

      const sessionDuration = state.user.rememberMe
        ? SESSION_DURATION_DAYS_REMEMBER
        : SESSION_DURATION_DAYS;
      return new Date(state.user.loginTime + sessionDuration * 24 * 60 * 60 * 1000);
    },
  };
}

export const auth = createAuthStore();
