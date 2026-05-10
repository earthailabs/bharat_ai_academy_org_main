import { supabase } from '../config/supabase.js';
import { normalizePhone } from '../utils/format.js';

export async function submitIncubatorApplication(payload) {
  const {
    fullName, phone, city,
    startupIdea, whyThisBusiness, currentExperience,
    fundingRequirement, skills, pitchSummary,
  } = payload;

  const phoneNorm = normalizePhone(phone);
  if (!phoneNorm) return { error: { message: 'Invalid phone number' } };
  if (!startupIdea || startupIdea.length < 20) return { error: { message: 'Please describe your startup idea (at least 20 characters)' } };

  const { data, error } = await supabase
    .from('incubator_applications')
    .insert({
      full_name: fullName.trim(),
      phone: phoneNorm,
      city: (city || '').trim(),
      startup_idea: startupIdea.trim(),
      why_this_business: (whyThisBusiness || '').trim(),
      current_experience: (currentExperience || '').trim(),
      funding_requirement: (fundingRequirement || '').trim(),
      skills: (skills || '').trim(),
      pitch_summary: (pitchSummary || '').trim(),
      status: 'pending',
    })
    .select()
    .single();
  if (error) return { error };
  return { application: data };
}
