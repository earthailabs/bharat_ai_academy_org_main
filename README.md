# Bharat AI Academy — Web Platform

> India's offline AI academy for Bharat youth — admission funnel, payment platform, student/admin dashboards, referral system.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite · Vanilla JS · TailwindCSS · component-based modules |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Payments | Razorpay (TEST/LIVE) |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub → Cloudflare Pages |

---

## Quick start

```bash
# 1. Install
cd site
npm install

# 2. Configure env
cp .env.example .env
# fill VITE_RAZORPAY_KEY_ID, VITE_WHATSAPP_NUMBER, etc.

# 3. Apply database schema (one-time)
#    Option A — Supabase CLI:
npx supabase link --project-ref roiiaiwzfthquqrdjlpn
npx supabase db push
#    Option B — paste supabase/migrations/0001_init.sql into the SQL Editor

# 4. Set Edge Function secrets
npx supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx

# 5. Deploy Edge Functions
npx supabase functions deploy razorpay-create-order
npx supabase functions deploy razorpay-verify

# 6. Run dev server
npm run dev
# → http://localhost:5173
```

---

## File structure

```
site/
├── index.html                      SPA shell + SEO meta + Razorpay script
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── .env.example                    Browser-safe variables (VITE_* prefixed)
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── _redirects                  Cloudflare Pages SPA fallback
│   └── _headers                    Security headers
├── src/
│   ├── main.js                     Entry — router boot, layout assembly
│   ├── styles/main.css             Design tokens (preserved from original HTML)
│   ├── config/
│   │   ├── supabase.js             Supabase client + Edge endpoints
│   │   ├── programs.js             Single source of truth for pricing
│   │   └── site.js                 Site URLs, WhatsApp, contact info
│   ├── utils/
│   │   ├── dom.js   format.js   router.js   toast.js
│   ├── services/                   Business logic — no DOM
│   │   ├── auth.js                 Supabase Auth (OTP + password)
│   │   ├── registration.js         Lead capture (name + phone)
│   │   ├── payment.js              Razorpay Checkout flow
│   │   ├── contact.js              Contact form
│   │   ├── referral.js             Referral codes + leaderboard
│   │   ├── incubator.js            Incubator applications
│   │   └── admin.js                Admin queries + CSV export
│   ├── components/
│   │   ├── nav.js   footer.js   modal.js   whatsapp-button.js
│   └── pages/
│       ├── home.js   youth.js   school.js   incubator.js   jobs.js   about.js
│       ├── contact.js                  Contact + interest cards
│       ├── register.js                 Two-step lead funnel
│       ├── payment-success.js          Confirmation + WhatsApp CTA
│       ├── payment-failure.js          Retry + WhatsApp help
│       ├── student-dashboard.js        OTP login → profile + registrations
│       ├── referral-dashboard.js       Code, link, stats, leaderboard
│       ├── admin-login.js              Email/password
│       ├── admin-dashboard.js          Overview, students, payments, etc.
│       └── not-found.js
└── supabase/
    ├── config.toml
    ├── migrations/0001_init.sql        Tables, RLS, triggers, views
    └── functions/
        ├── razorpay-create-order/      Server-side order creation
        └── razorpay-verify/            HMAC verification + finalize
```

---

## Architecture: lead-first funnel

```
HOME / Program page
   │  click "Reserve Seat" / "Apply Now"
   ▼
REGISTER page (step 1)
   ├─ ONLY: full name + phone + (optional) referral code
   │  → POST insert into `registrations` (status=pending)  [public RLS]
   ▼
REGISTER page (step 2)
   ├─ Choose: Reserve (₹5K) or Full (₹17K)
   │  → Edge: razorpay-create-order
   │     • inserts `payments` row in `initiated`
   │     • returns Razorpay order_id
   │  → Razorpay Checkout opens in browser
   │     ↓ user completes payment
   │  → Edge: razorpay-verify
   │     • HMAC-checks signature
   │     • marks payment paid
   │     • marks registration reserved/paid
   │     • creates/links a `students` row keyed by phone
   │     • if referral_code present → inserts a `referrals` row
   ▼
PAYMENT-SUCCESS page
   ├─ Order summary
   ├─ Join WhatsApp community CTA
   └─ "Complete your profile" → student dashboard

DASHBOARD (after OTP login)
   ├─ Overview, registrations, profile completion
   └─ Referral page: code, link, leaderboard
```

**Why this works for Bharat:**
- Step 1 is 30 seconds, no blockers (no email, city, school, etc.)
- Profile completion happens after seat is paid — never before
- Phone OTP is the auth method (familiar to Tier 2/3 users)
- WhatsApp CTAs at every confirmation moment

---

## Database schema (highlights)

12 tables: `programs · batches · students · admins · registrations · payments · referrals · referral_clicks · contact_submissions · incubator_applications · certificates`, plus a `referral_leaderboard` view.

