// Hash-based router. Simple, works on Cloudflare Pages without any rewrite config.

const routes = new Map();
let currentRoute = null;
let notFoundFn = null;

export function defineRoute(name, render) {
  routes.set(name, render);
}

export function setNotFound(fn) {
  notFoundFn = fn;
}

export function go(name, params = {}) {
  const qs = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  window.location.hash = `#/${name}${qs}`;
}

export function getRoute() {
  return currentRoute;
}

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const params = qs ? Object.fromEntries(new URLSearchParams(qs)) : {};
  return { path: path || 'home', params };
}

async function dispatch() {
  const { path, params } = parseHash();
  currentRoute = { path, params };
  const render = routes.get(path) || notFoundFn;
  if (!render) return;
  const view = await render(params);
  const app = document.getElementById('app');
  if (!app || !view) return;
  // Smooth swap
  app.replaceChildren(view);
  // Always scroll to top on route change
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  // Update active nav
  document.querySelectorAll('[data-route]').forEach((n) => {
    n.classList.toggle('active', n.dataset.route === path);
  });
  // Update document title
  const title = view.dataset && view.dataset.title;
  document.title = title ? `${title} · Bharat AI Academy` : 'Bharat AI Academy';
}

export function startRouter() {
  window.addEventListener('hashchange', dispatch);
  if (!window.location.hash) window.location.hash = '#/home';
  else dispatch();
}
