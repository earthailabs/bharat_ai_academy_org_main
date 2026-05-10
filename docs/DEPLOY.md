# Deploy to Cloudflare Pages

## Prerequisites
- GitHub repo containing this `site/` directory
- Cloudflare account (free tier is enough)
- Supabase + Razorpay set up per `SETUP.md`

## 1. Push to GitHub
```bash
git init
git add site/
git commit -m "Initial Bharat AI Academy platform"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## 2. Connect Cloudflare Pages
1. https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Pick your repo.
3. Build settings:
   | Field | Value |
   |---|---|
   | Project name | `bharat-ai-academy` |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `site` |
   | Node version | `20` |

## 3. Environment variables
In **Settings → Environment variables**, add (Production + Preview):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | https://roiiaiwzfthquqrdjlpn.supabase.co |
| `VITE_SUPABASE_ANON_KEY` | sb_publishable_DbtHzCEnWPsuleH0DkFcEg_FTE_M1So |
| `VITE_RAZORPAY_KEY_ID` | rzp_live_... (or rzp_test_... for preview) |
| `VITE_WHATSAPP_NUMBER` | 919876543210 |
| `VITE_WHATSAPP_GROUP_INVITE` | https://chat.whatsapp.com/... |
| `VITE_CONTACT_PHONE` | +91 98765 43210 |
| `VITE_CONTACT_EMAIL` | hello@bharatai.academy |
| `VITE_SITE_URL` | https://bharatai.academy |

## 4. Custom domain
- **Settings → Custom domains → Set up**
- Add `bharatai.academy`. Cloudflare will guide you through nameservers.

## 5. Update Supabase auth redirect URLs
In Supabase → **Authentication → URL Configuration**:
- Site URL: `https://bharatai.academy`
- Redirect URLs: add both `https://bharatai.academy/**` and `*.pages.dev/**`

## 6. CORS for Edge Functions
The Edge Functions already send `Access-Control-Allow-Origin: *`. To tighten:
```ts
'Access-Control-Allow-Origin': 'https://bharatai.academy',
```

## 7. Razorpay LIVE keys (production cutover)
1. Complete KYC on razorpay.com.
2. Replace TEST → LIVE keys:
   - Cloudflare: update `VITE_RAZORPAY_KEY_ID` → `rzp_live_...`
   - Supabase: `npx supabase secrets set RAZORPAY_KEY_ID=rzp_live_... RAZORPAY_KEY_SECRET=...`
3. Redeploy edge functions: `npx supabase functions deploy razorpay-create-order razorpay-verify`.

## 8. Verify
- Visit your domain → run a real test booking with a small amount (e.g. ₹1000 reserve).
- Check Razorpay dashboard for the captured payment.
- Check Supabase tables.
- Refund the test from the Razorpay dashboard.
