import { supabase } from '../config/supabase.js';
import { normalizePhone } from '../utils/format.js';

/**
 * Lead-first registration. Captures the minimum (name + phone + optional referral)
 * and returns a registration row that the Razorpay step then attaches a payment to.
 *
 * Returns: { registration, error }
 */
export async function createRegistration({ fullName, phone, programId, referralCode }) {
  const phoneNorm = normalizePhone(phone);
  if (!phoneNorm) return { error: { message: 'Invalid phone number' } };
  if (!fullName || fullName.trim().length < 2) return { error: { message: 'Please enter your full name' } };
  if (!programId) return { error: { message: 'Please select a program' } };

  // Resolve referrer (if code valid) — fail-soft: bad code shouldn't block.
  let referrerId = null;
  if (referralCode) {
    const { data: ref } = await supabase
      .from('students')
      .select('id')
      .eq('referral_code', referralCode.trim().toUpperCase())
      .maybeSingle();
    referrerId = ref?.id || null;
  }

  const { data, error } = await supabase
    .from('registrations')
    .insert({
      full_name: fullName.trim(),
      phone: phoneNorm,
      program_id: programId,
      referral_code_used: referralCode ? referralCode.trim().toUpperCase() : null,
      referrer_student_id: referrerId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { error };
  return { registration: data };
}

export async function getRegistration(id) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, payments(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) return { error };
  return { registration: data };
}
