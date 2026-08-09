// Each .mode-glow section gets a --wash-glow (0-1) reflecting how close its
// own center is to the viewport's center, so the ambient aurora wash defined
// in global.css brightens on whichever section you're actually reading and
// dims on the ones you've scrolled past — a traveling light, not a fixed
// per-section property. Returns early under reduced motion, leaving
// global.css's static --wash-glow: 0.4 fallback in place.
//
// Rides raf-loop.js's shared tick rather than its own scroll listener — see
// that file's onTick for why.
import { onTick } from './raf-loop.js';

export function initPanelGlow(root = document) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const sections = Array.from(root.querySelectorAll('.mode-glow'));
  if (sections.length === 0) return;

  const update = () => {
    const viewportCenter = window.innerHeight / 2;

    sections.forEach((section) => {
      if (!(section instanceof HTMLElement)) return;
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);
      const range = window.innerHeight / 2 + rect.height / 2;
      const focus = range > 0 ? Math.max(0, 1 - distance / range) : 0;
      section.style.setProperty('--wash-glow', focus.toFixed(3));
    });
  };

  onTick(update);
  update();
}
