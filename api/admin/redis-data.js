import { Redis } from '@upstash/redis';
import { applyCorsHeaders } from '../config.js';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Set CORS headers
  applyCorsHeaders(req, res, ['GET', 'OPTIONS'], ['Content-Type', 'Authorization']);

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Admin authentication check
  const authToken = req.headers.authorization?.replace('Bearer ', '');
  if (!authToken || authToken !== process.env.ADMIN_AUTH_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    // Get all keys
    if (req.method === 'GET') {
      const keys = await redis.keys('*');
      
      if (!keys || keys.length === 0) {
        return res.status(200).json({ keys: [] });
      }

      // Get values and TTLs for all keys
      const keyData = await Promise.all(
        keys.map(async (key) => {
          try {
            const [value, ttl] = await Promise.all([
              redis.get(key),
              redis.ttl(key),
            ]);

            return {
              key,
              value,
              ttl,
            };
          } catch (error) {
            console.error(`Error fetching key ${key}:`, error);
            return {
              key,
              value: 'Error fetching value',
              ttl: -2,
            };
          }
        })
      );

      return res.status(200).json({ 
        keys: keyData.sort((a, b) => a.key.localeCompare(b.key)),
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Redis admin error:', error);
    return res.status(500).json({ 
      error: 'Internal server error'
    });
  }
}
