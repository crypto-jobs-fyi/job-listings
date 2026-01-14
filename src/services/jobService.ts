import { fetchJSON } from './api';
import type { Job, JobsResponse, CurrentResponse } from '../types/job';
import { ENDPOINTS } from '../utils/constants';

/**
 * Job Service - handles all job-related API calls
 */

/**
 * Fetch crypto jobs
 */
export async function fetchCryptoJobs(): Promise<{
  jobs: Job[];
  total: number | null;
}> {
  try {
    const [jobsData, currentData] = await Promise.all([
      fetchJSON<JobsResponse>(ENDPOINTS.CRYPTO_JOBS),
      fetchJSON<CurrentResponse>(ENDPOINTS.CRYPTO_CURRENT),
    ]);

    const jobs = jobsData.data.filter((job) => job.company && job.location);
    return {
      jobs,
      total: currentData['Total Jobs'] || null,
    };
  } catch (error) {
    console.error('Error fetching crypto jobs:', error);
    throw error;
  }
}

/**
 * Fetch AI jobs
 */
export async function fetchAIJobs(): Promise<{
  jobs: Job[];
  total: number | null;
}> {
  try {
    const [jobsData, currentData] = await Promise.all([
      fetchJSON<JobsResponse>(ENDPOINTS.AI_JOBS),
      fetchJSON<CurrentResponse>(ENDPOINTS.AI_CURRENT),
    ]);

    const jobs = jobsData.data.filter((job) => job.company && job.location);
    return {
      jobs,
      total: currentData['Total Jobs'] || null,
    };
  } catch (error) {
    console.error('Error fetching AI jobs:', error);
    throw error;
  }
}

/**
 * Fetch new crypto jobs
 */
export async function fetchCryptoNewJobs(): Promise<Job[]> {
  try {
    const jobsData = await fetchJSON<JobsResponse>(ENDPOINTS.CRYPTO_NEW_JOBS);
    return jobsData.data.filter((job) => job.company && job.location);
  } catch (error) {
    console.error('Error fetching crypto new jobs:', error);
    throw error;
  }
}

/**
 * Fetch new AI jobs
 */
export async function fetchAINewJobs(): Promise<Job[]> {
  try {
    const jobsData = await fetchJSON<JobsResponse>(ENDPOINTS.AI_NEW_JOBS);
    return jobsData.data.filter((job) => job.company && job.location);
  } catch (error) {
    console.error('Error fetching AI new jobs:', error);
    throw error;
  }
}
