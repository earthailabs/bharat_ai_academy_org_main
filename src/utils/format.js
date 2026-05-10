export function inr(amount) {
  if (amount == null) return '—';
  return '₹' + new Intl.NumberFormat('en-IN').format(amount);
}

export function formatDate(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Indian phone: accepts +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX (10-digit starting 6-9)
export function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]/.test(digits)) return '+91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  if (digits.length === 13 && digits.startsWith('91')) return '+' + digits.slice(0, 12);
  return null;
}

export function isValidPhone(input) {
  return normalizePhone(input) !== null;
}

export function isValidEmail(input) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input || '').trim());
}
