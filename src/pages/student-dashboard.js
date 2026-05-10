import { go } from '../utils/router.js';
import { getUser, getStudentProfile, signInWithOtp, verifyOtp, signOut } from '../services/auth.js';
import { getReferralStats, buildReferralLink } from '../services/referral.js';
import { supabase } from '../config/supabase.js';
import { toast } from '../utils/toast.js';
import { inr, formatDate, normalizePhone } from '../utils/format.js';
import { whatsappLink } from '../config/site.js';

export async function renderStudentDashboard() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'My Dashboard';

  const user = getUser();
  if (!user) return renderLoginGate(view);

  const student = await getStudentProfile();
  // If logged in but no student row yet, prompt minimal completion
  if (!student) return renderProfileBootstrap(view, user);

  const stats = await getReferralStats(student.id);

  // Fetch this student's registrations + payments (RLS-restricted)
  const { data: regs } = await supabase
    .from('registrations')
    .select('*, payments(*)')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false });

  view.innerHTML = `
    <div class="dash">
      <aside class="dash-side">
        <div style="font-weight:800;font-size:0.95rem;color:var(--dark);margin-bottom:6px">${escapeHTML(student.full_name)}</div>
        <div style="font-size:0.78rem;color:var(--muted);margin-bottom:18px">${escapeHTML(student.phone || '')}</div>
        <h4>Menu</h4>
        <button class="active" data-tab="overview">📊 Overview</button>
        <button data-tab="profile">👤 My Profile</button>
        <button data-tab="referrals" data-go="referrals">🎁 Referrals</button>
        <button data-tab="logout" id="logout">🚪 Sign Out</button>
      </aside>
      <main class="dash-main">
        <h1>Welcome back 👋</h1>
        <div class="sub">Here's everything you need for your Bharat AI Academy journey.</div>

        <div class="dash-grid">
          <div class="dash-stat"><div class="l">Active Programs</div><div class="n">${(regs || []).filter(r => r.status === 'paid' || r.status === 'reserved').length}</div></div>
          <div class="dash-stat"><div class="l">Referrals</div><div class="n">${stats.total}</div></div>
          <div class="dash-stat"><div class="l">Paid Referrals</div><div class="n">${stats.paid}</div></div>
          <div class="dash-stat"><div class="l">Earnings</div><div class="n">${inr(stats.earnings)}</div></div>
        </div>

        <div class="referral-code-box">
          <div class="l">Your Referral Code</div>
          <div class="code">${student.referral_code || '—'}</div>
          <button id="copy-link">📋 Copy Referral Link</button>
        </div>

        <div class="dash-card">
          <h3>📚 My Registrations</h3>
          ${(regs && regs.length) ? `
            <table class="dt">
              <thead><tr><th>Program</th><th>Status</th><th>Booked</th><th>Paid</th></tr></thead>
              <tbody>
                ${regs.map((r) => {
                  const paid = (r.payments || []).filter(p => p.status === 'paid').reduce((s,p)=>s+p.amount, 0);
                  return `
                    <tr>
                      <td>${escapeHTML(r.program_id)}</td>
                      <td><span class="pill ${r.status === 'paid' ? 'green' : r.status === 'reserved' ? 'orange' : 'gray'}">${escapeHTML(r.status)}</span></td>
                      <td>${formatDate(r.created_at)}</td>
                      <td>${inr(paid)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : `<p style="color:var(--muted);font-size:0.88rem">No registrations yet. <a href="#/register" style="color:var(--blue);font-weight:700">Reserve a seat →</a></p>`}
        </div>

        <div class="dash-card">
          <h3>👤 Complete Your Profile</h3>
          <form id="profile-form" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="fg" style="margin:0"><label>Email</label><input name="email" value="${escapeHTML(student.email || '')}" placeholder="you@example.com" /></div>
            <div class="fg" style="margin:0"><label>Age</label><input name="age" type="number" min="8" max="80" value="${student.age || ''}" /></div>
            <div class="fg" style="margin:0"><label>City</label><input name="city" value="${escapeHTML(student.city || '')}" /></div>
            <div class="fg" style="margin:0"><label>State</label><input name="state" value="${escapeHTML(student.state || '')}" /></div>
            <div class="fg" style="margin:0"><label>School / College</label><input name="school" value="${escapeHTML(student.school || '')}" /></div>
            <div class="fg" style="margin:0"><label>Career Interests</label><input name="career_interests" value="${escapeHTML(student.career_interests || '')}" placeholder="e.g. AI agency, content creation" /></div>
            <div style="grid-column:1/-1"><button class="btn-dk" type="submit">Save Profile</button></div>
          </form>
        </div>

        <div class="dash-card" style="background:linear-gradient(135deg,#F0FDF4,#ECFDF5);border-color:#BBF7D0">
          <h3 style="color:#166534">💬 Stay Connected</h3>
          <p style="color:var(--text);font-size:0.85rem;margin-bottom:12px">Join the alumni community and stay updated with batch news.</p>
          <a class="btn-gn" href="${whatsappLink('Hi! I want to be added to the Bharat AI Academy community.')}" target="_blank" rel="noopener">💬 WhatsApp Community</a>
        </div>
      </main>
    </div>
  `;

  view.querySelector('#copy-link').addEventListener('click', async () => {
    const link = buildReferralLink(student.referral_code);
    try { await navigator.clipboard.writeText(link); toast('Referral link copied!', 'success'); }
    catch { toast(link, 'info', 6000); }
  });

  view.querySelector('#logout').addEventListener('click', async () => {
    await signOut();
    go('home');
  });

  view.querySelector('#profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (data.age === '') delete data.age;
    const { error } = await supabase.from('students').update(data).eq('id', student.id);
    if (error) toast(error.message, 'error');
    else toast('Profile saved ✓', 'success');
  });

  view.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  });

  return view;
}