**RLS strategy:**
- `programs`, `batches` — public read (active rows only)
- `registrations`, `contact_submissions`, `incubator_applications`, `referral_clicks` — public **insert** (lead capture works without auth) + admin/self read
- `students` — self-only read/update; admin can read all
- `payments` — read-only for the related student or admin; **writes only via Edge Function** (service role)
- `admins` — membership table; `is_admin(uid)` SQL function powers all admin policies

**First admin bootstrap** (after sign-up via Auth):
```sql
insert into public.admins (user_id, full_name, role)
values ('<paste-auth.users.uuid>', 'Founder', 'super_admin');
```

---

## Razorpay setup

1. Create a Razorpay account → grab **TEST** keys.
2. Frontend: put the `key_id` (rzp_test_...) into `VITE_RAZORPAY_KEY_ID` in `.env`.
3. Edge Functions need both `key_id` and `key_secret`:
   ```bash
   npx supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx
   ```
4. Test cards: `4111 1111 1111 1111`, any CVV, any future expiry.
5. Switch to **LIVE** keys only after E2E test on a real Cloudflare Pages preview.

**Server-authoritative pricing.** The browser passes `payment_type` (`reserve` / `full`) but **never** the amount. The Edge Function reads the program from the registration and looks up the price in its own table — clients can't tamper.

---

## Cloudflare Pages deploy

1. Push `site/` to a GitHub repo.
2. Cloudflare Pages → **Create project** → connect repo.
3. Build settings:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
   - **Root directory:** `site`
   - **Node version:** 20
4. Environment variables — add every `VITE_*` from `.env`.
5. Deploy.

`public/_redirects` handles SPA fallback. `public/_headers` adds security headers.

---

## WhatsApp integration

The free, Bharat-friendly approach (no API integration):
- **Floating button** — opens `wa.me/<number>` chat with your team.
- **Post-payment CTAs** — buttons to your community group invite link.
- **Contact form** — has dedicated WhatsApp + Call Now buttons.

Configure in `.env`:
```
VITE_WHATSAPP_NUMBER=919876543210
VITE_WHATSAPP_GROUP_INVITE=https://chat.whatsapp.com/your-invite
```

For automated WhatsApp messages (e.g. payment confirmations), wire up the WhatsApp Business API in `razorpay-verify` later — currently we surface CTAs the user clicks themselves.

---

## Auth flows

**Students** — phone OTP via Supabase Auth.
- Requires SMS provider configured in **Supabase → Authentication → Providers → Phone**.
- Supported: Twilio, MessageBird, Vonage. For India, recommend MSG91 via webhook OR migrate to a magic-link email flow if SMS gets expensive.

**Admin** — email/password via Supabase Auth + membership in `public.admins`.
- Sign up an admin account via the Supabase Auth UI (or programmatically), then run the bootstrap SQL.

---

## Conversion features baked in

- ✅ Two-step funnel (capture lead before payment)
- ✅ Reserve seat + Full payment options
- ✅ Referral codes auto-generated, leaderboard
- ✅ Floating WhatsApp button on every page
- ✅ Mobile-first CSS (Plus Jakarta Sans, large tap targets, breakpoints)
- ✅ Lead URL tracking — `/?ref=CODE` → captured into sessionStorage, pre-fills register form
- ✅ "Limited seats" / "Batch starting" announcement bar
- ✅ Trust signals (60+ business ideas, testimonials, full curriculum)

---

## Security checklist

- [x] All secrets server-side; only `VITE_*` in browser
- [x] Razorpay HMAC verification before marking paid
- [x] Server-authoritative pricing (browser cannot pick the amount)
- [x] RLS on all tables; payments writeable only via service role
- [x] HTML escape helper used in every dashboard render
- [x] X-Frame-Options, Referrer-Policy, X-Content-Type-Options headers
- [x] Admin route gated by `is_admin()` SQL predicate (not just a UI check)
- [ ] **TODO: rotate the Supabase DB password** (you pasted it into chat earlier)
- [ ] Add Razorpay webhook signature verification for the `payment.captured` event (defensive — current verify happens at handler time)
- [ ] Add Cloudflare Turnstile on contact form to deter bots

---

## Roadmap suggestions (post-launch)

- **WhatsApp Business API** for automated payment confirmations + batch reminders
- **Certificate generation** — PDF generator + Supabase Storage bucket (table is already there)
- **Batch management** — admin UI for opening/closing batches and seat counts
- **Coupon system** — `coupons` table joined to payments for discount codes
- **Multi-center support** — add `center_id` to `batches` and `students`; admin filter
- **SMS via MSG91** — cheaper than Twilio for Indian numbers
- **Cloudflare Turnstile** on register + contact + incubator forms
- **Razorpay subscription** for incubator-funded students who pay monthly mentorship
