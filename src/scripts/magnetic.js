export function initMagnetic(root = document) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  if (prefersReducedMotion || isCoarsePointer) return;

  const elements = Array.from(root.querySelectorAll('[data-magnetic]'));
  if (!elements.length) return;

  const PULL = 0.32;
  const MAX_OFFSET = 14;
  const PADDING = 40;

  // Larger surfaces (cards) opt into a much gentler pull via
  // data-magnetic="card" — the button defaults above would make anything
  // bigger than a button visibly swim under the cursor.
  const CARD_PULL = 0.09;

  let ticking = false;
  let lastEvent = null;

  const update = () => {
    const e = lastEvent;
    if (!e) return;
    elements.forEach((el) => {
      if (!(el instanceof HTMLElement)) return;

      const pull = el.dataset.magnetic === 'card' ? CARD_PULL : PULL;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const radius = Math.max(rect.width, rect.height) / 2 + PADDING;

      if (Math.hypot(dx, dy) < radius) {
        const x = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx * pull));
        const y = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dy * pull));
        el.style.transform = `translate(${x}px, ${y}px)`;
      } else {
        el.style.transform = '';
      }
    });
    ticking = false;
  };

  window.addEventListener(
    'mousemove',
    (e) => {
      lastEvent = e;
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}
