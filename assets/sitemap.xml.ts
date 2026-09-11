/**
 * sitemap.xml.ts — copy to src/pages/sitemap.xml.ts
 *
 * A hand-written endpoint instead of @astrojs/sitemap, because it gives control
 * over hreflang alternates and lets database-backed routes be included. For a
 * purely static single-language site, `npx astro add sitemap` is simpler — use
 * that instead.
 *
 * CRITICAL: the trailing slash here must match what Layout.astro emits as the
 * canonical URL. Telling Google that /about and /about/ are both canonical is a
 * real ranking bug.
 */
import type { APIRoute } from 'astro';

const LOCALES = ['en', 'de'] as const; // set to ['en'] for a single-language site

/** Every indexable route. Never list noindex, admin, or API routes. */
const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'yearly' },
  { path: '/imprint', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const SITE = (site ?? new URL('https://example.com')).origin;
  const today = new Date().toISOString().split('T')[0];
  const urls: string[] = [];

  const withSlash = (p: string) => (p === '/' ? '/' : `${p}/`);

  const entry = (
    loc: string,
    suffix: string,
    priority: string,
    changefreq: string,
    lastmod: string,
  ) => {
    const alts = LOCALES.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}/${l}${suffix}" />`,
    ).join('\n');
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/${LOCALES[0]}${suffix}" />`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alts}
${xDefault}
  </url>`;
  };

  for (const { path, priority, changefreq } of STATIC_ROUTES) {
    const suffix = withSlash(path);
    for (const lang of LOCALES) {
      urls.push(entry(`${SITE}/${lang}${suffix}`, suffix, priority, changefreq, today));
    }
  }

  // ── Database-backed routes (delete this block if there are none) ──────────
  // const { data: posts } = await supabase
  //   .from('posts').select('slug, lang, updated_at').eq('status', 'published');
  // for (const post of posts ?? []) {
  //   const suffix = `/journal/${post.slug}/`;
  //   urls.push(entry(
  //     `${SITE}/${post.lang}${suffix}`, suffix, '0.6', 'monthly',
  //     (post.updated_at ?? today).slice(0, 10),
  //   ));
  // }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
