// The one requestAnimationFrame loop for the sun system. Everything derived
// from elevation — sky, stars, shadow geometry, accent hue, text warmth —
// is computed here once per frame and written to :root as CSS custom
// properties, so any element anywhere can opt into the dawn system just by
// referencing a var() instead of needing its own scroll listener.
//
// Existing per-component scroll listeners (panelGlow.js, scrollDrift.js,
// scrollProgress.js, Header.astro) are left reading window.scrollY directly
// for now — retiring them onto this loop is Phase 2 work (the horizon-lock
// camera), not Phase 1.

import { sun, setProgress } from '../state/sun.js';
import { initSky, paintSky, isSkyReady } from '../gl/sky.js';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const VELOCITY_DAMPING = 0.85;
// Below this, the damped velocity is visually indistinguishable from zero —
// safe to stop scheduling frames rather than tick forever at rest.
const SETTLE_VELOCITY_EPSILON = 0.05;

let smoothedVelocity = 0;
let lastScrollY = window.scrollY;
let rafId = null;
let ticking = false;

// Phase 2 of the consolidation this file's own header comment describes:
// other scroll-driven effects (panelGlow, scrollDrift, scrollProgress,
// Hero's drift, Header's scrolled state) register here instead of each
// installing their own window scroll listener + rAF throttle. They ride
// this loop's existing cadence — and go idle with it once scroll settles —
// rather than duplicating the throttle machinery five times over.
const tickListeners = new Set();

export function onTick(callback) {
  tickListeners.add(callback);
  return () => tickListeners.delete(callback);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex) {
  const v = hex.replace('#', '');
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function mixHex(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return `rgb(${Math.round(lerp(ar, br, t))}, ${Math.round(lerp(ag, bg, t))}, ${Math.round(lerp(ab, bb, t))})`;
}

function documentProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
}

// Stars hang on past the dead-blue hour, then dissolve fast — a plain
// linear fade would read as mechanical, so this is its own steep curve
// distinct from the dawnT used everywhere else.
function applyDerivedStyles(state) {
  const dawnT = smoothstep(-14, 8, state.elevation);
  const shadowT = smoothstep(-18, 8, state.elevation);
  const starOpacity = 1 - smoothstep(-8, -2, state.elevation);

  root.style.setProperty('--sun-elevation', state.elevation.toFixed(2));
  root.style.setProperty('--sun-azimuth', state.azimuth.toFixed(2));
  root.style.setProperty('--sun-progress', state.progress.toFixed(4));
  root.style.setProperty('--text-warmth', dawnT.toFixed(3));
  root.style.setProperty('--star-opacity', starOpacity.toFixed(3));

  const shadowLength = lerp(30, 6, shadowT);
  const angle = (state.azimuth * Math.PI) / 180;
  root.style.setProperty('--shadow-x', `${(Math.cos(angle) * shadowLength * 0.6).toFixed(1)}px`);
  root.style.setProperty(
    '--shadow-y',
    `${(lerp(20, 5, shadowT) + Math.sin(angle) * shadowLength * 0.15).toFixed(1)}px`
  );
  root.style.setProperty('--shadow-blur', `${lerp(10, 26, shadowT).toFixed(1)}px`);
  root.style.setProperty('--shadow-alpha', lerp(0.34, 0.09, shadowT).toFixed(3));

  root.style.setProperty('--accent-hue', lerp(205, 38, dawnT).toFixed(1));
  root.style.setProperty('--sky-top', mixHex('#050810', '#16233c', dawnT * 0.5));
  root.style.setProperty('--sky-horizon', mixHex('#0b111c', '#e8a259', dawnT));

  return starOpacity;
}

function tick() {
  const scrollY = window.scrollY;
  const rawVelocity = scrollY - lastScrollY;
  lastScrollY = scrollY;
  smoothedVelocity = reducedMotion
    ? 0
    : smoothedVelocity + (rawVelocity - smoothedVelocity) * (1 - VELOCITY_DAMPING);

  setProgress(documentProgress(), smoothedVelocity);
  const starOpacity = applyDerivedStyles(sun);
  if (isSkyReady()) {
    const normalizedVelocity = clamp(Math.abs(smoothedVelocity) / 30, 0, 1);
    paintSky(sun, starOpacity, normalizedVelocity);
  }
  tickListeners.forEach((fn) => fn());
}

// Runs continuously only while scroll velocity is still settling — once
// smoothedVelocity has damped down to nothing, there's nothing left for a
// frame to change (elevation tracks scroll position directly, not a lerp),
// so the loop goes idle instead of ticking at 60fps forever. onScroll wakes
// it back up on the next scroll event, same pattern as pointerLight.js.
function loop() {
  tick();
  if (Math.abs(smoothedVelocity) < SETTLE_VELOCITY_EPSILON) {
    rafId = null;
    return;
  }
  rafId = requestAnimationFrame(loop);
}

function onScroll() {
  if (reducedMotion) {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      tick();
      ticking = false;
    });
    return;
  }
  if (rafId === null) {
    rafId = requestAnimationFrame(loop);
  }
}

export function initRafLoop() {
  const canvas = document.getElementById('sky-canvas');
  if (canvas && !reducedMotion) initSky(canvas);

  tick();

  window.addEventListener('scroll', onScroll, { passive: true });
  if (!reducedMotion) {
    rafId = requestAnimationFrame(loop);
  }
}

export function stopRafLoop() {
  if (rafId) cancelAnimationFrame(rafId);
  window.removeEventListener('scroll', onScroll);
}
