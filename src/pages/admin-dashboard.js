import { go } from '../utils/router.js';
import { getUser, isAdmin, signOut } from '../services/auth.js';
import { adminAnalytics, adminListStudents, adminListRegistrations, adminListPayments, adminListContacts, adminListIncubatorApps, adminUpdateIncubatorStatus, exportToCsv } from '../services/admin.js';
import { toast } from '../utils/toast.js';
import { inr, formatDate, formatDateTime } from '../utils/format.js';

const TABS = [
  ['overview', '📊 Overview'],
  ['students', '👥 Students'],
  ['registrations', '📝 Registrations'],
  ['payments', '💸 Payments'],
  ['contacts', '✉️ Contact Forms'],
  ['incubator', '🚀 Incubator Apps'],
];

export async function renderAdminDashboard(params = {}) {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Admin Dashboard';

  const user = getUser();
  if (!user) { go('admin-login'); return view; }
  const ok = await isAdmin();
  if (!ok) {
    view.innerHTML = `<section><div class="container-x" style="max-width:480px"><div class="alert err"><span>🚫</span><span>You are not authorized. Sign in with an admin account.</span></div><button class="btn-dk" data-go="admin-login">Go to Admin Login</button></div></section>`;
    view.addEventListener('click', (e) => { const t = e.target.closest('[data-go]'); if (t) go(t.dataset.go); });
    return view;
  }

  const activeTab = params.tab || 'overview';

  view.innerHTML = `
    <div class="dash">
      <aside class="dash-side">
        <div style="font-weight:800;font-size:0.95rem;color:var(--dark);margin-bottom:6px">Admin</div>
        <div style="font-size:0.78rem;color:var(--muted);margin-bottom:18px">${escapeHTML(user.email || '')}</div>
        <h4>Sections</h4>
        ${TABS.map(([id, label]) => `
          <button class="${id === activeTab ? 'active' : ''}" data-tab="${id}">${label}</button>
        `).join('')}
        <h4 style="margin-top:18px">Account</h4>
        <button id="logout">🚪 Sign Out</button>
        <button data-go="home">← Back to Site</button>
      </aside>
      <main class="dash-main" id="admin-main">Loading…</main>
    </div>
  `;

  const main = view.querySelector('#admin-main');
  await renderTab(main, activeTab);

  view.addEventListener('click', async (e) => {
    if (e.target.id === 'logout') { await signOut(); go('home'); return; }
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      view.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === tabBtn.dataset.tab));
      window.location.hash = `#/admin?tab=${tabBtn.dataset.tab}`;
      await renderTab(main, tabBtn.dataset.tab);
      return;
    }
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) go(goBtn.dataset.go);
  });

  return view;
}

async function renderTab(main, tab) {
  main.innerHTML = `<div style="color:var(--muted);font-size:0.9rem">Loading…</div>`;
  switch (tab) {
    case 'overview':       return overviewTab(main);
    case 'students':       return studentsTab(main);
    case 'registrations':  return registrationsTab(main);
    case 'payments':       return paymentsTab(main);
    case 'contacts':       return contactsTab(main);
    case 'incubator':      return incubatorTab(main);
    default:               main.innerHTML = '<p>Unknown tab</p>';
  }
}

async function overviewTab(main) {
  const a = await adminAnalytics();
  main.innerHTML = `
    <h1>Overview</h1>
    <div class="sub">Realtime snapshot of academy activity.</div>
    <div class="dash-grid">
      <div class="dash-stat"><div class="l">Registrations</div><div class="n">${a.total_registrations}</div></div>
      <div class="dash-stat"><div class="l">Students</div><div class="n">${a.total_students}</div></div>
      <div class="dash-stat"><div class="l">Total Revenue</div><div class="n">${inr(a.total_revenue)}</div></div>
      <div class="dash-stat"><div class="l">Successful Payments</div><div class="n">${a.paid_count}</div></div>
      <div class="dash-stat"><div class="l">Contact Submissions</div><div class="n">${a.total_contacts}</div></div>
      <div class="dash-stat"><div class="l">Incubator Applications</div><div class="n">${a.total_incubator}</div></div>
    </div>
    <div class="dash-card"><h3>Quick Actions</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-dk" data-tab="registrations">View Registrations</button>
        <button class="btn-gh" data-tab="payments">View Payments</button>
        <button class="btn-gh" data-tab="incubator">Review Incubator Apps</button>
      </div>
    </div>
  `;
}

