import { Redis } from '@upstash/redis';
import { jwtVerify } from 'jose';
import { applyCorsHeaders } from '../config.js';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// JWT secret from environment variable (required)
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export default async function handler(req, res) {
  // Set CORS headers
  applyCorsHeaders(req, res, ['GET', 'POST', 'OPTIONS'], ['Content-Type', 'Authorization']);

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authentication check - require authorization header with JWT token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Extract and verify JWT token
  const token = authHeader.substring(7);
  let authenticatedEmail;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
    authenticatedEmail = payload.email;
    
    if (!authenticatedEmail || typeof authenticatedEmail !== 'string') {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  } catch (error) {
    // JWT verification failed (expired, invalid signature, etc.)
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }

  // Get email from query params (GET) or body (POST)
  const requestedEmail = req.method === 'GET' ? req.query.email : req.body?.email;

  // Validate requested email
  if (!requestedEmail || typeof requestedEmail !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const requestedEmailLower = requestedEmail.toLowerCase();

  // Authorization check - user can only access their own favorites
  // The authenticated email comes from the verified JWT, so it's trusted
  if (authenticatedEmail !== requestedEmailLower) {
    return res.status(403).json({ error: 'Forbidden: You can only access your own favorites' });
  }

  const favoritesKey = `favorites:${authenticatedEmail}`;

  try {
    // GET - Retrieve favorites from Redis
    if (req.method === 'GET') {
      const favorites = await redis.get(favoritesKey);
      return res.status(200).json({ 
        favorites: favorites || {},
      });
    }

    // POST - Save favorites to Redis
    if (req.method === 'POST') {
      const { favorites } = req.body;

      if (!favorites || typeof favorites !== 'object') {
        return res.status(400).json({ error: 'Favorites data is required' });
      }

      // Store favorites (no expiration - persist until user deletes)
      await redis.set(favoritesKey, JSON.stringify(favorites));

      return res.status(200).json({ 
        success: true,
        message: 'Favorites saved',
        count: Object.keys(favorites).length,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Favorites sync error:', error);
    return res.status(500).json({
      error: 'Failed to sync favorites',
    });
  }
}
