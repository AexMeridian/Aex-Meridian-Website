// The single source of truth for the site's dawn system. Every derived
// visual — sky, stars, shadows, accent hue, text warmth — reads from this
// object instead of scroll position directly, so freezing/overriding
// elevation here (see setElevationOverride) is enough to drive the whole
// site from a dev slider with no scrolling involved.

export const SUN_RANGE = {
  MIN_ELEVATION: -18,
  MAX_ELEVATION: 8,
  MIN_AZIMUTH: 95,
  MAX_AZIMUTH: 128,
};

export const sun = {
  elevation: SUN_RANGE.MIN_ELEVATION,
  azimuth: SUN_RANGE.MIN_AZIMUTH,
  velocity: 0,
  progress: 0,
  horizonY: 0.62,
};

const listeners = new Set();
let overridden = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function notify() {
  for (const fn of listeners) fn(sun);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setProgress(progress, velocity = 0) {
  if (overridden) return;
  sun.progress = clamp(progress, 0, 1);
  sun.elevation =
    SUN_RANGE.MIN_ELEVATION + sun.progress * (SUN_RANGE.MAX_ELEVATION - SUN_RANGE.MIN_ELEVATION);
  sun.azimuth =
    SUN_RANGE.MIN_AZIMUTH + sun.progress * (SUN_RANGE.MAX_AZIMUTH - SUN_RANGE.MIN_AZIMUTH);
  sun.velocity = velocity;
  notify();
}

// Used by the dev overlay: pins elevation directly and ignores scroll until
// released, which is what makes "drag the slider with scroll frozen" work
// without literally having to lock document scroll.
export function setElevationOverride(elevation) {
  overridden = true;
  sun.elevation = clamp(elevation, SUN_RANGE.MIN_ELEVATION, SUN_RANGE.MAX_ELEVATION);
  sun.progress =
    (sun.elevation - SUN_RANGE.MIN_ELEVATION) / (SUN_RANGE.MAX_ELEVATION - SUN_RANGE.MIN_ELEVATION);
  sun.azimuth =
    SUN_RANGE.MIN_AZIMUTH + sun.progress * (SUN_RANGE.MAX_AZIMUTH - SUN_RANGE.MIN_AZIMUTH);
  sun.velocity = 0;
  notify();
}

export function clearElevationOverride() {
  overridden = false;
}

export function isOverridden() {
  return overridden;
}
