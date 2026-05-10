import { go } from '../utils/router.js';

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    <div class="fi2">
      <div class="ftop">
        <div class="fbrand">
          <div class="logo-name">Bharat <span>AI</span> Academy</div>
          <p>India's offline AI skills training for youth, students, and micro-entrepreneurs in Tier 2–3 cities and rural Bharat.</p>
          <p style="margin-top:9px;font-size:0.76rem;font-style:italic">"Apna Business, Apne Ghar Se" 🏠</p>
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
            <li><button data-go="register">Register</button></li>
            <li><button data-go="dashboard">Student Login</button></li>
          </ul>
        </div>
        <div class="fcol">
          <h4>Connect</h4>
          <ul>
            <li><a href="https://chat.whatsapp.com/replace-me" target="_blank" rel="noopener">WhatsApp Community</a></li>
            <li><a href="#" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="#" target="_blank" rel="noopener">YouTube</a></li>
            <li><a href="#" target="_blank" rel="noopener">LinkedIn</a></li>
          </ul>
        </div>
      </div>
      <div class="fbot">
        <span>© 2026 Bharat AI Academy · Charkhi Dadri, Haryana · Made with ❤️ for Bharat</span>
        <a href="#/admin-login" class="admin-link">Admin</a>
      </div>
    </div>
  `;
  footer.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) { e.preventDefault(); go(t.dataset.go); }
  });
  return footer;
}