async function studentsTab(main) {
  const search = '';
  const { data: students, error } = await adminListStudents({ search, limit: 200 });
  if (error) { main.innerHTML = errorBox(error); return; }
  main.innerHTML = `
    <h1>Students</h1>
    <div class="sub">All registered learners with profile + payment history.</div>
    <div class="dash-card">
      <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">
        <input id="s-search" placeholder="Search name, phone, email…" style="flex:1;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:0.875rem" />
        <button class="btn-gh" id="s-export">Export CSV</button>
      </div>
      <table class="dt">
        <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Code</th><th>Joined</th></tr></thead>
        <tbody id="s-tbody">
          ${(students || []).map(rowStudent).join('') || '<tr><td colspan="6" style="color:var(--muted)">No students yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  main.querySelector('#s-export').addEventListener('click', () => {
    exportToCsv(`students-${Date.now()}.csv`, students || []);
  });
  main.querySelector('#s-search').addEventListener('input', async (e) => {
    const { data } = await adminListStudents({ search: e.target.value, limit: 200 });
    main.querySelector('#s-tbody').innerHTML = (data || []).map(rowStudent).join('') || '<tr><td colspan="6">No matches.</td></tr>';
  });
}
function rowStudent(s) {
  return `<tr>
    <td><strong>${escapeHTML(s.full_name || '')}</strong></td>
    <td>${escapeHTML(s.phone || '')}</td>
    <td>${escapeHTML(s.email || '—')}</td>
    <td>${escapeHTML(s.city || '—')}</td>
    <td><code style="font-size:0.78rem">${escapeHTML(s.referral_code || '')}</code></td>
    <td>${formatDate(s.created_at)}</td>
  </tr>`;
}

async function registrationsTab(main) {
  const { data: regs, error } = await adminListRegistrations({ limit: 200 });
  if (error) { main.innerHTML = errorBox(error); return; }
  main.innerHTML = `
    <h1>Registrations</h1>
    <div class="sub">Every booking attempt — pending, reserved, and paid.</div>
    <div class="dash-card">
      <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
        <button class="btn-gh" id="r-export">Export CSV</button>
      </div>
      <table class="dt">
        <thead><tr><th>Name</th><th>Phone</th><th>Program</th><th>Status</th><th>Referral</th><th>Date</th></tr></thead>
        <tbody>
          ${(regs || []).map((r) => `
            <tr>
              <td><strong>${escapeHTML(r.full_name)}</strong></td>
              <td>${escapeHTML(r.phone)}</td>
              <td>${escapeHTML(r.program_id)}</td>
              <td><span class="pill ${r.status === 'paid' ? 'green' : r.status === 'reserved' ? 'orange' : 'gray'}">${escapeHTML(r.status)}</span></td>
              <td>${escapeHTML(r.referral_code_used || '—')}</td>
              <td>${formatDateTime(r.created_at)}</td>
            </tr>
          `).join('') || '<tr><td colspan="6" style="color:var(--muted)">No registrations yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  main.querySelector('#r-export').addEventListener('click', () => {
    exportToCsv(`registrations-${Date.now()}.csv`, regs || []);
  });
}

