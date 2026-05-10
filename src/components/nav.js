import { go } from '../utils/router.js';
import { SITE } from '../config/site.js';

const ROUTES = [
  ['home', 'Home'],
  ['youth', 'AI for Youth'],
  ['school', 'School Program'],
  ['incubator', 'Incubator'],
  ['jobs', 'Jobs'],
  ['about', 'About'],
  ['contact', 'Contact'],
];

export function renderNav() {
  const nav = document.createElement('nav');
  nav.className = 'app-nav';
  nav.innerHTML = `
    <div class="nav-inner">
      <div class="logo" data-go="home" style="cursor:pointer">
        <img src="${SITE.logo}" alt="Bharat AI Academy" class="logo-img" style="height:40px;width:auto;display:block" />
        <div>
          <div class="logo-name">Bharat <span>AI</span> Academy</div>
          <div class="logo-sub">Empowering Bharat with AI</div>
        </div>
      </div>
      <ul class="nav-links" id="nl">
        ${ROUTES.map(([id, label]) => `
          <li data-route="${id}"><button data-go="${id}">${label}</button></li>
        `).join('')}
        <li><button class="nav-cta" data-go="register" data-program="youth">Apply Now →</button></li>
      </ul>
      <button class="mbtn" id="mbtn">☰</button>
    </div>
  `;
  nav.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) {
      const program = t.dataset.program;
      go(t.dataset.go, program ? { program } : {});
      closeMobile();
      return;
    }
    if (e.target.id === 'mbtn') toggleMobile();
  });
  return nav;
}

function toggleMobile() {
  const nl = document.getElementById('nl');
  if (!nl) return;
  const open = nl.style.display === 'flex';
  nl.style.cssText = open ? '' : 'display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:white;padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,0.1);gap:2px;z-index:999;border-bottom:1px solid #E5E7EB';
}
function closeMobile() {
  const nl = document.getElementById('nl');
  if (nl) nl.style.cssText = '';
}

export function renderAnnouncementBar() {
  const div = document.createElement('div');
  div.className = 'ann-bar';
  div.innerHTML = '🎓 Batch starting <strong>8 June 2026</strong> · Only 40 seats · Charkhi Dadri, Haryana · <strong>₹17,000</strong> (limited time)';
  return div;
}
