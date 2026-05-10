import { go } from '../utils/router.js';
import { getUser, getStudentProfile } from '../services/auth.js';
import { getReferralStats, buildReferralLink, getLeaderboard } from '../services/referral.js';
import { toast } from '../utils/toast.js';
import { inr, formatDate } from '../utils/format.js';
import { whatsappLink } from '../config/site.js';

export async function renderReferralDashboard() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Referrals';

  const user = getUser();
  if (!user) { go('dashboard'); return view; }

  const student = await getStudentProfile();
  if (!student) { go('dashboard'); return view; }

  const stats = await getReferralStats(student.id);
  const board = await getLeaderboard(10);
  const link = buildReferralLink(stats.code);

  view.innerHTML = `
    <div class="dash">
      <aside class="dash-side">
        <h4>Menu</h4>
        <button data-go="dashboard">📊 Overview</button>
        <button class="active">🎁 Referrals</button>
      </aside>
      <main class="dash-main">
        <h1>Refer &amp; Earn</h1>
        <div class="sub">Share your code. When a friend pays, you earn rewards.</div>

        <div class="referral-code-box">
          <div class="l">Your Code</div>
          <div class="code">${stats.code || '—'}</div>
          <button id="copy">📋 Copy Link</button>
          <a href="${whatsappLink('Hey! Use my code ' + (stats.code || '') + ' to register for Bharat AI Academy. ' + link)}" target="_blank" rel="noopener" style="display:inline-block;margin-left:8px;background:#25D366;color:white;border:1px solid rgba(255,255,255,0.3);padding:8px 18px;border-radius:8px;font-size:0.82rem;font-weight:700;text-decoration:none">💬 Share on WhatsApp</a>
        </div>

        <div class="dash-grid">
          <div class="dash-stat"><div class="l">Total Referrals</div><div class="n">${stats.total}</div></div>
          <div class="dash-stat"><div class="l">Paid</div><div class="n">${stats.paid}</div></div>
          <div class="dash-stat"><div class="l">Pending</div><div class="n">${stats.total - stats.paid}</div></div>
          <div class="dash-stat"><div class="l">Earnings</div><div class="n">${inr(stats.earnings)}</div></div>
        </div>

        <div class="dash-card">
          <h3>Your Referrals</h3>
          ${stats.list.length ? `
            <table class="dt">
              <thead><tr><th>Friend</th><th>Status</th><th>Earned</th><th>Date</th></tr></thead>
              <tbody>
                ${stats.list.map((r) => `
                  <tr>
                    <td>${escapeHTML(r.referred_name || '—')}</td>
                    <td><span class="pill ${r.status === 'paid' ? 'green' : 'orange'}">${escapeHTML(r.status)}</span></td>
                    <td>${inr(r.amount_earned || 0)}</td>
                    <td>${formatDate(r.created_at)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `<p style="color:var(--muted);font-size:0.88rem">No referrals yet. Share your code to start earning!</p>`}
        </div>

        <div class="dash-card">
          <h3>🏆 Top Referrers</h3>
          ${board.length ? `
            <table class="dt">
              <thead><tr><th>#</th><th>Name</th><th>Paid Refs</th><th>Earned</th></tr></thead>
              <tbody>
                ${board.map((b, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${escapeHTML(b.full_name || '—')}</td>
                    <td>${b.paid_count || 0}</td>
                    <td>${inr(b.total_earned || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `<p style="color:var(--muted);font-size:0.88rem">Leaderboard coming soon.</p>`}
        </div>
      </main>
    </div>
  `;

  view.querySelector('#copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(link); toast('Link copied!', 'success'); }
    catch { toast(link, 'info', 6000); }
  });

  view.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  });

  return view;
}

function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
