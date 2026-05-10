import { getRegistration } from '../services/registration.js';
import { getProgram } from '../config/programs.js';
import { SITE, whatsappLink } from '../config/site.js';
import { inr } from '../utils/format.js';
import { go } from '../utils/router.js';

export async function renderPaymentSuccess(params = {}) {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Payment Successful';

  const id = params.id;
  let reg = null;
  if (id) {
    const { registration } = await getRegistration(id);
    reg = registration;
  }
  const program = reg ? getProgram(reg.program_id) : null;
  const lastPayment = reg?.payments?.length ? reg.payments[reg.payments.length - 1] : null;

  view.innerHTML = `
    <section>
      <div class="container-x" style="max-width:560px">
        <div class="cform" style="text-align:center">
          <div style="font-size:3.5rem;margin-bottom:14px">🎉</div>
          <h2 style="font-size:1.5rem;font-weight:800;color:var(--dark);margin-bottom:8px">Payment Successful!</h2>
          <p style="color:var(--muted);font-size:0.9rem;margin-bottom:24px">
            ${reg ? `Welcome, <strong>${escapeHTML(reg.full_name)}</strong>! Your seat is reserved.` : 'Your registration is confirmed.'}
          </p>

          ${reg ? `
            <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:12px;padding:18px;text-align:left;margin-bottom:18px">
              <div style="font-size:0.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px">Booking Summary</div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem"><span>Program</span><strong>${program?.name || reg.program_id}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem"><span>Name</span><strong>${escapeHTML(reg.full_name)}</strong></div>
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem"><span>Phone</span><strong>${escapeHTML(reg.phone)}</strong></div>
              ${lastPayment ? `
                <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem"><span>Amount Paid</span><strong>${inr(lastPayment.amount)}</strong></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem"><span>Type</span><strong>${lastPayment.payment_type === 'reserve' ? 'Seat Reservation' : 'Full Payment'}</strong></div>
              ` : ''}
              <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem"><span>Booking ID</span><code style="font-size:0.78rem">${reg.id.slice(0, 8)}</code></div>
            </div>
          ` : ''}

          <div style="display:flex;flex-direction:column;gap:8px">
            <a class="btn-gn" href="${whatsappLink('Hi! I just booked my seat for Bharat AI Academy. Please add me to the WhatsApp community.')}" target="_blank" rel="noopener" style="justify-content:center">
              💬 Join WhatsApp Community
            </a>
            <a class="btn-gh" href="${SITE.whatsappGroup}" target="_blank" rel="noopener" style="justify-content:center">
              👥 Join Batch Group
            </a>
            <button class="btn-bl" data-go="dashboard" style="justify-content:center">
              Complete Your Profile →
            </button>
            <button class="btn-gh" data-go="home" style="justify-content:center">Back to Home</button>
          </div>

          <p style="font-size:0.74rem;color:var(--muted);margin-top:16px">
            We've sent a confirmation. Check your phone for next steps.
          </p>
        </div>
      </div>
    </section>
  `;
  view.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  });
  return view;
}

function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
