# Aex Meridian — Marketing Site

Astro static site for Aex Meridian, LLC. Plain CSS, vanilla JS, no framework beyond Astro itself. Deployed to Cloudflare Pages.

## Stack

- **Astro** (`output: "static"`) — every page in `src/pages/` builds to static HTML.
- **Cloudflare Pages Functions** — `functions/api/contact.js` handles the contact form independently of the Astro build; it runs on Cloudflare's edge, not through Astro's own routing.
- **Resend** — sends contact-form email server-side from the Pages Function.

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the production build locally |

## Environment variables

Copy `.env.example` for reference — the one variable it documents, `RESEND_API_KEY`, is never read from a local `.env` file. It must be set as a **secret** in the Cloudflare Pages dashboard (Settings → Environment variables) for the deployed contact form to send email. Without it, the form still works end-to-end but returns a "not configured yet" message instead of sending.

## Pricing data

`src/data/pricing.ts` is the single source of truth for every price shown on the site — never hardcode a number in a page or component. Update the numbers there and every page that quotes them (Home, What We Do, Pricing, the cost guide, the vertical landing pages, Terms) stays in sync.

## Adding a vertical landing page

`src/pages/websites-for-[slug].astro` is a dynamic route driven by `src/data/verticals.ts`. Add an entry to that array (slug, copy, features, FAQs) and the page, its footer link, and its sitemap entry all appear automatically — no template edits needed.

## Deploy

Push to `main` on GitHub; Cloudflare Pages is configured to build automatically (`npm run build`, output directory `dist`). Node version is pinned via `.nvmrc` / `engines.node` in `package.json`.
