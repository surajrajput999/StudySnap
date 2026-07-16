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

function logAIRequest(endpoint: string, userId: string | undefined, body: any) {
  console.log(`[ai] 🧠 /${endpoint} userId=${userId || 'anonymous'} body=`, {
    ...body,
    content: body?.content?.substring(0, 80) + '...',
    messages: body?.messages?.length || 0,
  });
}

function logAIError(endpoint: string, userId: string | undefined, error: any) {
  console.error(`[ai] ❌ /${endpoint} userId=${userId || 'anonymous'} error=`, {
    message: error?.message,
    stack: error?.stack?.substring(0, 200),
    status: error?.status || 500,
  });
}

router.post('/chat', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, error: 'Messages array required' });
    }
    logAIRequest('chat', req.userId, req.body);
    const reply = await chatCompletion(messages);
    const duration = Date.now() - start;
    console.log(`[ai] ✓ /chat ${duration}ms — ${reply.substring(0, 60)}...`);
    res.json({ success: true, message: { role: 'assistant', content: reply }, _duration: duration });
  } catch (error: any) {
    logAIError('chat', req.userId, error);
    res.status(error?.status || 500).json({
      success: false,
      error: error?.message || 'AI chat failed',
      _type: error?.code || 'INTERNAL_ERROR',
    });
  }
});

router.post('/summarize', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const { title, content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });
    logAIRequest('summarize', req.userId, req.body);
    const summary = await summarizeNote(title || 'Untitled', content);
    const duration = Date.now() - start;
    console.log(`[ai] ✓ /summarize ${duration}ms`);
    res.json({ success: true, summary, _duration: duration });
  } catch (error: any) {
    logAIError('summarize', req.userId, error);
    res.status(500).json({ success: false, error: error?.message || 'Summarization failed' });
  }
});

router.post('/mcqs', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const { title, content, type } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });
    logAIRequest('mcqs', req.userId, req.body);
    if (type === 'flashcard') {
      const flashcards = await generateFlashcards(title || 'Untitled', content);
      const duration = Date.now() - start;
      console.log(`[ai] ✓ /mcqs?type=flashcard ${duration}ms — ${flashcards.length} cards`);
      return res.json({ success: true, flashcards, _duration: duration });
    }
    const mcqs = await generateMcqs(title || 'Untitled', content);
    const duration = Date.now() - start;
    console.log(`[ai] ✓ /mcqs ${duration}ms — ${mcqs.length} questions`);
    res.json({ success: true, mcqs, _duration: duration });
  } catch (error: any) {
    logAIError('mcqs', req.userId, error);
    res.status(500).json({ success: false, error: error?.message || 'MCQ generation failed' });
  }
});

router.post('/translate', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    const { content, targetLanguage } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Content required' });
    logAIRequest('translate', req.userId, req.body);
    const lang = targetLanguage === 'hindi' ? 'hindi' : 'english';
    const translatedText = await translateText(content, lang);
    const duration = Date.now() - start;
    console.log(`[ai] ✓ /translate → ${lang} ${duration}ms`);
    res.json({ success: true, translatedText, _duration: duration });
  } catch (error: any) {
    logAIError('translate', req.userId, error);
    res.status(500).json({ success: false, error: error?.message || 'Translation failed' });
  }
});

export default router;
