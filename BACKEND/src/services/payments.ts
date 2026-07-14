import Razorpay from 'razorpay';
import { env } from '../config/env';

let razorpay: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

export function getRazorpay() {
  return razorpay;
}

export async function createOrder(amount: number, currency = 'INR') {
  if (!razorpay) {
    return { id: 'mock_order', amount, currency, mock: true };
  }
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt: `receipt_${Date.now()}`,
  });
  return order;
}

export async function verifyPayment(orderId: string, paymentId: string, signature: string) {
  if (!razorpay) {
    return { success: true, mock: true };
  }
  const expectedSign = Razorpay.validateWebhookSignature(
    orderId + '|' + paymentId,
    signature,
    env.RAZORPAY_KEY_SECRET
  );
  return { success: expectedSign };
}
