import { go } from '../utils/router.js';
import { PROGRAMS, getProgram } from '../config/programs.js';
import { createRegistration } from '../services/registration.js';
import { toast } from '../utils/toast.js';
import { SITE, whatsappLink, telLink } from '../config/site.js';

/**
 * LEAD-ONLY MODE (payment temporarily disabled).
 *
 * Flow: ?program=youth|school → simple form (Name + Phone + optional Referral)
 *   → save lead in Supabase → success state with WhatsApp + Call CTAs.
 *
 * Payment infrastructure (services/payment.js, supabase/functions/razorpay-*,
 * Razorpay script in index.html, schema columns) is intact. To re-enable, restore
 * the previous two-step flow that imports `startPayment` from services/payment.js.
 */
export function renderRegister(params = {}) {
  const programId = params.program && PROGRAMS[params.program] ? params.program : 'youth';
  const program = getProgram(programId);
  const referralFromUrl = sessionStorage.getItem('referral_code') || '';

  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = `Apply — ${program.name}`;
  view.innerHTML = `
    <div class="phero">
      <div class="phi" style="text-align:center">
        <div class="hero-eye" style="margin-bottom:16px;display:inline-flex">⚡ Apply in 30 Seconds</div>
        <h1>${program.emoji} ${program.name}</h1>
        <p style="margin:0 auto 22px">Just your name &amp; phone — our team will call you within 24 hours.</p>
      </div>
    </div>
    <section>
      <div class="container-x" style="max-width:560px">
        <div class="cform" id="lead-step">
          <h3>Quick Application</h3>
          <p style="font-size:0.85rem;color:var(--muted);margin-bottom:14px">
            Applying for: <strong>${program.name}</strong>
          </p>
          <form id="reg-form">
            <input type="hidden" name="programId" value="${programId}" />
            <div class="fg">
              <label>Full Name *</label>
              <input name="fullName" required placeholder="Your full name" autocomplete="name" />
            </div>
            <div class="fg">
              <label>Phone Number *</label>
              <input name="phone" required placeholder="98765 43210" inputmode="tel" autocomplete="tel" />
            </div>
            <div class="fg">
              <label>Referral Code (optional)</label>
              <input name="referralCode" value="${referralFromUrl}" placeholder="If a friend referred you" style="text-transform:uppercase" />
            </div>
            <button class="btn-dk" type="submit" style="width:100%;justify-content:center">Submit Application →</button>
            <p style="font-size:0.74rem;color:var(--muted);text-align:center;margin-top:12px">
              ✓ No payment required. Our counselor will reach out shortly.
            </p>
          </form>
          <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn-gn" href="${whatsappLink('Hi, I want to apply for ' + program.name + '.')}" target="_blank" rel="noopener" style="flex:1;justify-content:center">💬 WhatsApp Us</a>
            <a class="btn-gh" href="${telLink()}" style="flex:1;justify-content:center">📞 Call ${SITE.contactPhone}</a>
          </div>
        </div>

        <div id="lead-success" style="display:none"></div>
      </div>
    </section>
  `;

  view.querySelector('#reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Saving…';

    const data = Object.fromEntries(new FormData(e.target).entries());
    const { registration, error } = await createRegistration(data);

    btn.disabled = false; btn.textContent = 'Submit Application →';

    if (error) { toast(error.message || 'Something went wrong. Try again.', 'error'); return; }

    showSuccess(view, registration, program);
  });

  view.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) {
      const p = t.dataset.program;
      go(t.dataset.go, p ? { program: p } : {});
    }
  });

  return view;
}

function showSuccess(view, registration, program) {
  const step = view.querySelector('#lead-step');
  const ok = view.querySelector('#lead-success');
  step.style.display = 'none';
  ok.style.display = 'block';

  const waMsg = `Hi! I just applied for ${program.name}. My name is ${registration.full_name}. Please share next steps.`;

  ok.innerHTML = `
    <div class="cform" style="text-align:center">
      <div style="font-size:3.5rem;margin-bottom:14px">🎉</div>
      <h2 style="font-size:1.5rem;font-weight:800;color:var(--dark);margin-bottom:8px">Thank You!</h2>
      <p style="color:var(--muted);font-size:0.95rem;margin-bottom:8px">
        Hi <strong>${escapeHTML(registration.full_name)}</strong> — your application for <strong>${program.name}</strong> is in.
      </p>
      <p style="color:var(--muted);font-size:0.9rem;margin-bottom:22px">
        Our team will contact you on <strong>${escapeHTML(registration.phone)}</strong> within 24 hours.
      </p>

      <div style="display:flex;flex-direction:column;gap:8px">
        <a class="btn-gn" href="${whatsappLink(waMsg)}" target="_blank" rel="noopener" style="justify-content:center">
          💬 Chat on WhatsApp Now
        </a>
        <a class="btn-bl" href="${telLink()}" style="justify-content:center">
          📞 Call Us — ${SITE.contactPhone}
        </a>
        <button class="btn-gh" data-go="home" style="justify-content:center">Back to Home</button>
      </div>

      <p style="font-size:0.74rem;color:var(--muted);margin-top:16px">
        Booking ID: <code style="font-size:0.78rem">${registration.id.slice(0, 8)}</code>
      </p>
    </div>
  `;

  // Auto-open WhatsApp on mobile (best-effort, browser may block).
  if (/Android|iPhone/i.test(navigator.userAgent)) {
    setTimeout(() => {
      try { window.open(whatsappLink(waMsg), '_blank'); } catch {}
    }, 800);
  }
}

function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
