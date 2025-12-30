import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FavoritesPage from '../FavoritesPage.svelte';
import { favorites } from '../../stores/favorites';

// Hoist the mock store so it can be used in vi.mock
const { mockStore } = vi.hoisted(() => {
  type StoreValue = Map<string, unknown>;
  type Subscriber = (value: StoreValue) => void;

  const subscribers = new Set<Subscriber>();
  let value: StoreValue = new Map();

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
    },
  };
});

vi.mock('../../stores/favorites', () => ({
  favorites: mockStore,
}));

vi.mock('../../services/companyService', () => ({
  companyService: {
    fetchCryptoCompanies: vi.fn().mockResolvedValue([]),
    fetchAICompanies: vi.fn().mockResolvedValue([]),
  },
  getCompanyUrl: vi.fn(),
  getCompanyLogoUrl: vi.fn(),
}));

describe('FavoritesPage', () => {
  beforeEach(() => {
    mockStore.set(new Map());
    vi.clearAllMocks();
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
