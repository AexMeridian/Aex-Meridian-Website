// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Needed for canonical URLs, sitemap.xml, and absolute og:/twitter: image
  // URLs — without this Astro.site is undefined and those all silently
  // fall back to relative paths, which several social-preview crawlers
  // don't resolve correctly.
  site: 'https://aexmeridian.co',
  // Every internal link and the hand-rolled sitemap already omit the
  // trailing slash — making that authoritative instead of Astro's default
  // 'ignore' closes off a duplicate-content path (/pricing vs /pricing/)
  // that the canonical tag would otherwise have to paper over.
  trailingSlash: 'never',
  // Off by default — the toolbar's fixed-position overlay was repeatedly
  // mistaken for a real site element during local review. It never ships
  // (dev/preview-only), but disabling it here keeps local screenshots
  // honest without relying on everyone remembering that.
  devToolbar: {
    enabled: false,
  },
  redirects: {
    // "Our Work" was folded into What We Do — keep any existing links or
    // bookmarks to the old path resolving.
    '/our-work': '/what-we-do',
    // The Website Cost Guide was folded into Pricing (same numbers, same
    // rationale, one page) — same reasoning.
    '/how-much-does-a-website-cost': '/pricing',
  },
});
