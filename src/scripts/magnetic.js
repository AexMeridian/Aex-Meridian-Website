export function initMagnetic(root = document) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  if (prefersReducedMotion || isCoarsePointer) return;

  const elements = Array.from(root.querySelectorAll('[data-magnetic]'));
  if (!elements.length) return;

  const PULL = 0.32;
  const MAX_OFFSET = 14;
  const PADDING = 40;

  window.addEventListener('mousemove', (e) => {
    elements.forEach((el) => {
      if (!(el instanceof HTMLElement)) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const radius = Math.max(rect.width, rect.height) / 2 + PADDING;

      if (Math.hypot(dx, dy) < radius) {
        const x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx * PULL));
        const y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dy * PULL));
        el.style.transform = `translate(${x}px, ${y}px)`;
      } else {
        el.style.transform = '';
      }
    });
  });
}
