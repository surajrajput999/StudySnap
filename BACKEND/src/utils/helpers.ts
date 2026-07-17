export function parseTags(tags: string | string[] | undefined): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  return tags.split(',').map(t => t.trim()).filter(Boolean);
}

export function computeNextRevision(rating: 'easy' | 'medium' | 'hard'): Date {
  const now = new Date();
  const days = rating === 'easy' ? 7 : rating === 'medium' ? 3 : 1;
  now.setDate(now.getDate() + days);
  return now;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function sanitizeContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/on\w+\s*=\s*\S+/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
