import type { Job } from '../types/job';

/**
 * Search utilities for filtering jobs
 */

/**
 * Check if any search term matches the target string
 */
export function matchesAnyTerm(target: string | undefined, searchTerms: string): boolean {
  if (!target || !searchTerms) return false;
  const terms = searchTerms
    .split(',')
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  if (terms.length === 0) return false;
  return terms.some((term) => target.toLowerCase().includes(term));
}

/**
 * Filter jobs based on search criteria
 */
export function filterJobs(
  jobs: Job[],
  companySearch: string,
  locationSearch: string,
  titleSearch: string
): Job[] {
  return jobs.filter(
    (job) =>
      (!companySearch || (job.company && matchesAnyTerm(job.company, companySearch))) &&
      (!locationSearch || (job.location && matchesAnyTerm(job.location, locationSearch))) &&
      (!titleSearch || (job.title && matchesAnyTerm(job.title, titleSearch)))
  );
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
