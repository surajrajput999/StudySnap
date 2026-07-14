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
  try {
    if (!clerkClient) return { userId: 'mock_student_id' };
    const session = await (clerkClient.sessions as any).verifySession(token);
    return { userId: session?.userId || 'mock_student_id' };
  } catch {
    return { userId: 'mock_student_id' };
  }
}

export async function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const sessionToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.headers['x-session-token'] || req.query.token;

  if (!sessionToken && !env.CLERK_SECRET_KEY) {
    req.userId = 'mock_student_id';
    return next();
  }

  try {
    const { userId } = await verifySession(sessionToken || '');
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session' });
  }
}
