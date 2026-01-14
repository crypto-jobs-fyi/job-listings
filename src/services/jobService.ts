import { fetchJSON, API_CONFIG } from './api';
import type { Job, JobsResponse, CurrentResponse } from '../types/job';

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
      fetchJSON<JobsResponse>(`${API_CONFIG.GITHUB_RAW_URL}/crypto_jobs.json`),
      fetchJSON<CurrentResponse>(`${API_CONFIG.GITHUB_RAW_URL}/crypto_current.json`),
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
      fetchJSON<JobsResponse>(`${API_CONFIG.GITHUB_RAW_URL}/ai_jobs.json`),
      fetchJSON<CurrentResponse>(`${API_CONFIG.GITHUB_RAW_URL}/ai_current.json`),
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
    const jobsData = await fetchJSON<JobsResponse>(
      `${API_CONFIG.GITHUB_RAW_URL}/crypto_jobs_new.json`
    );
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
    const jobsData = await fetchJSON<JobsResponse>(`${API_CONFIG.GITHUB_RAW_URL}/ai_jobs_new.json`);
    return jobsData.data.filter((job) => job.company && job.location);
  } catch (error) {
    console.error('Error fetching AI new jobs:', error);
    throw error;
  }
}
