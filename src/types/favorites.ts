export interface FavoriteJob {
  id: string;
  company: string;
  title: string;
  location: string;
  link: string;
  category: 'crypto' | 'ai' | 'fin' | 'all';
  addedAt?: number;
}
