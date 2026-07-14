import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { createOrder, verifyPayment } from '../services/payments';

const router = Router();

router.use(authMiddleware);

router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency } = req.body;
    if (!amount) return res.status(400).json({ success: false, error: 'Amount required' });
    const order = await createOrder(amount, currency || 'INR');
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, error: 'Missing payment details' });
    }
    const result = await verifyPayment(orderId, paymentId, signature);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
