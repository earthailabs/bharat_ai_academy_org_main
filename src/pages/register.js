import { go } from '../utils/router.js';
import { PROGRAMS, getProgram } from '../config/programs.js';
import { createRegistration } from '../services/registration.js';
import { startPayment } from '../services/payment.js';
import { toast } from '../utils/toast.js';
import { inr } from '../utils/format.js';

/**
 * Two-step lead funnel:
 *   step 1 — Name + Phone + (optional) Referral + program select
 *   step 2 — Choose payment option (Reserve / Full) → Razorpay
 *
 * Bharat-friendly: no email, no city, no long form. Profile completion happens
 * after payment in the student dashboard.
 */
export function renderRegister(params = {}) {
  const initialProgramId = params.program && PROGRAMS[params.program] ? params.program : 'youth';
  const referralFromUrl = sessionStorage.getItem('referral_code') || '';

  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Reserve Your Seat';
  view.innerHTML = `
    <div class="phero">
      <div class="phi" style="text-align:center">
        <div class="hero-eye" style="margin-bottom:16px;display:inline-flex">⚡ Reserve in 30 Seconds</div>
        <h1>Reserve Your Seat</h1>
        <p style="margin:0 auto 22px">Just your name &amp; phone — that's it. No long forms.</p>
      </div>
    </div>
    <section>
      <div class="container-x" style="max-width:560px">
        <div class="cform" id="step-1">
          <h3>Quick Registration</h3>
          <form id="reg-form">
            <div class="fg">
              <label>Choose Your Program *</label>
              <select name="programId" required>
                ${Object.values(PROGRAMS).filter((p) => p.fullPrice && p.fullPrice > 0).map((p) => `
                  <option value="${p.id}" ${p.id === initialProgramId ? 'selected' : ''}>
                    ${p.emoji} ${p.name} — ${inr(p.fullPrice)}
                  </option>
                `).join('')}
              </select>
            </div>
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
            <button class="btn-dk" type="submit" style="width:100%;justify-content:center">Continue to Payment →</button>
            <p style="font-size:0.74rem;color:var(--muted);text-align:center;margin-top:12px">
              🔒 Secure payment via Razorpay. No charges yet.
            </p>
          </form>
        </div>

        <div id="step-2" style="display:none"></div>
      </div>
    </section>
  `;

  view.querySelector('#reg-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Saving…';

    const data = Object.fromEntries(new FormData(e.target).entries());
    const { registration, error } = await createRegistration(data);

    btn.disabled = false; btn.textContent = 'Continue to Payment →';

    if (error) { toast(error.message || 'Something went wrong. Try again.', 'error'); return; }

    showPaymentStep(view, registration);
  });

  view.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  });

  return view;
}

function showPaymentStep(view, registration) {
  const program = getProgram(registration.program_id);
  const step1 = view.querySelector('#step-1');
  const step2 = view.querySelector('#step-2');
  step1.style.display = 'none';
  step2.style.display = 'block';

  step2.innerHTML = `
    <div class="cform">
      <div class="alert" style="margin-bottom:16px">
        <span>✓</span><span>Hi <strong>${escapeHTML(registration.full_name)}</strong>! Choose how you'd like to pay.</span>
      </div>
      <h3>${program.emoji} ${program.name}</h3>
      <div class="pay-opts">
        <button class="pay-opt" data-pay="reserve">
          <div class="pay-opt-row">
            <div>
              <h4>Reserve Your Seat</h4>
              <p>Lock your seat with a small booking amount. Pay rest before batch starts.</p>
              <span class="badge">RECOMMENDED</span>
            </div>
            <div class="amt">${inr(program.reservePrice)}</div>
          </div>
        </button>
        <button class="pay-opt" data-pay="full">
          <div class="pay-opt-row">
            <div>
              <h4>Pay Full Amount</h4>
              <p>One-time complete payment. No more dues — fully enrolled.</p>
            </div>
            <div class="amt">${inr(program.fullPrice)}</div>
          </div>
        </button>
      </div>
      <p style="font-size:0.74rem;color:var(--muted);text-align:center;margin-top:18px">
        🔒 All payments processed securely by Razorpay (UPI, cards, netbanking).
      </p>
      <button class="btn-gh" id="back-step" style="width:100%;justify-content:center;margin-top:10px">← Back</button>
    </div>
  `;

  step2.addEventListener('click', async (e) => {
    if (e.target.id === 'back-step' || e.target.closest('#back-step')) {
      step2.style.display = 'none';
      step1.style.display = 'block';
      return;
    }
    const opt = e.target.closest('[data-pay]');
    if (!opt) return;
    document.querySelectorAll('.pay-opt').forEach((x) => x.classList.remove('selected'));
    opt.classList.add('selected');
    const paymentType = opt.dataset.pay;
    try {
      opt.style.opacity = '0.6';
      await startPayment({ registration, paymentType });
      // Success → go to success page with reg id
      window.location.hash = `#/payment-success?id=${registration.id}`;
    } catch (err) {
      opt.style.opacity = '1';
      const msg = err?.message || 'Payment could not be completed';
      if (msg.toLowerCase().includes('cancel')) {
        toast('Payment cancelled. You can try again anytime.', 'info');
      } else {
        toast(msg, 'error', 5000);
        window.location.hash = `#/payment-failure?id=${registration.id}&reason=${encodeURIComponent(msg)}`;
      }
    }
  });
}

function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
