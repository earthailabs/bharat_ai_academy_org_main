import { INTEREST_OPTIONS } from '../config/programs.js';
import { submitContact } from '../services/contact.js';
import { toast } from '../utils/toast.js';
import { SITE, whatsappLink } from '../config/site.js';
import { go } from '../utils/router.js';

export function renderContact() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Contact';
  view.innerHTML = `
    <div class="phero">
      <div class="phi">
        <div class="hero-eye" style="margin-bottom:16px;display:inline-flex">📞 Reach Us</div>
        <h1>Contact &amp; Apply</h1>
        <p>Interested in joining? Drop us your name &amp; phone — we'll call within 24 hours.</p>
      </div>
    </div>
    <section>
      <div class="container-x">
        <div class="cgrid">
          <div class="cform">
            <h3>Send Us a Message</h3>
            <form id="cform">
              <div class="fg"><label>Full Name *</label><input name="fullName" required placeholder="Your full name" /></div>
              <div class="fg"><label>Phone Number *</label><input name="phone" required placeholder="98765 43210" inputmode="tel" /></div>

              <div class="fg">
                <label>What are you interested in?</label>
                <div class="icards" id="interest-cards">
                  ${INTEREST_OPTIONS.map((o) => `
                    <button type="button" class="icard" data-interest="${o.id}">
                      <span class="ie">${o.emoji}</span>
                      ${o.label}
                    </button>
                  `).join('')}
                </div>
                <input type="hidden" name="interest" id="interest-input" value="general" />
              </div>

              <div class="fg"><label>Your Message</label><textarea name="message" rows="3" placeholder="Tell us briefly what you'd like to discuss…"></textarea></div>

              <button class="btn-dk" type="submit" style="width:100%;justify-content:center">Submit →</button>
            </form>
            <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
              <a class="btn-gn" href="${whatsappLink('Hi, I want to know more about Bharat AI Academy.')}" target="_blank" rel="noopener" style="flex:1;justify-content:center">💬 WhatsApp Us</a>
              <a class="btn-gh" href="tel:${SITE.contactPhone.replace(/\s+/g, '')}" style="flex:1;justify-content:center">📞 Call Now</a>
            </div>
          </div>

          <div class="ci">
            <h3>Get In Touch</h3>
            <div class="ii"><div class="iico">📍</div><div class="it"><strong>Location</strong><span>${SITE.location}</span></div></div>
            <div class="ii"><div class="iico">📞</div><div class="it"><strong>Call / WhatsApp</strong><span>${SITE.contactPhone}</span></div></div>
            <div class="ii"><div class="iico">✉️</div><div class="it"><strong>Email</strong><span>${SITE.contactEmail}</span></div></div>
            <div class="ii"><div class="iico">🕐</div><div class="it"><strong>Office Hours</strong><span>Mon–Sat, 9 AM to 6 PM</span></div></div>
            <div style="background:var(--bg);border:1.5px solid var(--border);border-radius:12px;padding:18px;margin-top:8px;text-align:center">
              <div style="font-size:1.8rem;margin-bottom:7px">🗺</div>
              <div style="font-size:0.85rem;font-weight:700;color:var(--dark);margin-bottom:3px">Charkhi Dadri, Haryana</div>
              <div style="font-size:0.78rem;color:var(--muted)">Visit us to see the center before enrolling.</div>
            </div>
            <div class="alert warn" style="margin-top:12px">
              <span>⚡</span><span>Only 40 seats for the June 8 batch. First come, first enrolled.</span>
            </div>
            <button class="btn-bl" data-go="register" data-program="youth" style="width:100%;justify-content:center;margin-top:6px">Apply Now →</button>
          </div>
        </div>
      </div>
    </section>
  `;

  // Interest card selection
  const cards = view.querySelectorAll('[data-interest]');
  const hidden = view.querySelector('#interest-input');
  cards.forEach((c) => c.addEventListener('click', () => {
    cards.forEach((x) => x.classList.remove('selected'));
    c.classList.add('selected');
    hidden.value = c.dataset.interest;
  }));

  view.querySelector('#cform').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Sending…';
    const data = Object.fromEntries(new FormData(e.target).entries());
    const { error } = await submitContact(data);
    btn.disabled = false; btn.textContent = 'Submit →';
    if (error) { toast(error.message || 'Could not send. Try again.', 'error'); return; }
    e.target.reset();
    cards.forEach((x) => x.classList.remove('selected'));
    hidden.value = 'general';
    toast('✓ Thanks! We\'ll call you within 24 hours.', 'success', 5000);
  });

  view.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) {
      const program = t.dataset.program;
      go(t.dataset.go, program ? { program } : {});
    }
  });

  return view;
}
