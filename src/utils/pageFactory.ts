/**
 * Generate HTML template for a page entry point
 * @param pageConfig Page configuration object
 * @returns HTML template string
 */
export function generateHtmlTemplate(pageConfig: {
  path: string;
  title: string;
  description: string;
  type: 'jobs' | 'companies' | 'new-jobs';
  category: 'crypto' | 'ai';
}): string {
  const ogImage = 'https://www.job-finder.org/crypto-logo.svg';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/crypto-logo.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${pageConfig.title}</title>
    <meta name="description" content="${pageConfig.description}" />
    <meta property="og:title" content="${pageConfig.title}" />
    <meta property="og:description" content="${pageConfig.description}" />
    <meta property="og:url" content="https://www.job-finder.org${pageConfig.path}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${ogImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${pageConfig.title}" />
    <meta name="twitter:description" content="${pageConfig.description}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="https://www.job-finder.org${pageConfig.path}" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/${pageConfig.path.replace(/\.html$/, '.js')}.js"></script>
  </body>
</html>`;
}

/**
 * Get entry point filename for a page
 * @param pageConfig Page configuration
 * @returns Entry point filename (e.g., "index", "crypto-jobs")
 */
export function getEntryPointName(pageConfig: { path: string }): string {
  return (
    pageConfig.path
      .replace(/\.html$/, '')
      .replace(/\//g, '-')
      .replace(/^-/, '') || 'index'
  );
}

/**
 * Get route path from page type and category
 * @param type Page type (jobs, companies, new-jobs)
 * @param category Job category (crypto, ai)
 * @returns Route path (e.g., "/crypto-jobs.html", "/ai-companies.html")
 */
export function getRoutePath(
  type: 'jobs' | 'companies' | 'new-jobs',
  category: 'crypto' | 'ai'
): string {
  if (type === 'jobs') {
    return `/${category}-jobs.html`;
  } else if (type === 'new-jobs') {
    return `/${category}-new-jobs.html`;
  } else {
    return `/${category}-companies.html`;
  }
}
