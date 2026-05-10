import { go } from '../utils/router.js';
import { openModal } from '../components/modal.js';
import { submitIncubatorApplication } from '../services/incubator.js';
import { toast } from '../utils/toast.js';
import { el } from '../utils/dom.js';

export function renderIncubator() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'AI Startup Incubator';
  view.innerHTML = `
    <div class="ihero">
      <div class="fpill">💰 Funding up to ₹50,000 per month</div>
      <h1>AI Startup <span>Incubator</span></h1>
      <p>Turn your AI skills into a real business. Get funding, dedicated mentorship, and full support to launch your own AI venture.</p>
      <button class="btn-bl" id="apply-incubator">Apply for Incubation →</button>
    </div>
    <section>
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">What You Get</div>
          <h2 class="stitle">Everything You Need to Launch</h2>
          <p class="ssub">We don't just teach — we stay with you till your business is live and generating revenue.</p>
        </div>
        <div class="sgrid">
          <div class="sc"><span class="si">💸</span><h4>Monthly Funding</h4><p>Up to ₹50,000 per month for startup costs, tools, and operations.</p></div>
          <div class="sc"><span class="si">🧑‍🏫</span><h4>1-on-1 Mentorship</h4><p>Dedicated sessions for product, pricing, and customer strategy.</p></div>
          <div class="sc"><span class="si">🏗</span><h4>Business Setup</h4><p>Help with GST, branding, logo, website launch, and legal basics.</p></div>
          <div class="sc"><span class="si">📣</span><h4>Marketing Support</h4><p>Initial digital campaigns and first customer acquisition support.</p></div>
          <div class="sc"><span class="si">🌐</span><h4>Network Access</h4><p>Investors, partners, and alumni community across Haryana.</p></div>
          <div class="sc"><span class="si">📊</span><h4>Growth Tracking</h4><p>Monthly reviews tracking revenue, customers, and milestones.</p></div>
        </div>
      </div>
    </section>
    <section class="bg-gray">
      <div class="container-x">
        <div class="shdr ctr">
          <div class="eye">Business Ideas</div>
          <h2 class="stitle">60+ AI-Powered Businesses You Can Start</h2>
          <p class="ssub">Real, local businesses where AI gives you an unfair advantage — right in your district.</p>
        </div>
        <div class="bgrid">
          <div class="bcard bc-h"><div class="bhdr"><span>🏥</span><h3>Health &amp; Wellness Centres</h3></div><div class="bitems"><span class="bi">Obesity &amp; weight loss</span><span class="bi">Diabetes management</span><span class="bi">Women's health (PCOS)</span><span class="bi">Pregnancy &amp; postpartum</span><span class="bi">Thyroid &amp; autoimmune</span><span class="bi">Child nutrition &amp; growth</span><span class="bi">Senior citizen health</span><span class="bi">Mental wellness &amp; stress</span><span class="bi">Skin &amp; hair health</span><span class="bi">De-addiction centre</span></div></div>
          <div class="bcard bc-e"><div class="bhdr"><span>📚</span><h3>Education &amp; Coaching Centres</h3></div><div class="bitems"><span class="bi">English speaking centre</span><span class="bi">Govt exam coaching (SSC)</span><span class="bi">Early childhood (age 3-8)</span><span class="bi">Math &amp; science tuition</span><span class="bi">Board exam crash course</span><span class="bi">Spoken Hindi for migrants</span><span class="bi">Financial literacy classes</span><span class="bi">Personality &amp; interview prep</span><span class="bi">IELTS / study abroad prep</span></div></div>
          <div class="bcard bc-f"><div class="bhdr"><span>🚀</span><h3>Future Skills Academy</h3></div><div class="bitems"><span class="bi">AI tools &amp; prompt skills</span><span class="bi">Robotics &amp; STEM (kids)</span><span class="bi">Coding &amp; app building</span><span class="bi">Drone technology training</span><span class="bi">3D printing &amp; prototyping</span><span class="bi">Video editing &amp; YouTube</span><span class="bi">Graphic design &amp; Canva</span><span class="bi">Freelancing (Fiverr, Upwork)</span><span class="bi">E-commerce &amp; online selling</span><span class="bi">Digital marketing &amp; SEO</span></div></div>
          <div class="bcard bc-fo"><div class="bhdr"><span>🍛</span><h3>Local Brands &amp; Food</h3></div><div class="bitems"><span class="bi">Desi ghee &amp; dairy brand</span><span class="bi">Packaged milk brand</span><span class="bi">Namkeen &amp; snacks brand</span><span class="bi">Pickle &amp; chutney brand</span><span class="bi">Spice grinding &amp; masala</span><span class="bi">Homemade sweets &amp; mithai</span><span class="bi">Atta / flour milling brand</span><span class="bi">Cold-pressed oil brand</span><span class="bi">Papad &amp; ready-to-cook</span><span class="bi">Dry fruits &amp; grocery brand</span></div></div>
          <div class="bcard bc-m"><div class="bhdr"><span>🏭</span><h3>Hyperlocal Manufacturing</h3></div><div class="bitems"><span class="bi">Disposable cups &amp; plates</span><span class="bi">Paper bag &amp; carry bag</span><span class="bi">Detergent &amp; cleaning</span><span class="bi">Agarbatti (incense) making</span><span class="bi">Candle making unit</span><span class="bi">Sanitary napkin unit</span><span class="bi">Chalk &amp; crayon making</span><span class="bi">Jute &amp; cloth bag making</span><span class="bi">Dona / leaf plate making</span><span class="bi">Soap &amp; handwash unit</span></div></div>
          <div class="bcard bc-s"><div class="bhdr"><span>🔧</span><h3>Local Services</h3></div><div class="bitems"><span class="bi">Home beauty &amp; salon</span><span class="bi">Digital marketing agency</span><span class="bi">Mobile repair &amp; accessories</span><span class="bi">Photography &amp; videography</span><span class="bi">Electrician service hub</span><span class="bi">Plumbing service hub</span><span class="bi">AC &amp; appliance repair</span><span class="bi">Tailoring &amp; alteration</span><span class="bi">Event planning &amp; decoration</span><span class="bi">Xerox, print &amp; documents</span></div></div>
        </div>
        <div class="ctab">
          <h2>Ready to Launch Your AI Business?</h2>
          <p>Apply for the Bharat AI Academy Incubator and get funding, mentorship, and support to make it real.</p>
          <button class="btn-bl" id="apply-incubator-2">Apply for Incubator →</button>
        </div>
      </div>
    </section>
  `;
  view.addEventListener('click', (e) => {
    if (e.target.id === 'apply-incubator' || e.target.id === 'apply-incubator-2') openIncubatorForm();
  });
  return view;
}

