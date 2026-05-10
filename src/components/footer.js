import { go } from '../utils/router.js';
import { SITE, whatsappLink, telLink } from '../config/site.js';

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <div class="fi2">
      <div class="ftop">
        <div class="fbrand">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <img src="${SITE.logo}" alt="Bharat AI Academy" style="height:42px;width:auto" />
            <div class="logo-name">Bharat <span>AI</span> Academy</div>
          </div>
          <p>India's offline AI skills training for youth, students, and micro-entrepreneurs in Tier 2–3 cities and rural Bharat.</p>
          <p style="margin-top:9px;font-size:0.76rem;font-style:italic">"Apna Business, Apne Ghar Se" 🏠</p>
          <p style="margin-top:10px;font-size:0.78rem">
            📞 <a href="${telLink()}" style="color:inherit">${SITE.contactPhone}</a><br/>
            ✉️ <a href="mailto:${SITE.contactEmail}" style="color:inherit">${SITE.contactEmail}</a>
          </p>
        </div>
        <div class="fcol">
          <h4>Programs</h4>
          <ul>
            <li><button data-go="youth">AI for Youth</button></li>
            <li><button data-go="school">AI for Schools</button></li>
            <li><button data-go="incubator">AI Incubator</button></li>
            <li><button data-go="jobs">Job Support</button></li>
          </ul>
        </div>
        <div class="fcol">
          <h4>Company</h4>
          <ul>
            <li><button data-go="about">About Us</button></li>
            <li><button data-go="contact">Contact</button></li>
            <li><button data-go="register" data-program="youth">Apply Now</button></li>
            <li><button data-go="dashboard">Student Login</button></li>
          </ul>
        </div>
        <div class="fcol">
          <h4>Connect</h4>
          <ul>
            <li><a href="${whatsappLink('Hi, I want to know more about Bharat AI Academy.')}" target="_blank" rel="noopener">💬 WhatsApp Us</a></li>
            <li><a href="${telLink()}">📞 Call Now</a></li>
            <li><a href="#" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="#" target="_blank" rel="noopener">YouTube</a></li>
          </ul>
        </div>
      </div>
      <div class="fbot">
        <span>© 2026 Bharat AI Academy · bharataiacademy.org · Charkhi Dadri, Haryana · Made with ❤️ for Bharat</span>
        <a href="#/admin-login" class="admin-link">Admin</a>
      </div>
    </div>
  `;
  footer.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) {
      e.preventDefault();
      const program = t.dataset.program;
      go(t.dataset.go, program ? { program } : {});
    }
  });
  return footer;
}
