import { fetchJSON, API_CONFIG } from './api';
import type { Company } from '../types/company';

/**
 * Company Service - handles all company-related API calls
 */
export const companyService = {
  /**
   * Fetch crypto companies
   */
  fetchCryptoCompanies: async (): Promise<Company[]> => {
    try {
      return await fetchJSON<Company[]>(`${API_CONFIG.GITHUB_RAW_URL}/companies.json`);
    } catch (error) {
      console.error('Error fetching crypto companies:', error);
      throw error;
    }
  },

  /**
   * Fetch AI companies
   */
  fetchAICompanies: async (): Promise<Company[]> => {
    try {
      return await fetchJSON<Company[]>(`${API_CONFIG.GITHUB_RAW_URL}/ai_companies.json`);
    } catch (error) {
      console.error('Error fetching AI companies:', error);
      throw error;
    }
  },

  /**
   * Get company logo URL from a list of companies
   */
  getCompanyLogoUrl: (companies: Company[], name: string): string | null => {
    if (!name) return null;
    const company = companies.find((c) => c.company_name?.toLowerCase() === name.toLowerCase());
    if (!company?.company_url) return null;

    try {
      const { hostname } = new URL(company.company_url);
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return null;
    }
  },

  /**
   * Get company URL from a list of companies
   */
  getCompanyUrl: (companies: Company[], name: string): string | null => {
    if (!name) return null;
    const company = companies.find((c) => c.company_name?.toLowerCase() === name.toLowerCase());
    return company?.company_url || null;
  },
};

/**
 * Legacy exports for backward compatibility
 */
export async function fetchCryptoCompanies(): Promise<Company[]> {
  return companyService.fetchCryptoCompanies();
}

export async function fetchAICompanies(): Promise<Company[]> {
  return companyService.fetchAICompanies();
}

export function getCompanyLogoUrl(companies: Company[], name: string): string | null {
  return companyService.getCompanyLogoUrl(companies, name);
}

export function getCompanyUrl(companies: Company[], name: string): string | null {
  return companyService.getCompanyUrl(companies, name);
}
