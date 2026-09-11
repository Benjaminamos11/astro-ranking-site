#!/usr/bin/env node
/**
 * check-seo.mjs — deterministic pre-deploy audit of a built Astro site.
 *
 * Usage:  node check-seo.mjs [dist-dir]      (default: ./dist)
 * Exit:   0 = no criticals, 1 = at least one critical (do not deploy)
 *
 * No dependencies. Reads built HTML only; writes nothing.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const DIST = process.argv[2] || 'dist';

if (!existsSync(DIST)) {
  console.error(`✖ "${DIST}" not found. Run \`npm run build\` first.`);
  process.exit(1);
}

// ── findings ────────────────────────────────────────────────────────────────
const findings = [];
const add = (sev, page, msg) => findings.push({ sev, page, msg });

// ── tiny HTML helpers (attribute order independent) ─────────────────────────
function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    out[m[1].toLowerCase()] = m[3] ?? m[4] ?? '';
  }
  for (const m of tag.matchAll(/\s([a-zA-Z-]+)(?=[\s>/])/g)) {
    const k = m[1].toLowerCase();
    if (!(k in out)) out[k] = '';
  }
  return out;
}
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((m) => m[0]);

function meta(html, key, value) {
  for (const t of tags(html, 'meta')) {
    const a = attrs(t);
    if ((a[key] || '').toLowerCase() === value.toLowerCase()) return a.content ?? '';
  }
  return null;
}
function link(html, rel) {
  for (const t of tags(html, 'link')) {
    const a = attrs(t);
    if ((a.rel || '').toLowerCase() === rel) return a;
  }
  return null;
}

// ── collect files ──────────────────────────────────────────────────────────
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else acc.push({ path: p, size: s.size });
  }
  return acc;
}

const all = walk(DIST);
const pages = all.filter((f) => extname(f.path) === '.html');

if (pages.length === 0) {
  console.error(`✖ No HTML files in "${DIST}".`);
  process.exit(1);
}

// ── per-page checks ────────────────────────────────────────────────────────
const titles = new Map();
const descriptions = new Map();

for (const { path, size } of pages) {
  const page = relative(DIST, path);
  const html = readFileSync(path, 'utf8');

  const robotsMeta = (meta(html, 'name', 'robots') || '').toLowerCase();
  const noindex = robotsMeta.includes('noindex');
  const is404 = /(^|\/)404\.html$/.test(page);
  const indexable = !noindex && !is404;

  // <html lang>
  const htmlTag = (html.match(/<html\b[^>]*>/i) || [''])[0];
  if (!attrs(htmlTag).lang) add('CRITICAL', page, 'Missing lang attribute on <html>.');

  // title
  const titleRaw = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const title = titleRaw ? titleRaw.replace(/\s+/g, ' ').trim() : '';
  if (!title) {
    add('CRITICAL', page, 'Missing <title>.');
  } else if (indexable) {
    if (title.length < 30) add('WARNING', page, `Title is short (${title.length} chars, aim 30–60): "${title}"`);
    else if (title.length > 60) add('WARNING', page, `Title is long (${title.length} chars, aim 30–60) and will be truncated in results.`);
    if (!titles.has(title)) titles.set(title, []);
    titles.get(title).push(page);
  }

  // description
  const desc = meta(html, 'name', 'description');
  if (!desc) {
    if (!is404) add('CRITICAL', page, 'Missing meta description.');
  } else if (indexable) {
    if (desc.length < 70) add('WARNING', page, `Description is short (${desc.length} chars, aim 70–160).`);
    else if (desc.length > 160) add('WARNING', page, `Description is long (${desc.length} chars, aim 70–160).`);
    if (!descriptions.has(desc)) descriptions.set(desc, []);
    descriptions.get(desc).push(page);
  }

  // canonical
  const canon = link(html, 'canonical');
  if (!canon && !is404) add('CRITICAL', page, 'Missing <link rel="canonical">.');
  else if (canon && !/^https?:\/\//i.test(canon.href || '')) {
    add('CRITICAL', page, `Canonical is not an absolute URL: "${canon.href}"`);
  }

  // OpenGraph + Twitter
  if (indexable) {
    for (const prop of ['og:title', 'og:description', 'og:image', 'og:url']) {
      if (!meta(html, 'property', prop)) add('WARNING', page, `Missing ${prop} (link previews will look broken).`);
    }
    if (!meta(html, 'name', 'twitter:card')) add('INFO', page, 'Missing twitter:card.');
  }

  // hreflang sanity
  const hreflangs = tags(html, 'link')
    .map(attrs)
    .filter((a) => a.hreflang)
    .map((a) => a.hreflang.toLowerCase());
  if (hreflangs.length > 0 && !hreflangs.includes('x-default')) {
    add('WARNING', page, 'hreflang set present but no x-default entry.');
  }

  // headings
  const levels = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((m) => Number(m[1]));
  const h1s = levels.filter((l) => l === 1).length;
  if (h1s === 0 && !is404) add('CRITICAL', page, 'No <h1> on the page.');
  if (h1s > 1) add('CRITICAL', page, `${h1s} <h1> elements — there must be exactly one.`);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      add('WARNING', page, `Heading level skips from h${levels[i - 1]} to h${levels[i]} (use CSS for size, not heading level).`);
      break;
    }
  }

  // JSON-LD
  const ld = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (ld.length === 0) {
    if (indexable) add('WARNING', page, 'No JSON-LD structured data.');
  } else {
    ld.forEach((m, i) => {
      try {
        JSON.parse(m[1]);
      } catch (e) {
        add('CRITICAL', page, `JSON-LD block ${i + 1} is not valid JSON: ${e.message}`);
      }
    });
  }

  // images
  let eager = 0;
  for (const t of tags(html, 'img')) {
    const a = attrs(t);
    const src = (a.src || a['data-src'] || '(unknown src)').split('?')[0].slice(-60);
    if (a.alt === undefined) add('CRITICAL', page, `Image without alt attribute: …${src}`);
    if (!a.width || !a.height) add('WARNING', page, `Image without width/height (causes layout shift): …${src}`);
    if ((a.loading || '').toLowerCase() !== 'lazy') eager++;
  }
  if (eager > 1) add('WARNING', page, `${eager} images are not lazy-loaded — only the hero should be eager.`);

  // page weight
  if (size > 150 * 1024) add('WARNING', page, `HTML is ${(size / 1024).toFixed(0)} kB — unusually heavy for one document.`);
}

// ── cross-page duplicates ──────────────────────────────────────────────────
for (const [title, where] of titles) {
  if (where.length > 1) {
    add('CRITICAL', where[0], `Duplicate <title> on ${where.length} pages ("${title.slice(0, 50)}…"): ${where.slice(0, 4).join(', ')}${where.length > 4 ? ' …' : ''}`);
  }
}
for (const [, where] of descriptions) {
  if (where.length > 1) {
    add('CRITICAL', where[0], `Duplicate meta description on ${where.length} pages: ${where.slice(0, 4).join(', ')}${where.length > 4 ? ' …' : ''}`);
  }
}

// ── site-level files ───────────────────────────────────────────────────────
const has = (f) => existsSync(join(DIST, f));

if (!has('robots.txt')) {
  add('CRITICAL', 'site', 'No robots.txt.');
} else {
  const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
  if (!/^\s*sitemap:\s*https?:\/\//im.test(robots)) {
    add('CRITICAL', 'site', 'robots.txt does not point at an absolute Sitemap URL.');
  }
  const aiBots = ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'Googlebot-Extended', 'ClaudeBot'];
  const missing = aiBots.filter((b) => !new RegExp(b, 'i').test(robots));
  if (missing.length) {
    add('INFO', 'site', `robots.txt does not mention AI crawlers: ${missing.join(', ')} (needed to appear in AI answers).`);
  }
}

if (!all.some((f) => /sitemap.*\.xml$/i.test(f.path))) {
  add('CRITICAL', 'site', 'No sitemap XML in the build output.');
}
if (!has('llm.txt') && !has('llms.txt')) {
  add('WARNING', 'site', 'No llm.txt / llms.txt — answer engines have no fact sheet to cite.');
}
if (!has('404.html')) add('WARNING', 'site', 'No 404 page in the build output.');

// ── asset budget ───────────────────────────────────────────────────────────
const kb = (b) => (b / 1024).toFixed(0);
const js = all.filter((f) => extname(f.path) === '.js');
const css = all.filter((f) => extname(f.path) === '.css');
const jsTotal = js.reduce((n, f) => n + f.size, 0);
const cssTotal = css.reduce((n, f) => n + f.size, 0);

if (jsTotal > 300 * 1024) {
  add('WARNING', 'site', `Total JS is ${kb(jsTotal)} kB across ${js.length} files — aim under 300 kB for a content site.`);
}
for (const f of all.filter((f) => f.size > 250 * 1024 && /\.(js|css|png|jpg|jpeg|webp|avif|gif|mp4)$/i.test(f.path))) {
  add('WARNING', 'site', `Large asset: ${relative(DIST, f.path)} (${kb(f.size)} kB).`);
}

// ── report ─────────────────────────────────────────────────────────────────
const order = { CRITICAL: 0, WARNING: 1, INFO: 2 };
const mark = { CRITICAL: '✖', WARNING: '▲', INFO: '·' };
findings.sort((a, b) => order[a.sev] - order[b.sev] || a.page.localeCompare(b.page));

const counts = { CRITICAL: 0, WARNING: 0, INFO: 0 };
for (const f of findings) counts[f.sev]++;

console.log(`\nSEO build check — ${pages.length} pages, ${kb(jsTotal)} kB JS, ${kb(cssTotal)} kB CSS\n`);

let lastSev = null;
for (const f of findings) {
  if (f.sev !== lastSev) {
    console.log(f.sev);
    lastSev = f.sev;
  }
  console.log(`  ${mark[f.sev]} ${f.page}\n      ${f.msg}`);
}

if (!findings.length) {
  console.log('All checks passed.\n');
} else {
  console.log(`\n${counts.CRITICAL} critical · ${counts.WARNING} warnings · ${counts.INFO} info\n`);
}

if (counts.CRITICAL > 0) {
  console.log('Do not deploy: fix the critical findings, then re-run.\n');
  process.exit(1);
}
console.log('No blocking issues. Continue to the SEO skills and Lighthouse.\n');
