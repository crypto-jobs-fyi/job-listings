/**
 * Shared API configuration constants
 * Used across all API endpoints for security and CORS settings
 */

// CORS allowed origins - restrict to production domain and localhost for development
export const ALLOWED_ORIGINS = [
  'https://job-finder.org',
  'https://www.job-finder.org',
  'http://localhost:3000',
];

/**
 * Apply CORS headers to response
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 * @param {string[]} methods - Allowed HTTP methods (e.g., ['GET', 'POST', 'OPTIONS'])
 * @param {string[]} headers - Allowed headers (e.g., ['Content-Type', 'Authorization'])
 */
export function applyCorsHeaders(req, res, methods = ['GET', 'POST', 'OPTIONS'], headers = ['Content-Type']) {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', headers.join(', '));
}
