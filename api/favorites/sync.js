import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get email from query params (GET) or body (POST)
  const email = req.method === 'GET' ? req.query.email : req.body?.email;

  // Validate email
  if (!email || typeof email !== 'string') {
    console.error('Email validation failed:', { email, method: req.method, query: req.query, body: req.body });
    return res.status(400).json({ error: 'Email is required' });
  }

  const favoritesKey = `favorites:${email.toLowerCase()}`;

  try {
    // GET - Retrieve favorites from Redis
    if (req.method === 'GET') {
      const favorites = await redis.get(favoritesKey);
      return res.status(200).json({ 
        favorites: favorites || {},
        email: email.toLowerCase(),
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
