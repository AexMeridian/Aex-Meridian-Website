// Shared color-grading treatment for hero videos — one place, so every
// page pulling in this clip (the legal pages, and Pricing's own inline
// video) gets an identical grade instead of a slightly-different value
// hand-tuned per page. Grayscale first, everything after just shapes
// contrast/exposure within that — the homepage hero is the one place on
// the site that still keeps its original color.
export const PRICING_VIDEO_FILTER = 'grayscale(1) contrast(1.1) brightness(0.9)';
