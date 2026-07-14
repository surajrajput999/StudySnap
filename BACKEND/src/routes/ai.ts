import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import {
  chatCompletion,
  summarizeNote,
  generateMcqs,
  generateFlashcards,
  translateText,
} from '../services/ai';

const router = Router();

router.use(authMiddleware);
router.use(aiLimiter);

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array required' });
    }
    const reply = await chatCompletion(messages);
    res.json({ success: true, message: { role: 'assistant', content: reply } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });
    const summary = await summarizeNote(title || 'Untitled', content);
    res.json({ success: true, summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/mcqs', async (req: Request, res: Response) => {
  try {
    const { title, content, type } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });
    if (type === 'flashcard') {
      const flashcards = await generateFlashcards(title || 'Untitled', content);
      return res.json({ success: true, flashcards });
    }
    const mcqs = await generateMcqs(title || 'Untitled', content);
    res.json({ success: true, mcqs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/translate', async (req: Request, res: Response) => {
  try {
    const { content, targetLanguage } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });
    const lang = targetLanguage === 'hindi' ? 'hindi' : 'english';
    const translatedText = await translateText(content, lang);
    res.json({ success: true, translatedText });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
