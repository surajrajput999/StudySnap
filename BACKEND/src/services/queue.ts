import { Queue, Worker } from 'bullmq';
import { env } from '../config/env';

const connection = env.UPSTASH_REDIS_URL
  ? { url: env.UPSTASH_REDIS_URL, token: env.UPSTASH_REDIS_TOKEN }
  : undefined;

export const emailQueue = connection
  ? new Queue('email', { connection } as any)
  : null;

export const revisionQueue = connection
  ? new Queue('revision', { connection } as any)
  : null;

export async function addEmailJob(data: { to: string; subject: string; html: string }) {
  if (!emailQueue) {
    console.log('[Mock Queue] Email job:', data.subject);
    return { mock: true };
  }
  return emailQueue.add('send-email', data);
}

export async function addRevisionJob(data: { userId: string; noteId: string; scheduledAt: string }) {
  if (!revisionQueue) {
    console.log('[Mock Queue] Revision job for note:', data.noteId);
    return { mock: true };
  }
  return revisionQueue.add('schedule-revision', data, {
    delay: new Date(data.scheduledAt).getTime() - Date.now(),
  });
}
