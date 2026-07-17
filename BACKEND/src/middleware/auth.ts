import { createClerkClient } from '@clerk/backend';
import { env } from '../config/env';

const clerkClient = env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
  : null;

export function getClerkClient() {
  if (!clerkClient) {
    throw new Error('Clerk not configured. Set CLERK_SECRET_KEY env.');
  }
  return clerkClient;
}

export async function verifySession(token: string) {
  if (!clerkClient) {
    throw new Error('Clerk not configured');
  }
  const claims = await clerkClient.verifyToken(token);
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
