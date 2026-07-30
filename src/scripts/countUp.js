export function initCountUp(root = document) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = root.querySelectorAll('[data-count-target]');

  function renderFinal(el) {
    const target = el.dataset.countTarget;
    const suffix = el.dataset.countSuffix || '';
    el.textContent = target + suffix;
  }

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach(renderFinal);
    return;
  }

  function animate(el) {
    const target = parseFloat(el.dataset.countTarget);
    const suffix = el.dataset.countSuffix || '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        renderFinal(el);
      }
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  elements.forEach((el) => observer.observe(el));
}
