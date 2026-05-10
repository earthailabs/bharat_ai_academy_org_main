import { go } from '../utils/router.js';
import { whatsappLink } from '../config/site.js';

export function renderPaymentFailure(params = {}) {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Payment Failed';
  const reason = params.reason ? decodeURIComponent(params.reason) : 'Payment could not be completed.';
  view.innerHTML = `
    <section>
      <div class="container-x" style="max-width:560px">
        <div class="cform" style="text-align:center">
          <div style="font-size:3.5rem;margin-bottom:14px">😔</div>
          <h2 style="font-size:1.5rem;font-weight:800;color:var(--dark);margin-bottom:8px">Payment Could Not Be Completed</h2>
          <p style="color:var(--muted);font-size:0.9rem;margin-bottom:18px">${escapeHTML(reason)}</p>
          <div class="alert" style="background:#FFFBEB;border-color:#FDE68A;color:#92400E">
            <span>💡</span><span>Don't worry — your seat is still held. You can retry, or contact us on WhatsApp for help.</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px">
            <button class="btn-bl" data-go="register" style="justify-content:center">Try Again →</button>
            <a class="btn-gn" href="${whatsappLink('Hi, I had a payment issue while registering for Bharat AI Academy.')}" target="_blank" rel="noopener" style="justify-content:center">💬 Get Help on WhatsApp</a>
            <button class="btn-gh" data-go="home" style="justify-content:center">Back to Home</button>
          </div>
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
