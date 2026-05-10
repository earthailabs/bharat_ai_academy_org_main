import { supabase } from '../config/supabase.js';
import { SITE } from '../config/site.js';

export function buildReferralLink(code) {
  return `${SITE.url}/?ref=${encodeURIComponent(code)}`;
}

export async function getReferralStats(studentId) {
  const { data: student } = await supabase
    .from('students')
    .select('referral_code')
    .eq('id', studentId)
    .maybeSingle();
  if (!student) return { code: null, total: 0, paid: 0, earnings: 0, list: [] };

  const { data: refs } = await supabase
    .from('referrals')
    .select('id, status, amount_earned, created_at, referred_name')
    .eq('referrer_student_id', studentId)
    .order('created_at', { ascending: false });

  const list = refs || [];
  const total = list.length;
  const paid = list.filter((r) => r.status === 'paid').length;
  const earnings = list.reduce((s, r) => s + (r.amount_earned || 0), 0);

  return { code: student.referral_code, total, paid, earnings, list };
}

export async function trackReferralClick(code) {
  if (!code) return;
  // Fire-and-forget — never block UX.
  await supabase.from('referral_clicks').insert({
    referral_code: code.trim().toUpperCase(),
    user_agent: navigator.userAgent,
    landing_path: window.location.pathname + window.location.hash,
  });
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('referral_leaderboard')
    .select('*')
    .order('paid_count', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}