function renderLoginGate(view) {
  view.innerHTML = `
    <section>
      <div class="container-x" style="max-width:440px">
        <div class="cform">
          <h3>Student Login</h3>
          <p style="color:var(--muted);font-size:0.85rem;margin-bottom:16px">Use the same phone number you registered with.</p>
          <div id="login-step-1">
            <div class="fg"><label>Phone Number *</label><input id="phone-in" placeholder="98765 43210" inputmode="tel" /></div>
            <button class="btn-dk" id="send-otp" style="width:100%;justify-content:center">Send OTP →</button>
          </div>
          <div id="login-step-2" style="display:none">
            <div class="fg"><label>Enter OTP</label><input id="otp-in" inputmode="numeric" placeholder="6-digit code" /></div>
            <button class="btn-dk" id="verify-otp" style="width:100%;justify-content:center">Verify &amp; Login →</button>
          </div>
          <p style="font-size:0.74rem;color:var(--muted);text-align:center;margin-top:12px">
            Note: Phone OTP requires SMS provider configured in Supabase Auth.
          </p>
        </div>
      </div>
    </section>
  `;
  let phoneNorm = null;
  view.querySelector('#send-otp').addEventListener('click', async () => {
    phoneNorm = normalizePhone(view.querySelector('#phone-in').value);
    if (!phoneNorm) { toast('Invalid phone number', 'error'); return; }
    const { error } = await signInWithOtp(phoneNorm);
    if (error) { toast(error.message, 'error'); return; }
    view.querySelector('#login-step-1').style.display = 'none';
    view.querySelector('#login-step-2').style.display = 'block';
    toast('OTP sent', 'info');
  });
  view.querySelector('#verify-otp').addEventListener('click', async () => {
    const code = view.querySelector('#otp-in').value.trim();
    const { error } = await verifyOtp(phoneNorm, code);
    if (error) { toast(error.message, 'error'); return; }
    toast('Welcome back!', 'success');
    setTimeout(() => location.reload(), 600);
  });
  return view;
}

function renderProfileBootstrap(view, user) {
  view.innerHTML = `
    <section>
      <div class="container-x" style="max-width:480px">
        <div class="cform">
          <h3>Set Up Your Profile</h3>
          <p style="color:var(--muted);font-size:0.85rem;margin-bottom:16px">Just one step before you access the dashboard.</p>
          <form id="bp-form">
            <div class="fg"><label>Full Name *</label><input name="full_name" required /></div>
            <button class="btn-dk" type="submit" style="width:100%;justify-content:center">Continue →</button>
          </form>
        </div>
      </div>
    </section>
  `;
  view.querySelector('#bp-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const { error } = await supabase.from('students').insert({
      user_id: user.id,
      full_name: data.full_name,
      phone: user.phone || null,
    });
    if (error) toast(error.message, 'error');
    else { toast('Welcome!', 'success'); setTimeout(() => location.reload(), 600); }
  });
  return view;
}

function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
