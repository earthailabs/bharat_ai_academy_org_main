import { EDGE, supabase } from '../config/supabase.js';
import { SITE } from '../config/site.js';
import { getProgram } from '../config/programs.js';

/**
 * Two-step Razorpay flow:
 *  1. Edge function `razorpay-create-order` creates an order server-side
 *     using the secret key, returns { order_id, amount, currency }.
 *  2. We open Razorpay Checkout in the browser. After success, the `handler`
 *     callback receives the signature; we send it to `razorpay-verify` to
 *     validate HMAC and mark the payment paid (Edge has SUPABASE_SERVICE_ROLE_KEY).
 */

export async function startPayment({ registration, paymentType }) {
  const program = getProgram(registration.program_id);
  if (!program) throw new Error('Unknown program');

  const amount = paymentType === 'reserve' ? program.reservePrice : program.fullPrice;
  if (!amount || amount <= 0) throw new Error('No price configured for this program');

  // 1. Create Razorpay order via Edge Function
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

  const orderRes = await fetch(EDGE.createOrder, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      registration_id: registration.id,
      amount_inr: amount,
      payment_type: paymentType, // 'reserve' | 'full'
    }),
  });
  if (!orderRes.ok) {
    const text = await orderRes.text();
    throw new Error(`Order creation failed: ${text}`);
  }
  const order = await orderRes.json();

  // 2. Open Razorpay Checkout
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: SITE.razorpayKeyId,
      order_id: order.order_id,
      amount: order.amount,           // in paise
      currency: order.currency || 'INR',
      name: SITE.name,
      description: `${program.name} — ${paymentType === 'reserve' ? 'Reserve Seat' : 'Full Payment'}`,
      image: '/favicon.svg',
      prefill: {
        name: registration.full_name,
        contact: registration.phone,
      },
      notes: {
        registration_id: registration.id,
        program_id: program.id,
        payment_type: paymentType,
      },
      theme: { color: '#111827' },
      handler: async (response) => {
        try {
          const verifyRes = await fetch(EDGE.verifyPayment, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registration_id: registration.id,
            }),
          });
          if (!verifyRes.ok) {
            const t = await verifyRes.text();
            return reject(new Error(`Verify failed: ${t}`));
          }
          const result = await verifyRes.json();
          resolve(result);
        } catch (e) { reject(e); }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });
    rzp.on('payment.failed', (resp) => reject(new Error(resp.error?.description || 'Payment failed')));
    rzp.open();
  });
}
