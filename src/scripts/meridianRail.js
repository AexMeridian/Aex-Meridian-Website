// Spawns a brief knot (tick + section name) on the meridian rail each time
// a section boundary (.seam) passes into view — reuses the .seam markup
// and .eyebrow text every section already has, no new attributes needed.

export function initMeridianRail(root = document) {
  const rail = root.querySelector('.meridian-rail');
  const seams = root.querySelectorAll('.seam');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!rail || seams.length === 0 || prefersReducedMotion || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const label = entry.target.querySelector('.eyebrow')?.textContent?.trim();
        if (label) spawnKnot(rail, label);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40% 0px' }
  );

  seams.forEach((seam) => observer.observe(seam));
}

function spawnKnot(rail, label) {
  const progress =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sun-progress')) || 0;

  const knot = document.createElement('div');
  knot.className = 'meridian-rail-knot';
  knot.style.top = `${progress * 100}%`;

  const tick = document.createElement('span');
  tick.className = 'meridian-rail-knot-tick';

  const text = document.createElement('span');
  text.className = 'meridian-rail-knot-label';
  text.textContent = label;

  knot.append(tick, text);
  rail.appendChild(knot);

  requestAnimationFrame(() => knot.classList.add('is-active'));

  window.setTimeout(() => {
    knot.classList.remove('is-active');
    window.setTimeout(() => knot.remove(), 500);
  }, 1400);
}
