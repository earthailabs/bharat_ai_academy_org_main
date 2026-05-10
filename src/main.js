import './styles/main.css';

import { startRouter, defineRoute, setNotFound } from './utils/router.js';
import { renderNav, renderAnnouncementBar } from './components/nav.js';
import { renderFooter } from './components/footer.js';
import { renderWhatsappFloat } from './components/whatsapp-button.js';
import { initAuth } from './services/auth.js';
import { trackReferralClick } from './services/referral.js';

import { renderHome } from './pages/home.js';
import { renderYouth } from './pages/youth.js';
import { renderSchool } from './pages/school.js';
import { renderIncubator } from './pages/incubator.js';
import { renderJobs } from './pages/jobs.js';
import { renderAbout } from './pages/about.js';
import { renderContact } from './pages/contact.js';
import { renderRegister } from './pages/register.js';
import { renderPaymentSuccess } from './pages/payment-success.js';
import { renderPaymentFailure } from './pages/payment-failure.js';
import { renderStudentDashboard } from './pages/student-dashboard.js';
import { renderReferralDashboard } from './pages/referral-dashboard.js';
import { renderAdminLogin } from './pages/admin-login.js';
import { renderAdminDashboard } from './pages/admin-dashboard.js';
import { renderNotFound } from './pages/not-found.js';

async function boot() {
  // Capture ?ref=CODE from initial URL — store, then track click
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    try {
      sessionStorage.setItem('referral_code', ref.toUpperCase());
      trackReferralClick(ref);
    } catch {}
  }

  // Auth init (non-blocking)
  initAuth().catch(() => {});

  // Layout
  const appRoot = document.getElementById('app');
  // We render the global chrome (announcement bar + nav + footer + wa float)
  // outside of the route view so they persist across navigations.
  const shell = document.createElement('div');
  shell.id = 'shell';
  document.body.insertBefore(renderAnnouncementBar(), document.body.firstChild);
  document.body.insertBefore(renderNav(), document.body.children[1]);
  // app is already in DOM (#app from index.html)
  document.body.appendChild(renderFooter());
  document.body.appendChild(renderWhatsappFloat());

  // Routes
  defineRoute('home', renderHome);
  defineRoute('youth', renderYouth);
  defineRoute('school', renderSchool);
  defineRoute('incubator', renderIncubator);
  defineRoute('jobs', renderJobs);
  defineRoute('about', renderAbout);
  defineRoute('contact', renderContact);
  defineRoute('register', renderRegister);
  defineRoute('payment-success', renderPaymentSuccess);
  defineRoute('payment-failure', renderPaymentFailure);
  defineRoute('dashboard', renderStudentDashboard);
  defineRoute('referrals', renderReferralDashboard);
  defineRoute('admin-login', renderAdminLogin);
  defineRoute('admin', renderAdminDashboard);
  setNotFound(renderNotFound);

  startRouter();
}

boot();
