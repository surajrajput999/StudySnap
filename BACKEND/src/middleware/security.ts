import helmet from 'helmet';
import cors from 'cors';
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

console.log(`[cors] ${env.isProd() ? '🔒 PRODUCTION' : '🔧 DEV'} allowed origins:`, corsOrigins);

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
      console.warn(`[cors] ❌ Blocked origin: ${origin}. Allowed:`, corsOrigins);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
});

export const csrfProtection = (_req: any, res: any, next: any) => {
  const token = _req.headers['x-csrf-token'];
  if (_req.method === 'GET' || _req.method === 'OPTIONS' || _req.method === 'HEAD') {
    return next();
  }
  if (!token) {
    return res.status(403).json({ success: false, error: 'CSRF token required' });
  }
  next();
};
