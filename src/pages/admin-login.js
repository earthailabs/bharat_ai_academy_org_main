import { go } from '../utils/router.js';
import { signInWithPassword, isAdmin } from '../services/auth.js';
import { toast } from '../utils/toast.js';

export function renderAdminLogin() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Admin';
  view.innerHTML = `
    <section>
      <div class="container-x" style="max-width:420px;padding-top:40px">
        <div class="cform">
          <h3>Admin Sign In</h3>
          <p style="color:var(--muted);font-size:0.85rem;margin-bottom:16px">Authorized personnel only.</p>
          <form id="admin-form">
            <div class="fg"><label>Email</label><input name="email" type="email" required autocomplete="username" /></div>
            <div class="fg"><label>Password</label><input name="password" type="password" required autocomplete="current-password" /></div>
            <button class="btn-dk" type="submit" style="width:100%;justify-content:center">Sign In →</button>
          </form>
        </div>
      </div>
    </section>
  `;
  view.querySelector('#admin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Signing in…';
    const { email, password } = Object.fromEntries(new FormData(e.target).entries());
    const { error } = await signInWithPassword(email, password);
    btn.disabled = false; btn.textContent = 'Sign In →';
    if (error) { toast(error.message, 'error'); return; }
    const ok = await isAdmin();
    if (!ok) { toast('This account is not an admin', 'error'); return; }
    go('admin');
  });
  return view;
}
