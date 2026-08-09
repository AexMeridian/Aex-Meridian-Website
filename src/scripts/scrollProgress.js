// Rides raf-loop.js's shared tick rather than its own scroll listener — see
// that file's onTick for why.
import { onTick } from './raf-loop.js';

export function initScrollProgress(root = document) {
  const bar = root.querySelector('.scroll-progress');
  if (!(bar instanceof HTMLElement)) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  };

  onTick(update);
  update();
}
