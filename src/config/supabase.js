import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Auth + DB calls will fail.');
}

export const supabase = createClient(url || 'https://invalid.supabase.co', anonKey || 'anon', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Edge function endpoints (deployed via supabase/functions)
export const EDGE = {
  createOrder: `${url}/functions/v1/razorpay-create-order`,
  verifyPayment: `${url}/functions/v1/razorpay-verify`,
};
