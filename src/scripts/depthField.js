// Wires [data-depth="<meters>"] elements to the camera projection in
// state/camera.js. Only elements currently near the viewport are computed
// each frame — IntersectionObserver adds/removes them from the active set,
// so offscreen sections cost nothing between visits, matching the rest of
// the site's rAF-throttled scroll-listener pattern (panelGlow.js,
// scrollDrift.js) rather than depending on raf-loop.js internals.

import { projectOffset } from '../state/camera.js';

export function initDepthField(root = document) {
  const elements = Array.from(root.querySelectorAll('[data-depth]'));
  if (elements.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // static resting position is the reduced-motion state

  const active = new Set();
  let ticking = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          active.add(entry.target);
        } else {
          active.delete(entry.target);
          entry.target.style.transform = '';
          entry.target.style.willChange = '';
        }
      });
    },
    { rootMargin: '25% 0px 25% 0px' }
  );

  elements.forEach((el) => observer.observe(el));

  function update() {
    const viewportCenter = window.innerHeight / 2;
    active.forEach((el) => {
      const depth = parseFloat(el.dataset.depth);
      if (!Number.isFinite(depth) || depth <= 0) return;
      const rect = el.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
      const offset = projectOffset(depth, distanceFromCenter);
      el.style.willChange = 'transform';
      el.style.transform = `translateY(${offset.toFixed(1)}px)`;
    });
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  update();
}
