# Architecture notes

## Why this structure

**SPA over MPA** — Bharat AI Academy is small enough (12 routes, 1 brand, 1 funnel) that a hash-routed SPA gives the cleanest dev experience and zero rewrite config on Cloudflare Pages. Page transitions feel instant.

**Vanilla JS over a framework** — Plus Jakarta Sans + Tailwind tokens carry the design. Adding React/Vue would triple the bundle size for no UX gain. Module pages return a `Node`; the router replaces it.

**Tailwind alongside the original CSS** — the original CSS already encodes the brand. Tailwind is available for ad-hoc utility (spacing, text colors) but the look is governed by `src/styles/main.css`.

**Edge Functions for Razorpay** — anything touching `key_secret` or directly mutating `payments` runs server-side. The browser only ever sees `key_id` (publishable) and `payment_type` (`reserve` / `full`).

## Lead-first data flow

```
public anon role can:    insert registrations, contact_submissions, incubator_applications, referral_clicks
authed student can:      read/update their own students row, read their registrations & payments & referrals
service-role can:        everything (used by Edge Functions only)
admin role can:          read/update everything in the platform
```

This is enforced via RLS. The browser cannot escalate by calling `.update()` directly — only the rows that satisfy the policies will return.

## Idempotency notes

- `students` is keyed by `phone` (server-side `select`-then-`insert` in `razorpay-verify`). A user paying twice with the same phone re-uses the same student row.
- `referrals` has `unique(registration_id)`, so a duplicate `verify` call doesn't double-count rewards.
- `payments.razorpay_order_id` is unique — prevents duplicate `initiated` rows for the same order.

## Where to extend

| Need | Where to add |
|---|---|
| New marketing page | `src/pages/<name>.js` + register in `main.js` |
| New table | `supabase/migrations/0002_*.sql` |
| New admin section | `src/pages/admin-dashboard.js` — append to `TABS` and add a `*Tab(main)` function |
| Razorpay subscription | New Edge Function alongside `razorpay-create-order`; subscribe via `subscriptions` table |
| WhatsApp automated msg | Inside `razorpay-verify`, call WhatsApp Business API with the same service role |

## Performance budget

- Initial JS: ~50KB gzipped (Vite + Supabase client + page modules dynamically loaded would be smaller — they're synchronous-imported here for simplicity)
- LCP target on 3G: < 2.5s
- The Razorpay Checkout JS (`checkout.razorpay.com`) is loaded with `defer` — adds ~80KB but only matters when the user reaches the funnel.

To trim further: convert page modules to `import()` and let the router lazy-load them.
