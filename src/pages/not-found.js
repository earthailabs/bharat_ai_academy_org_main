import { go } from '../utils/router.js';

export function renderNotFound() {
  const view = document.createElement('div');
  view.className = 'page active';
  view.dataset.title = 'Not Found';
  view.innerHTML = `
    <section>
      <div class="container-x" style="text-align:center;max-width:520px;padding:60px 24px">
        <div style="font-size:4rem;margin-bottom:14px">🤔</div>
        <h2 style="font-size:1.6rem;font-weight:800;color:var(--dark);margin-bottom:10px">Page not found</h2>
        <p style="color:var(--muted);margin-bottom:24px">The page you're looking for doesn't exist or has moved.</p>
        <button class="btn-dk" data-go="home">← Go Home</button>
      </div>
    </section>
  `;
  view.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  });
  return view;
}
