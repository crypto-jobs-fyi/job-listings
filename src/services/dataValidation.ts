import type { Company } from '../types/company';
import type { CurrentResponse, Job, JobsResponse } from '../types/job';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isJob(value: unknown): value is Job {
  return (
    isRecord(value) &&
    typeof value.company === 'string' &&
    typeof value.title === 'string' &&
    typeof value.location === 'string' &&
    typeof value.link === 'string'
  );
}

function isCompany(value: unknown): value is Company {
  return isRecord(value) && typeof value.company_name === 'string';
}

export function validateJobsResponse(value: unknown): JobsResponse {
  if (!isRecord(value) || !Array.isArray(value.data) || !value.data.every(isJob)) {
    throw new Error('Expected a jobs response containing complete job records');
  }

  return { data: value.data };
}

export function validateCurrentResponse(value: unknown): CurrentResponse {
  if (!isRecord(value) || typeof value.total_jobs !== 'number') {
    throw new Error('Expected a current-jobs response containing total_jobs');
  }

  return value as CurrentResponse;
}

export function validateCompaniesResponse(value: unknown): Company[] {
  if (!Array.isArray(value) || !value.every(isCompany)) {
    throw new Error('Expected a companies response containing company_name values');
  }

  return value;
}
