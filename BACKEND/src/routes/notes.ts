import { Router, Request, Response } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import { getDb, notes } from '../db';
import { authMiddleware } from '../middleware/auth';
import { parseTags, generateId } from '../utils/helpers';
import { cacheGet, cacheSet, cacheDel, invalidateUserCache } from '../services/cache';

const router = Router();

const DEFAULT_CATEGORIES = [
  { id: 'cat-physics', name: 'Physics', color: '#3B82F6' },
  { id: 'cat-chemistry', name: 'Chemistry', color: '#10B981' },
  { id: 'cat-maths', name: 'Maths', color: '#F59E0B' },
  { id: 'cat-biology', name: 'Biology', color: '#EC4899' },
  { id: 'cat-computer', name: 'Computer', color: '#8B5CF6' },
];

let mockNotes: any[] = [];

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const cacheKey = `${userId}:notes`;

    const cached = await cacheGet<any[]>(cacheKey);
    if (cached) {
      return res.json({ success: true, notes: cached });
    }

    if (!getDb()) {
      const filtered = mockNotes.filter(n => n.userId === userId);
      return res.json({ success: true, notes: filtered });
    }

    const dbNotes = await getDb()
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.isArchived, false)))
      .orderBy(desc(notes.isPinned), desc(notes.updatedAt));

    await cacheSet(cacheKey, dbNotes, 60);
    res.json({ success: true, notes: dbNotes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id, title, content, tags, isPinned, isFavorite, pinLock, categoryId, folderId } = req.body;

    if (!title || content === undefined) {
      return res.status(400).json({ success: false, error: 'Title and content required' });
    }

    const noteData = {
      title,
      content,
      tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      isPinned: isPinned ?? false,
      isFavorite: isFavorite ?? false,
      pinLock: pinLock || null,
      categoryId: categoryId || null,
      folderId: folderId || null,
      updatedAt: new Date(),
    };

    if (!getDb()) {
      const existingIdx = mockNotes.findIndex(n => n.id === id && n.userId === userId);
      let result;
      if (existingIdx !== -1) {
        result = { ...mockNotes[existingIdx], ...noteData, updatedAt: new Date().toISOString() };
        mockNotes[existingIdx] = result;
      } else {
        result = { id: id || generateId(), userId, ...noteData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        mockNotes.push(result);
      }
      await invalidateUserCache(userId);
      return res.json({ success: true, note: result });
    }

    let result;
    if (id) {
      const existing = await getDb().select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
      if (existing.length > 0) {
        const updated = await getDb().update(notes).set(noteData).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning();
        result = updated[0];
      } else {
        const inserted = await getDb().insert(notes).values({ id, userId, ...noteData }).returning();
        result = inserted[0];
      }
    } else {
      const inserted = await getDb().insert(notes).values({ userId, ...noteData }).returning();
      result = inserted[0];
    }

    await invalidateUserCache(userId);
    res.json({ success: true, note: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const id = req.query.id as string;

    if (!id) return res.status(400).json({ success: false, error: 'ID required' });

    if (!getDb()) {
      mockNotes = mockNotes.filter(n => !(n.id === id && n.userId === userId));
      await invalidateUserCache(userId);
      return res.json({ success: true });
    }

    await getDb().delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
    await invalidateUserCache(userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/categories', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!getDb()) {
      return res.json({ success: true, categories: DEFAULT_CATEGORIES });
    }

    const dbCategories = await getDb().select().from(require('../db').categories).where(eq(require('../db').categories.userId, userId));
    res.json({ success: true, categories: [...DEFAULT_CATEGORIES, ...dbCategories] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
