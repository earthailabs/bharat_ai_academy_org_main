import { el } from '../utils/dom.js';

let activeRoot = null;

export function openModal(contentNode, { onClose } = {}) {
  closeModal();
  const root = document.getElementById('modal-root');
  if (!root) return;

  const close = () => {
    bd.style.opacity = '0';
    setTimeout(() => bd.remove(), 180);
    activeRoot = null;
    onClose && onClose();
    document.removeEventListener('keydown', escListener);
  };

  const escListener = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', escListener);

  const bd = el('div', {
    class: 'modal-bd',
    onClick: (e) => { if (e.target === bd) close(); },
  });
  const card = el('div', { class: 'modal' }, [
    el('button', { class: 'modal-x', onClick: close, 'aria-label': 'Close' }, '✕'),
    contentNode,
  ]);
  bd.appendChild(card);
  root.appendChild(bd);
  activeRoot = bd;
  return { close };
}

export function closeModal() {
  if (activeRoot) activeRoot.remove();
  activeRoot = null;
}
