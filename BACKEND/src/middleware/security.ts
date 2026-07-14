import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env';

export const securityMiddleware = helmet({
  contentSecurityPolicy: env.isProd() ? undefined : false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
});

export const corsMiddleware = cors({
  origin: [env.FRONTEND_URL, 'http://localhost:3000'].filter(Boolean),
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
