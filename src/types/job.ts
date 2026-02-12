export type JobCategory = 'crypto' | 'ai' | 'fin' | 'all';

export interface Job {
  id?: string;
  company: string;
  title: string;
  location: string;
  link: string;
  category?: JobCategory;
  postedDate?: string;
}

export interface JobsResponse {
  data: Job[];
}

export interface CurrentResponse {
  [key: string]: number | string;
  'Total Jobs': number;
}
