# Local setup — step by step

## Prerequisites
- Node 20+ and npm 10+
- A Supabase project (you already have one: `roiiaiwzfthquqrdjlpn`)
- Razorpay TEST keys (free, 5-minute signup at razorpay.com)

## 1. Install
```bash
cd site
npm install
```

## 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `VITE_SUPABASE_URL` — already pre-filled
- `VITE_SUPABASE_ANON_KEY` — already pre-filled (publishable key)
- `VITE_RAZORPAY_KEY_ID` — get from razorpay.com dashboard (TEST mode)
- `VITE_WHATSAPP_NUMBER` — your business WhatsApp number, no `+`, e.g. `919876543210`
- `VITE_WHATSAPP_GROUP_INVITE` — paste a `chat.whatsapp.com/...` invite link

## 3. Apply database schema
**Option A — CLI:**
```bash
npx supabase login
npx supabase link --project-ref roiiaiwzfthquqrdjlpn
npx supabase db push
```
**Option B — Dashboard:**
1. Open https://supabase.com/dashboard/project/roiiaiwzfthquqrdjlpn/sql
2. Paste the contents of `supabase/migrations/0001_init.sql`
3. Run.

## 4. Configure Supabase Auth
- Go to **Authentication → Providers**.
- Enable **Phone** (for student OTP login). Pick an SMS provider (Twilio is easiest for testing).
- Enable **Email** (for admin login).

## 5. Bootstrap your first admin
1. Go to **Authentication → Users → Add user** → create `you@example.com` + password.
2. Copy the user's UUID.
3. In SQL Editor:
   ```sql
   insert into public.admins (user_id, full_name, role)
   values ('<paste-uuid>', 'Founder', 'super_admin');
   ```

## 6. Set Razorpay secrets (Edge Functions)
```bash
npx supabase secrets set \
  RAZORPAY_KEY_ID=rzp_test_xxx \
  RAZORPAY_KEY_SECRET=xxx
```

## 7. Deploy Edge Functions
```bash
npx supabase functions deploy razorpay-create-order
npx supabase functions deploy razorpay-verify
```

## 8. Run locally
```bash
npm run dev    # → http://localhost:5173
```

## 9. Smoke test the funnel
1. Visit `/#/register`.
2. Fill name + phone, click Continue.
3. Choose Reserve Seat → Razorpay Checkout opens.
4. Use test card `4111 1111 1111 1111`, any CVV, any future date.
5. Confirm → you should land on `/#/payment-success`.
6. In the Supabase dashboard, check rows in `registrations`, `payments`, `students`.

## 10. Build & preview
```bash
npm run build
npm run preview
```
