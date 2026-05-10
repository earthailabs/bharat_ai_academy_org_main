import { supabase } from '../config/supabase.js';

let currentUser = null;
const listeners = new Set();

export async function initAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  supabase.auth.onAuthStateChange((_evt, session) => {
    currentUser = session?.user || null;
    listeners.forEach((cb) => cb(currentUser));
  });
}

export function getUser() {
  return currentUser;
}

export function onAuthChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export async function signInWithOtp(phone) {
  // Send OTP via SMS (requires Supabase phone auth provider configured).
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyOtp(phone, token) {
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}

export async function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function isAdmin() {
  const u = getUser();
  if (!u) return false;
  const { data, error } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', u.id)
    .maybeSingle();
  return !error && !!data;
}

export async function getStudentProfile() {
  const u = getUser();
  if (!u) return null;
  const { data } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', u.id)
    .maybeSingle();
  return data;
}
