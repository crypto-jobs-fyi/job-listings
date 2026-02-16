import type { Job } from '../types/job';

/**
 * Search utilities for filtering jobs
 */

/** Minimum number of characters required before a search filter is applied */
export const MIN_SEARCH_LENGTH = 2;

/** Default debounce delay in milliseconds for search inputs */
export const SEARCH_DEBOUNCE_MS = 200;

/**
 * Parse and cache normalized search terms from a comma-separated string.
 * Returns an empty array when the input is too short to apply.
 */
export function parseSearchTerms(searchTerms: string): string[] {
  if (!searchTerms) return [];
  const terms = searchTerms
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter((term) => term.length >= MIN_SEARCH_LENGTH);
  return terms;
}

/**
 * Check if any search term matches the target string.
 * Accepts pre-parsed terms for performance (avoids re-parsing on every job).
 */
export function matchesAnyTerm(target: string | undefined, searchTerms: string): boolean {
  if (!target || !searchTerms) return false;
  const terms = parseSearchTerms(searchTerms);
  if (terms.length === 0) return false;
  return terms.some((term) => target.toLowerCase().includes(term));
}

/**
 * Optimised: check if any pre-parsed term matches the target string.
 */
function matchesParsedTerms(target: string | undefined, parsedTerms: string[]): boolean {
  if (!target || parsedTerms.length === 0) return false;
  const lower = target.toLowerCase();
  return parsedTerms.some((term) => lower.includes(term));
}

/**
 * Filter jobs based on search criteria.
 * Terms shorter than MIN_SEARCH_LENGTH are ignored.
 */
export function filterJobs(
  jobs: Job[],
  companySearch: string,
  locationSearch: string,
  titleSearch: string
): Job[] {
  const companyTerms = parseSearchTerms(companySearch);
  const locationTerms = parseSearchTerms(locationSearch);
  const titleTerms = parseSearchTerms(titleSearch);

  // If no valid terms exist, return all jobs (no filtering needed)
  if (companyTerms.length === 0 && locationTerms.length === 0 && titleTerms.length === 0) {
    return jobs;
  }

  return jobs.filter(
    (job) =>
      (companyTerms.length === 0 || matchesParsedTerms(job.company, companyTerms)) &&
      (locationTerms.length === 0 || matchesParsedTerms(job.location, locationTerms)) &&
      (titleTerms.length === 0 || matchesParsedTerms(job.title, titleTerms))
  );
}

/**
 * Creates a debounced version of a function.
 * The function will only be called after `delay` ms of inactivity.
 */
export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Group jobs by company
 */
export function groupJobsByCompany(jobs: Job[]): Record<string, Job[]> {
  return jobs.reduce(
    (groups, job) => {
      const company = job.company || 'Unknown';
      if (!Array.isArray(groups[company])) {
        groups[company] = [];
      }
      groups[company].push(job);
      return groups;
    },
    {} as Record<string, Job[]>
  );
}

/**
 * Create a unique job ID based on company, title, location, and link
 */
export function makeJobId(job: Job): string {
  return `${job.company}-${job.title}-${job.location}-${job.link}`
    .replace(/\s+/g, '-')
    .toLowerCase();
}