async function paymentsTab(main) {
  const { data: pays, error } = await adminListPayments({ limit: 200 });
  if (error) { main.innerHTML = errorBox(error); return; }
  main.innerHTML = `
    <h1>Payments</h1>
    <div class="sub">Razorpay-verified transactions.</div>
    <div class="dash-card">
      <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
        <button class="btn-gh" id="p-export">Export CSV</button>
      </div>
      <table class="dt">
        <thead><tr><th>Student</th><th>Amount</th><th>Type</th><th>Status</th><th>Razorpay ID</th><th>Date</th></tr></thead>
        <tbody>
          ${(pays || []).map((p) => `
            <tr>
              <td><strong>${escapeHTML(p.registrations?.full_name || '—')}</strong><br><span style="color:var(--muted);font-size:0.78rem">${escapeHTML(p.registrations?.phone || '')}</span></td>
              <td><strong>${inr(p.amount)}</strong></td>
              <td>${escapeHTML(p.payment_type || '—')}</td>
              <td><span class="pill ${p.status === 'paid' ? 'green' : p.status === 'failed' ? 'gray' : 'orange'}">${escapeHTML(p.status)}</span></td>
              <td><code style="font-size:0.74rem">${escapeHTML(p.razorpay_payment_id || '—')}</code></td>
              <td>${formatDateTime(p.created_at)}</td>
            </tr>
          `).join('') || '<tr><td colspan="6" style="color:var(--muted)">No payments yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  main.querySelector('#p-export').addEventListener('click', () => {
    exportToCsv(`payments-${Date.now()}.csv`, pays || []);
  });
}

async function contactsTab(main) {
  const { data: rows, error } = await adminListContacts({ limit: 200 });
  if (error) { main.innerHTML = errorBox(error); return; }
  main.innerHTML = `
    <h1>Contact Submissions</h1>
    <div class="sub">Inbound leads from the contact form.</div>
    <div class="dash-card">
      <table class="dt">
        <thead><tr><th>Name</th><th>Phone</th><th>Interest</th><th>Message</th><th>Date</th></tr></thead>
        <tbody>
          ${(rows || []).map((r) => `
            <tr>
              <td><strong>${escapeHTML(r.full_name)}</strong></td>
              <td>${escapeHTML(r.phone)}</td>
              <td><span class="pill blue">${escapeHTML(r.interest)}</span></td>
              <td style="max-width:300px">${escapeHTML(r.message || '—')}</td>
              <td>${formatDateTime(r.created_at)}</td>
            </tr>
          `).join('') || '<tr><td colspan="5" style="color:var(--muted)">No submissions yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

async function incubatorTab(main) {
  const { data: apps, error } = await adminListIncubatorApps({ limit: 200 });
  if (error) { main.innerHTML = errorBox(error); return; }
  main.innerHTML = `
    <h1>Incubator Applications</h1>
    <div class="sub">Review &amp; approve startup ideas.</div>
    ${(apps || []).map((a) => `
      <div class="dash-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div>
            <h3 style="margin-bottom:4px">${escapeHTML(a.full_name)} <span style="color:var(--muted);font-weight:500">· ${escapeHTML(a.city || '')}</span></h3>
            <div style="font-size:0.8rem;color:var(--muted)">${escapeHTML(a.phone)} · ${formatDate(a.created_at)}</div>
          </div>
          <span class="pill ${a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'gray' : 'orange'}">${escapeHTML(a.status)}</span>
        </div>
        <div style="font-size:0.85rem;color:var(--text);line-height:1.7">
          <p><strong>Idea:</strong> ${escapeHTML(a.startup_idea || '—')}</p>
          ${a.why_this_business ? `<p><strong>Why:</strong> ${escapeHTML(a.why_this_business)}</p>` : ''}
          ${a.skills ? `<p><strong>Skills:</strong> ${escapeHTML(a.skills)}</p>` : ''}
          ${a.funding_requirement ? `<p><strong>Funding:</strong> ${escapeHTML(a.funding_requirement)}</p>` : ''}
          ${a.pitch_summary ? `<p><strong>Pitch:</strong> ${escapeHTML(a.pitch_summary)}</p>` : ''}
        </div>
        ${a.status === 'pending' ? `
          <div style="display:flex;gap:8px;margin-top:14px">
            <button class="btn-gn" data-action="approve" data-id="${a.id}">✓ Approve</button>
            <button class="btn-gh" data-action="reject" data-id="${a.id}">✗ Reject</button>
          </div>
        ` : ''}
      </div>
    `).join('') || '<p style="color:var(--muted)">No applications yet.</p>'}
  `;
  main.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const newStatus = b.dataset.action === 'approve' ? 'approved' : 'rejected';
    const { error } = await adminUpdateIncubatorStatus(b.dataset.id, newStatus, null);
    if (error) toast(error.message, 'error');
    else { toast(`Application ${newStatus}`, 'success'); incubatorTab(main); }
  });
}

function errorBox(error) {
  return `<div class="alert err"><span>⚠️</span><span>${escapeHTML(error.message || 'Could not load')}</span></div>`;
}
function escapeHTML(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
