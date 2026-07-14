import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || '';

export function createDb() {
  if (!databaseUrl) {
    return null;
  }
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export const db = createDb();
export * from './schema';

export function getDb() {
  if (!db) {
    throw new Error('Database not configured. Set DATABASE_URL env.');
  }
  return db;
}
