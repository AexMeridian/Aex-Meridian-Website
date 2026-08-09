// Generalizes Hero.astro's own drift technique to any [data-scroll-drift]
// texture layer: as the element travels through the viewport, its own
// --tex-drift custom property sweeps across a small, capped px range (the
// attribute's value, default 24), which each element's CSS reads via
// background-position. Reads as layered depth on the aurora-mountains
// texture sections rather than flat navy with content on top.
//
// Rides raf-loop.js's shared tick rather than its own scroll listener — see
// that file's onTick for why.
import { onTick } from './raf-loop.js';

export function initScrollDrift(root = document) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const configs = Array.from(root.querySelectorAll('[data-scroll-drift]')).map((el) => ({
    el,
    max: Number(el.dataset.scrollDrift) || 24,
  }));

  if (configs.length === 0) return;

  const update = () => {
    const viewportHeight = window.innerHeight;

    configs.forEach(({ el, max }) => {
      if (!(el instanceof HTMLElement)) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height + viewportHeight;
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / total));
      el.style.setProperty('--tex-drift', `${((progress - 0.5) * 2 * max).toFixed(1)}px`);
    });
  };

  onTick(update);
  update();
}
