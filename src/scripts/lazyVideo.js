// Defers non-hero ambient video fetch/decode until the element is actually
// near the viewport. Hero videos stay eager (first thing visible on load),
// but mid-page and closing-CTA videos shouldn't compete with the hero's own
// video for bandwidth on first paint — autoplay forces a fetch regardless of
// the preload hint, so the source has to be withheld via data-src instead.
// Loads once and plays; these are short muted loops, not worth the added
// complexity of pausing/resuming as they scroll in and out of view.
export function initLazyVideo(root = document) {
  const videos = Array.from(root.querySelectorAll('video[data-src]'));
  if (videos.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) return;
        video.src = video.dataset.src;
        if (!prefersReducedMotion) video.play().catch(() => {});
        obs.unobserve(video);
      });
    },
    { rootMargin: '50% 0px 50% 0px' }
  );

  videos.forEach((video) => observer.observe(video));
}
