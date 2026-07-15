import { Router, Request, Response } from 'express';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authLimiter);

router.post('/clerk', async (req: Request, res: Response) => {
  try {
    const event = req.body;
    console.log('[Webhook] Clerk event:', event.type);

    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        break;
      case 'session.created':
        break;
      default:
        break;
    }

    res.json({ success: true, received: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;
