// One camera, one projection. Every [data-depth] element gets a translateY
// offset on top of normal document flow, proportional to how far its depth
// sits from the reference plane — near elements (small depth, meters) lead
// the scroll, far elements (large depth) lag behind it, and the whole page
// reads as one 3D volume instead of hand-tuned per-layer parallax speeds.
//
// The offset is bounded to the element's own on-screen travel (its distance
// from viewport center), not to absolute scrollY, so it can't drift the
// element arbitrarily far from its natural resting position on a long page.

export const REFERENCE_DEPTH = 6; // meters — matches the typical card depth; elements here scroll ~normally
const PARALLAX_STRENGTH = 0.32;

export function depthFactor(depthMeters) {
  return (REFERENCE_DEPTH / depthMeters - 1) * PARALLAX_STRENGTH;
}

// distanceFromCenter: element's vertical distance (px) from viewport center,
// positive when the element is below center. Returns the extra translateY.
export function projectOffset(depthMeters, distanceFromCenter) {
  return -distanceFromCenter * depthFactor(depthMeters);
}
