// Hand-rolled rather than the @astrojs/sitemap integration — this site has
// a small, known route list, so a single static endpoint covers it without
// adding a dependency.
import type { APIRoute } from 'astro';

const staticPaths = ['', 'what-we-do', 'how-it-works', 'pricing', 'privacy', 'terms'];

export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? '';

  const urls = staticPaths
    .map((path) => `  <url><loc>${base}/${path}</loc></url>`)
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
