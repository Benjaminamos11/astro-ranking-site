# Phase 6 — Verify & ship

Four gates, in order. Do not skip ahead because the page "looks right" in the
browser — every launch problem found later was visible in one of these.

## Gate 1 — It builds clean

```bash
npm run build
```

Zero errors and zero warnings. A build warning is a bug you have not met yet.

## Gate 2 — The deterministic checker

```bash
node ~/.claude/skills/astro-ranking-site/scripts/check-seo.mjs dist
```

It walks every built HTML file and reports missing ranking signals: titles,
descriptions, canonicals, OG tags, `<html lang>`, JSON-LD validity, heading
structure, image `alt` and dimensions, duplicate titles or descriptions across
pages, oversized assets, and the presence of `robots.txt`, `sitemap.xml`,
`llm.txt`, and a 404 page.

**Exit code 1 means do not deploy.** Fix every CRITICAL, then re-run. Warnings are
judgement calls — decide consciously rather than ignoring them.

## Gate 3 — The SEO skills

Now bring in the specialists, which see what a regex cannot:

- **`seo-page`** — deep single-page analysis of the most important route.
- **`seo-audit`** — full-site audit once the site is reachable (local preview or a
  deploy preview URL).
- **`seo-geo`** — answer-engine readiness: citability, `llm.txt` quality, AI
  crawler access.
- **`seo-schema`** — proper structured-data validation.

Run `npm run preview` first so the skills can fetch the real built pages, then give
them the preview URL.

## Gate 4 — Lighthouse

Measure, do not estimate. Either the Chrome DevTools MCP (`lighthouse_audit`
against the preview URL, mobile profile) or:

```bash
npx unlighthouse --site http://localhost:4321
```

The `seo-unlighthouse` skill wraps this when installed.

Required before launch: **Performance ≥95, Accessibility ≥95, Best Practices 100,
SEO 100** on mobile. Below that, return to `references/04-performance.md` — it is
usually one oversized image or one eager island.

## Then ship

1. Commit with a message that says what changed and why.
2. Push, then confirm the host actually built that commit — **a push is not a
   deploy.** Check the host dashboard or CLI for a deployment matching your commit
   hash. Some projects are connected to an account other than the one you are
   pushing from, and then nothing goes live at all.
3. Once live, verify on the real domain: view source on one page and confirm the
   canonical, hreflang, and JSON-LD are present in the delivered HTML.
4. Submit the sitemap in Google Search Console and Bing Webmaster Tools, and
   request indexing for the most important page.

## Launch-day checklist

- [ ] Build clean, checker passes, Lighthouse targets met
- [ ] Real domain connected, HTTPS, `www` vs non-`www` redirect settled
- [ ] `site` in `astro.config` matches the live domain exactly
- [ ] Search Console and Bing verified, sitemap submitted
- [ ] Analytics recording a test visit
- [ ] Contact form actually delivers a test message
- [ ] Every page read once on a real phone
