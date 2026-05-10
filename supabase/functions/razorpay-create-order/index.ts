// Supabase Edge Function: razorpay-create-order
//
// Called from the browser AFTER a registration row is created.
// Creates a Razorpay order using the SECRET key (server-side only),
// inserts a `payments` row in `initiated` state, and returns
// { order_id, amount, currency } for Razorpay Checkout.
//
// Env (set with: supabase secrets set ...):
//   RAZORPAY_KEY_ID
//   RAZORPAY_KEY_SECRET
//   SUPABASE_URL                 (auto)
//   SUPABASE_SERVICE_ROLE_KEY    (auto — used to bypass RLS)
//
// Deploy:  supabase functions deploy razorpay-create-order
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Authoritative price table — never trust client-supplied amounts.
const PRICES: Record<string, { full: number; reserve: number }> = {
  youth:  { full: 17000, reserve: 5000 },
  school: { full: 4999,  reserve: 1000 },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    const { registration_id, payment_type } = await req.json();
    if (!registration_id || !payment_type) return json({ error: 'Missing fields' }, 400);
    if (!['reserve', 'full'].includes(payment_type)) return json({ error: 'Invalid payment_type' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const keyId       = Deno.env.get('RAZORPAY_KEY_ID')!;
    const keySecret   = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    if (!keyId || !keySecret) return json({ error: 'Razorpay keys not configured' }, 500);

    const sb = createClient(supabaseUrl, serviceRole);

    // 1. Look up registration → derive program → derive amount (server-side authoritative)
    const { data: reg, error: regErr } = await sb
      .from('registrations').select('*').eq('id', registration_id).maybeSingle();
    if (regErr || !reg) return json({ error: 'Registration not found' }, 404);

    const prices = PRICES[reg.program_id];
    if (!prices) return json({ error: 'Program is not payable' }, 400);
    const amountInr = payment_type === 'reserve' ? prices.reserve : prices.full;
    const amountPaise = amountInr * 100;

    // 2. Create Razorpay order
    const auth = btoa(`${keyId}:${keySecret}`);
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `reg_${registration_id.slice(0, 16)}`,
        notes: { registration_id, program_id: reg.program_id, payment_type },
      }),
    });
    if (!rzpRes.ok) {
      const t = await rzpRes.text();
      return json({ error: 'Razorpay order creation failed', detail: t }, 502);
    }
    const order = await rzpRes.json();

    // 3. Persist a payments row in 'initiated' state
    const { error: payErr } = await sb.from('payments').insert({
      registration_id,
      amount: amountInr,
      currency: 'INR',
      payment_type,
      status: 'initiated',
      razorpay_order_id: order.id,
      metadata: { receipt: order.receipt },
    });
    if (payErr) return json({ error: payErr.message }, 500);

    return json({ order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
