import { Redis } from '@upstash/redis';
import { applyCorsHeaders } from '../config.js';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  // Set CORS headers
  applyCorsHeaders(req, res, ['POST', 'OPTIONS'], ['Content-Type']);

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;

  // Validate input
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  if (typeof code !== 'string' || code.length !== 4 || !/^\d{4}$/.test(code)) {
    return res.status(400).json({ error: 'Code must be 4 digits' });
  }

  try {
    // Retrieve code from Redis
    const codeKey = `code:${email.toLowerCase()}`;
    const storedCode = await redis.get(codeKey);

    // Development logging (no code exposure)
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`DEV: Verifying code for ${email}`);
    }

    if (!storedCode) {
      return res.status(400).json({ error: 'Code expired or invalid. Please request a new one.' });
    }

    // Ensure both are strings and trim
    const storedCodeStr = String(storedCode).trim();
    const inputCodeStr = String(code).trim();

    if (storedCodeStr !== inputCodeStr) {
      return res.status(400).json({ error: 'Invalid code. Please try again.' });
    }

    // Delete code after successful verification
    await redis.del(codeKey);

    // Also clear rate limit for this email on successful login
    const rateLimitKey = `ratelimit:${email.toLowerCase()}`;
    await redis.del(rateLimitKey);

    return res.status(200).json({ success: true, email });
  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({ error: 'Failed to verify code. Please try again.' });
  }
}
