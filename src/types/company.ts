export interface Company {
  id?: string;
  company_name: string;
  company_url?: string;
  jobs_url?: string;
  logo_url?: string;
  description?: string;
  // Legacy properties
  name?: string;
  url?: string;
  logoUrl?: string;
}
