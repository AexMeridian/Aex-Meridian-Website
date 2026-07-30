// Shared color-grading treatment for hero videos — one place, so every
// page pulling in a warm-toned clip (Pricing's dawn seascape, plus the
// legal pages which reuse that same clip) gets an identical grade instead
// of a slightly-different value hand-tuned per page. The other hero clips
// (home, What We Do, How It Works) are already cool-toned and use no
// filter at all — this exists specifically to pull the one warm outlier
// into the same navy/teal family.
export const PRICING_VIDEO_FILTER = 'saturate(0.78) hue-rotate(-14deg) brightness(0.92) contrast(1.04)';
