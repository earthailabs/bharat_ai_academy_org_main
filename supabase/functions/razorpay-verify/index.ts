// Supabase Edge Function: razorpay-verify
//
// Validates the HMAC signature returned by Razorpay Checkout and finalizes
// the payment + registration server-side.
//
// Steps:
//   1. Verify HMAC SHA-256 of `${order_id}|${payment_id}` using key_secret.
//   2. Mark `payments` row paid; mark `registrations.status` = 'reserved' or 'paid'.
//   3. Auto-create/link a `students` row for the buyer.
//   4. If a referral code was used, create a `referrals` row.
//
// Deploy:  supabase functions deploy razorpay-verify
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Default referral reward per paid signup (admin-configurable later if needed)
const REFERRAL_REWARD_INR: Record<string, number> = {
  youth: 1000,
  school: 250,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json();
    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature, registration_id,
    } = body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !registration_id) {
      return json({ error: 'Missing fields' }, 400);
    }

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET')!;
    if (!keySecret) return json({ error: 'Server not configured' }, 500);

    // 1. Verify HMAC SHA-256
    const expected = await hmacSha256Hex(keySecret, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (timingSafeEqual(expected, razorpay_signature) === false) {
      return json({ error: 'Invalid signature' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, serviceRole);

    // 2. Update payment row
    const { data: pay, error: payErr } = await sb
      .from('payments')
      .update({
        status: 'paid',
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();
    if (payErr || !pay) return json({ error: payErr?.message || 'Payment row missing' }, 500);

    // 3. Update registration status
    const newStatus = pay.payment_type === 'full' ? 'paid' : 'reserved';
    const { data: reg, error: regErr } = await sb
      .from('registrations')
      .update({ status: newStatus })
      .eq('id', registration_id)
      .select()
      .single();
    if (regErr || !reg) return json({ error: regErr?.message || 'Registration missing' }, 500);

    // 4. Link or create a student row (idempotent: keyed by phone)
    let studentId = reg.student_id;
    if (!studentId) {
      const { data: existing } = await sb
        .from('students').select('id').eq('phone', reg.phone).maybeSingle();
      if (existing) {
        studentId = existing.id;
      } else {
        const { data: created, error: cErr } = await sb
          .from('students')
          .insert({
            full_name: reg.full_name,
            phone: reg.phone,
            email: reg.email,
            referrer_student_id: reg.referrer_student_id,
          })
          .select('id')
          .single();
        if (cErr) return json({ error: cErr.message }, 500);
        studentId = created.id;
      }
      await sb.from('registrations').update({ student_id: studentId }).eq('id', reg.id);
    }

    // 5. Record referral, if any
    if (reg.referrer_student_id) {
      const reward = REFERRAL_REWARD_INR[reg.program_id] || 0;
      await sb.from('referrals').upsert({
        registration_id: reg.id,
        referrer_student_id: reg.referrer_student_id,
        referred_name: reg.full_name,
        referred_phone: reg.phone,
        amount_earned: reward,
        status: 'paid',
      }, { onConflict: 'registration_id' });
    }

    return json({ ok: true, registration_id: reg.id, student_id: studentId, status: newStatus });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
