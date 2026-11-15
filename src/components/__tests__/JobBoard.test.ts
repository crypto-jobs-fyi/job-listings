import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import JobBoard from '../JobBoard.svelte';

describe('JobBoard', () => {
  it('renders companies with duplicate names without losing their links', () => {
    render(JobBoard, {
      isCompaniesView: true,
      companies: [
        { company_name: 'Example', company_url: 'https://first.example' },
        { company_name: 'Example', company_url: 'https://second.example' },
      ],
    });

    const links = screen.getAllByRole('link', { name: 'Example' });
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('https://first.example');
    expect(links[1].getAttribute('href')).toBe('https://second.example');
  });
});
