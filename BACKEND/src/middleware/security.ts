import helmet from 'helmet';
import cors from 'cors';
import crypto from 'crypto';
import { env } from '../config/env';

export const securityMiddleware = helmet({
  contentSecurityPolicy: env.isProd() ? undefined : false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
});

const knownFrontendURLs = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://studysnap-sigma.vercel.app',
  'https://studysnap.vercel.app',
].filter(Boolean);

const corsOrigins = [...new Set(knownFrontendURLs)];

console.log(`[cors] ${env.isProd() ? 'PRODUCTION' : 'DEV'} allowed origins:`, corsOrigins);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = corsOrigins.some((o) => {
      if (!o) return false;
      if (origin === o) return true;
      if (o.includes('localhost') && origin.includes('localhost')) return true;
      return false;
    });
    if (allowed || env.isDev()) {
      callback(null, true);
    } else {
      console.warn(`[cors] Blocked origin: ${origin}. Allowed:`, corsOrigins);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-CSRF-Token'],
});

const CSRF_SECRET = env.CLERK_SECRET_KEY
  ? crypto.createHash('sha256').update(env.CLERK_SECRET_KEY).digest('hex')
  : crypto.randomBytes(32).toString('hex');

function generateCsrfToken(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}.${random}`;
  const hmac = crypto.createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

function validateCsrfToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = `${parts[0]}.${parts[1]}`;
    const hmac = parts[2];
    const expected = crypto.createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');
    if (hmac !== expected) return false;
    const timestamp = parseInt(parts[0], 36);
    const age = Date.now() - timestamp;
    if (age > 86400000) return false;
    return true;
  } catch {
    return false;
  }
}

export function getCsrfToken(_req: any, res: any) {
  const token = generateCsrfToken();
  res.cookie('csrf-token', token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: env.isProd(),
    path: '/',
    maxAge: 86400000,
  });
  return token;
}

export const csrfProtection = (req: any, res: any, next: any) => {
  if (req.method === 'GET' || req.method === 'OPTIONS' || req.method === 'HEAD') {
    return next();
  }
  const headerToken = req.headers['x-csrf-token'];
  if (!headerToken || !validateCsrfToken(headerToken)) {
    return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
  }
  next();
};
