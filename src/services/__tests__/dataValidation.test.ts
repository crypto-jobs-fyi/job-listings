import { describe, expect, it } from 'vitest';
import {
  validateCompaniesResponse,
  validateCurrentResponse,
  validateJobsResponse,
} from '../dataValidation';

describe('data validation', () => {
  it('accepts complete job, company, and current-job responses', () => {
    expect(
      validateJobsResponse({
        data: [
          {
            company: 'Example',
            title: 'Engineer',
            location: 'Remote',
            link: 'https://example.test',
          },
        ],
      })
    ).toHaveProperty('data');
    expect(validateCompaniesResponse([{ company_name: 'Example' }])).toHaveLength(1);
    expect(validateCurrentResponse({ total_jobs: 1 })).toMatchObject({ total_jobs: 1 });
  });

  it('rejects incomplete records before they enter application state', () => {
    expect(() => validateJobsResponse({ data: [{ company: 'Example' }] })).toThrow(
      'complete job records'
    );
    expect(() => validateCompaniesResponse([{ name: 'Example' }])).toThrow('company_name');
    expect(() => validateCurrentResponse({ total_jobs: '1' })).toThrow('total_jobs');
  });
});
