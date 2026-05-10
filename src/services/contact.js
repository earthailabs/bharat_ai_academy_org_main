import { supabase } from '../config/supabase.js';
import { normalizePhone } from '../utils/format.js';

export async function submitContact({ fullName, phone, message, interest }) {
  const phoneNorm = normalizePhone(phone);
  if (!phoneNorm) return { error: { message: 'Invalid phone number' } };
  if (!fullName || fullName.trim().length < 2) return { error: { message: 'Please enter your full name' } };

  const { data, error } = await supabase
    .from('contact_submissions')
    .insert({
      full_name: fullName.trim(),
      phone: phoneNorm,
      message: (message || '').trim() || null,
      interest: interest || 'general',
    })
    .select()
    .single();
  if (error) return { error };
  return { submission: data };
}
