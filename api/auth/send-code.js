import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers - restrict to allowed origins only
  const ALLOWED_ORIGINS = ['https://job-finder.org', 'https://www.job-finder.org', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate email
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Rate limiting check (max 3 codes per 10 minutes)
    const rateLimitKey = `ratelimit:${email.toLowerCase()}`;
    const attempts = await redis.incr(rateLimitKey);
    
    if (attempts === 1) {
      await redis.expire(rateLimitKey, 600); // 10 minutes
    }
    
    if (attempts > 3) {
      const ttl = await redis.ttl(rateLimitKey);
      const minutesRemaining = Math.ceil(ttl / 60);
      return res.status(429).json({ 
        error: `Too many requests. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}.` 
      });
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Store in Redis with 10-minute expiration
    const codeKey = `code:${email.toLowerCase()}`;
    await redis.setex(codeKey, 600, code); // 600 seconds = 10 minutes

    // Send email
    await resend.emails.send({
      from: 'Job Finder <noreply@updates.job-finder.org>',
      to: email,
      subject: 'Your Job Finder verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your verification code</h2>
          <p style="font-size: 16px; color: #666;">Use the code below to log in to Job Finder:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #999;">This code will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #999;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    // Development only - log code for testing
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`DEV: Code sent to ${email}: ${code}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Send code error:', error);
    return res.status(500).json({ error: 'Failed to send verification code. Please try again.' });
  }
}
