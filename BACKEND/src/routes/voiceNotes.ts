import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { generateId } from '../utils/helpers';

const router = Router();
let mockVoiceNotes: any[] = [];

router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const notes = mockVoiceNotes.filter(vn => vn.userId === userId);
  res.json({ success: true, voiceNotes: notes });
});

router.post('/', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id, noteId, audioUrl, duration, transcript } = req.body;

  if (!noteId || !audioUrl) {
    return res.status(400).json({ success: false, error: 'noteId and audioUrl required' });
  }

  const newVoiceNote = {
    id: id || generateId(),
    userId,
    noteId,
    audioUrl,
    duration: duration || 0,
    transcript: transcript || null,
    createdAt: new Date().toISOString(),
  };

  mockVoiceNotes.push(newVoiceNote);
  res.json({ success: true, voiceNote: newVoiceNote });
});

router.delete('/', (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const id = req.query.id as string;

  if (!id) return res.status(400).json({ success: false, error: 'ID required' });

  mockVoiceNotes = mockVoiceNotes.filter(vn => !(vn.id === id && vn.userId === userId));
  res.json({ success: true });
});

export default router;
