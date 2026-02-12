import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FavoritesPage from '../FavoritesPage.svelte';
import { favorites } from '../../stores/favorites';

// Hoist the mock stores so they can be used in vi.mock
const { mockStore, mockAuthStore } = vi.hoisted(() => {
  type StoreValue = Map<string, unknown>;
  type Subscriber = (value: StoreValue) => void;
  type AuthState = { isAuthenticated: boolean; user: { email: string } | null };
  type AuthSubscriber = (value: AuthState) => void;

  const subscribers = new Set<Subscriber>();
  let value: StoreValue = new Map();

  const authSubscribers = new Set<AuthSubscriber>();
  let authValue: AuthState = { isAuthenticated: true, user: { email: 'test@example.com' } };

  return {
    mockStore: {
      subscribe: (run: Subscriber) => {
        run(value);
        subscribers.add(run);
        return () => subscribers.delete(run);
      },
      set: (val: StoreValue) => {
        value = val;
        subscribers.forEach((run) => run(value));
      },
      clear: vi.fn(),
      loadFromBackend: vi.fn().mockResolvedValue(undefined),
    },
    mockAuthStore: {
      subscribe: (run: AuthSubscriber) => {
        run(authValue);
        authSubscribers.add(run);
        return () => authSubscribers.delete(run);
      },
      set: (val: AuthState) => {
        authValue = val;
        authSubscribers.forEach((run) => run(authValue));
      },
      checkAuth: vi.fn(),
    },
  };
});

vi.mock('../../stores/favorites', () => ({
  favorites: mockStore,
}));

vi.mock('../../stores/auth', () => ({
  auth: mockAuthStore,
}));

vi.mock('../../services/companyService', () => ({
  companyService: {
    fetchCryptoCompanies: vi.fn().mockResolvedValue([]),
    fetchAICompanies: vi.fn().mockResolvedValue([]),
    fetchFinTechCompanies: vi.fn().mockResolvedValue([]),
  },
  getCompanyUrl: vi.fn(),
  getCompanyLogoUrl: vi.fn(),
}));

describe('FavoritesPage', () => {
  beforeEach(() => {
    mockStore.set(new Map());
    vi.clearAllMocks();
    // Mock window.confirm
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
  });

  it('renders empty state when no favorites', async () => {
    render(FavoritesPage);

    await waitFor(() => {
      expect(screen.getByText("You haven't saved any favorites yet!")).toBeTruthy();
    });
    expect(screen.getByText(/Browse jobs and click the ★ icon/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /Browse Crypto Jobs/i })).toBeTruthy();
  });

  it('renders favorites list when there are favorites', async () => {
    const mockFavs = new Map();
    mockFavs.set('1', {
      id: '1',
      title: 'Software Engineer',
      company: 'Tech Co',
      link: 'http://example.com',
      category: 'crypto',
      addedAt: Date.now(),
    });
    mockStore.set(mockFavs);

    render(FavoritesPage);

    await waitFor(() => {
      expect(screen.getByText(/My Favorite Jobs \(1\)/)).toBeTruthy();
    });

    expect(screen.getByText(/Share/)).toBeTruthy();
    expect(screen.getByText('Clear all')).toBeTruthy();

    // Check if JobBoard rendered the job
    expect(screen.getByText('Software Engineer')).toBeTruthy();
    expect(screen.getByText('Tech Co')).toBeTruthy();
  });

  it('calls clear() when Clear all is clicked', async () => {
    const mockFavs = new Map();
    mockFavs.set('1', {
      id: '1',
      title: 'Job 1',
      company: 'Co 1',
      link: 'url',
      category: 'ai',
      addedAt: Date.now(),
    });
    mockStore.set(mockFavs);

    render(FavoritesPage);

    await waitFor(() => {
      expect(screen.getByText('Clear all')).toBeTruthy();
    });

    const clearBtn = screen.getByText('Clear all');
    await fireEvent.click(clearBtn);

    expect(favorites.clear).toHaveBeenCalled();
  });
});
