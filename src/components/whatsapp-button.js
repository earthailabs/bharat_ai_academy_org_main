import { whatsappLink } from '../config/site.js';

export function renderWhatsappFloat() {
  const a = document.createElement('a');
  a.className = 'wa-float';
  a.href = whatsappLink('Hi, I want to know more about Bharat AI Academy programs.');
  a.target = '_blank';
  a.rel = 'noopener';
  a.title = 'WhatsApp us';
  a.setAttribute('aria-label', 'WhatsApp');
  a.textContent = '💬';
  return a;
}
