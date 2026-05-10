import { supabase } from '../config/supabase.js';

// All admin queries rely on RLS policies allowing access only to rows in `admins`.
// Treat the anon key as untrusted — server enforces.

export async function adminListStudents({ search = '', limit = 100 } = {}) {
  let q = supabase
    .from('students')
    .select('*, registrations(*, payments(*))')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (search) q = q.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  return q;
}

export async function adminListRegistrations({ status, programId, limit = 200 } = {}) {
  let q = supabase
    .from('registrations')
    .select('*, payments(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (status) q = q.eq('status', status);
  if (programId) q = q.eq('program_id', programId);
  return q;
}

export async function adminListPayments({ limit = 200 } = {}) {
  return supabase
    .from('payments')
    .select('*, registrations(full_name, phone, program_id)')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function adminListContacts({ limit = 200 } = {}) {
  return supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function adminListIncubatorApps({ limit = 200 } = {}) {
  return supabase
    .from('incubator_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function adminUpdateIncubatorStatus(id, status, notes) {
  return supabase
    .from('incubator_applications')
    .update({ status, admin_notes: notes, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

export async function adminAnalytics() {
  // Best-effort counts. Falls back to 0 on permission errors.
  const counts = {};
  const tables = [
    ['registrations', 'total_registrations'],
    ['students', 'total_students'],
    ['contact_submissions', 'total_contacts'],
    ['incubator_applications', 'total_incubator'],
  ];
  await Promise.all(
    tables.map(async ([t, k]) => {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
      counts[k] = count || 0;
    }),
  );
  const { data: rev } = await supabase
    .from('payments')
    .select('amount, status')
    .eq('status', 'paid');
  counts.total_revenue = (rev || []).reduce((s, r) => s + (r.amount || 0), 0);
  counts.paid_count = (rev || []).length;
  return counts;
}

export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const cols = Object.keys(rows[0]);
  const escape = (v) => {
    if (v == null) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? '"' + s.replace(/"/g, '""') + '"'
      : s;
  };
  const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => escape(r[c])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
