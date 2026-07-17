import { verifyToken } from '@clerk/backend';
import { env } from '../config/env';

export async function verifySession(token: string) {
  if (!env.CLERK_SECRET_KEY) {
    throw new Error('Clerk not configured');
  }
  const claims = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
  if (!claims?.sub) {
    throw new Error('Invalid session');
  }
  return { userId: claims.sub };
}

export async function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const sessionToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.headers['x-session-token'];

  if (!sessionToken) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const { userId } = await verifySession(sessionToken);
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }
}
