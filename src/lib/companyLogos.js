// Helper utilities for resolving company URLs and favicons
export function getCompanyUrlFromList(companies = [], name) {
  if (!name) return null;
  const found = companies.find(c => c.company_name && c.company_name.toLowerCase() === name.toLowerCase());
  return found ? found.company_url : null;
}

export function getCompanyLogoUrlFromList(companies = [], name) {
  const url = getCompanyUrlFromList(companies, name);
  if (!url) return null;
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

export function getFaviconForLink(link) {
  if (!link) return null;
  try {
    const { hostname } = new URL(link);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}
