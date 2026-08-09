// Replaces reveal.js. Content no longer fades up — it rises into place
// (translateY + scaleY resolve to rest, compositor-only, no opacity
// entrance) the first time an element enters view.
//
// Deliberately keeps the existing [data-reveal] attribute rather than
// renaming it sitewide — every page already carries this markup, and only
// the mechanics behind it change.

export function initRise(root = document) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = new Set([...root.querySelectorAll('[data-reveal]'), ...root.querySelectorAll('.seam')]);

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const settleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          settleObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
  );
  targets.forEach((el) => settleObserver.observe(el));
}