function openIncubatorForm() {
  const form = el('div', {}, []);
  form.innerHTML = `
    <h2>Apply for Incubator</h2>
    <p class="sub">Tell us about your idea — we'll review and reach out within 5 business days.</p>
    <form id="inc-form">
      <div class="fg"><label>Full Name *</label><input name="fullName" required placeholder="Your full name" /></div>
      <div class="fg"><label>Phone *</label><input name="phone" required placeholder="98765 43210" /></div>
      <div class="fg"><label>City *</label><input name="city" required placeholder="e.g. Charkhi Dadri" /></div>
      <div class="fg"><label>Startup Idea *</label><textarea name="startupIdea" required placeholder="Describe your AI business idea in 2–3 sentences"></textarea></div>
      <div class="fg"><label>Why this business?</label><textarea name="whyThisBusiness" placeholder="Why are you the right person?"></textarea></div>
      <div class="fg"><label>Current experience</label><input name="currentExperience" placeholder="Studies, work, businesses" /></div>
      <div class="fg"><label>Funding requirement (₹/month)</label><input name="fundingRequirement" placeholder="e.g. 30,000" /></div>
      <div class="fg"><label>Skills</label><input name="skills" placeholder="e.g. AI tools, marketing, sales" /></div>
      <div class="fg"><label>Pitch summary (1 sentence)</label><input name="pitchSummary" placeholder="One-line pitch" /></div>
      <button class="btn-dk" type="submit" style="width:100%;justify-content:center">Submit Application →</button>
    </form>
  `;
  const { close } = openModal(form);
  form.querySelector('#inc-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Submitting…';
    const data = Object.fromEntries(new FormData(e.target).entries());
    const { error } = await submitIncubatorApplication(data);
    btn.disabled = false; btn.textContent = 'Submit Application →';
    if (error) { toast(error.message || 'Could not submit. Try again.', 'error'); return; }
    close();
    toast('✓ Application submitted! We\'ll be in touch soon.', 'success', 5000);
  });
}
