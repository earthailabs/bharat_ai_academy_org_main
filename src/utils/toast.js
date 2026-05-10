import { el } from './dom.js';

export function toast(message, type = 'info', timeout = 3500) {
  const root = document.getElementById('toast-root');
  if (!root) return;
  const node = el('div', { class: `toast ${type}` }, message);
  root.appendChild(node);
  setTimeout(() => {
    node.style.opacity = '0';
    node.style.transition = 'opacity 0.2s';
    setTimeout(() => node.remove(), 220);
  }, timeout);
}
