---
name: astro-ranking-site
description: Build or upgrade a website the house way — newest Astro (7.x today), static output, Tailwind, near-perfect Lighthouse, and a complete SEO/GEO layer (canonical, hreflang, JSON-LD, sitemap, robots, llm.txt) verified by a script before ship. Use for any new site, homepage, landing page, marketing page, portfolio, or business site; for "make it rank", "make it faster", "Lighthouse", "Core Web Vitals", "SEO-ready page"; and when scaffolding a fresh Astro project or bringing an existing one up to standard.
---

# Astro Ranking Site — the house playbook

This is how we build sites: **static Astro, zero JS by default, every ranking
signal present before launch, verified by a script instead of by vibes.**

Work in phases and **stop at each gate.** Never jump from "idea" to "styling" —
a beautiful page with no canonical tag and a 4 MB hero image does not rank.

If the operator writes in German, explain everything in German (code and code
comments stay English).

## The six phases

| Phase | What happens | Reference to load |
|---|---|---|
| 1. Brief | Goal, audience, primary keyword per page, pages, languages | — (ask, below) |
| 2. Scaffold | Newest Astro + Tailwind + adapter, config, fonts | `references/01-stack-setup.md` |
| 3. Architecture | Folder structure, Layout contract, sections, i18n, content | `references/02-architecture.md` |
| 4. Design | Visual direction, then tokens + `CLAUDE.md` so it stays consistent | below + `references/06-design-consistency.md` |
| 5. SEO / GEO | Head tags, schema, sitemap, robots, llm.txt, internal links | `references/03-seo-geo-checklist.md` |
| 6. Verify & ship | Build, run the checker, SEO skills, Lighthouse, deploy | `references/05-verify-and-ship.md` |
| 7. Measure | Search Console, Bing, Plausible, API keys Claude can use | `references/07-analytics-and-consoles.md` |

Performance rules apply throughout: `references/04-performance.md`.

Load a reference **when you reach that phase**, not all at once.

## Phase 1 — Brief (always first, keep it to six questions)

Ask these, then restate the answers as a short brief and get a yes:

1. What is the site for, and what should a visitor *do* (call, book, buy, write)?
2. Who is the audience, and in which country/region?
3. What is the **one** primary search term per page you want to win?
4. Which pages at launch? (Home + 3–6 is a healthy start.)
5. One language or several? Which is the default?
6. Is there a brand already — logo, colors, fonts — or do we invent one?

Do not skip question 3. Pages are built around a search intent; SEO is not
decoration applied afterwards.

## Phase 4 — Design (delegate, do not improvise)

Use the design skills rather than inventing a look:

- **`taste-skill`** or **`impeccable`** — overall visual judgment: layout,
  spacing, typography, anti-generic rules.
- **`emil-design-eng`** — motion, micro-interactions, the feel of polish.
- **`soft-skill`** / **`minimalist-skill`** / **`brutalist-skill`** — pick exactly
  one when the direction is already decided. Never mix two.
- **`imagegen-frontend-web`** — generate screen concepts first when the operator
  cannot describe what they want in words.
- **`redesign-skill`** — when upgrading an existing site instead of starting fresh.

House defaults when nothing is specified: one serif display face plus one clean
sans for body text, a warm neutral ground rather than pure white, and exactly
one accent color.

**Then lock the decision in before building page two:** copy `assets/CLAUDE.md`
to the project root and fill in the tokens, type scale, spacing rhythm, component
inventory, and keyword table. A later session has no memory of this conversation —
it reads `CLAUDE.md`. Without that file the site drifts every time someone works
on it. Details in `references/06-design-consistency.md`.

## Hard rules (never negotiable)

1. **`output: 'static'`** unless a feature genuinely needs a server. Static pages
   are what make Lighthouse green and hosting cheap.
2. **No framework island without a reason.** A section that only displays content
   is `.astro`. Interactivity (forms, menus, carousels) may be an island with
   `client:visible` or `client:idle` — `client:load` only above the fold.
3. **Every page goes through `Layout.astro`** and sets `title`, `description`,
   and `jsonLd`. No page ships with the fallback title.
4. **Every image** has `width`, `height`, `alt`, and an optimized source. Exactly
   one image per page may be eager; everything else is lazy.
5. **One `<h1>` per page**, containing the primary keyword naturally.
6. **Nothing ships unverified.** `scripts/check-seo.mjs` must pass and Lighthouse
   mobile must be ≥95 performance / 100 SEO.
7. **Never invent facts** for schema, llm.txt, or copy — addresses, prices,
   founding years, certifications, and reviews come from the operator. Ask.

## Starter assets

`assets/` holds working templates to copy into a fresh project. Adapt every
placeholder; never ship them as-is:

- `Layout.astro` — the SEO contract: canonical, hreflang, OG/Twitter, JSON-LD
  slot, AI discovery, critical CSS, theme-before-paint script.
- `sitemap.xml.ts` — sitemap endpoint with hreflang alternates.
- `robots.txt` — including explicit AI-crawler permissions.
- `llm.txt` — the fact sheet answer engines read.

`scripts/check-seo.mjs` is the gate: it audits the built `dist/` and fails on
missing ranking signals. Run it before every deploy.
