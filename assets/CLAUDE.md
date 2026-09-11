# <PROJECT NAME> — project rules for Claude

> Copied from the `astro-ranking-site` skill. Fill in every `<placeholder>` during
> setup. This file is read automatically at the start of every Claude Code session
> in this repo — it is what keeps the design and the SEO consistent months later,
> in sessions that have no memory of how the site was built.

## What this site is

- **Business:** <what it does, for whom, where>
- **Primary goal:** <the one action a visitor should take>
- **Live domain:** https://<example.com>
- **Languages:** <en, de> — default `<en>`
- **Host:** <Vercel / Netlify> · **Deploys from:** `main`

## Stack — decided, do not swap

| Layer | Choice |
|---|---|
| Framework | Astro <7.x>, `output: 'static'` |
| Styling | Tailwind <4> via `@tailwindcss/vite`, tokens in `src/styles/global.css` |
| Islands | <React / none> — only for genuine interactivity |
| Content | <Markdoc in src/content / Keystatic / Supabase loader> |
| Data | <Supabase / none> |
| Analytics | <Plausible> |
| Images | <Cloudinary / astro:assets> |

## Commands

```bash
npm run dev                                                   # local dev
npm run build                                                 # production build
npm run preview                                               # serve the build
node ~/.claude/skills/astro-ranking-site/scripts/check-seo.mjs dist   # pre-deploy gate
```

## Design system — the single source of truth

All tokens live in `src/styles/global.css` under `@theme`. **Never hardcode a
colour, font, radius, or shadow in a component.** If a value is missing, add a
token, then use it.

| Token | Value | Used for |
|---|---|---|
| `--color-ground` | `<#F0EEE9>` | page background |
| `--color-ink` | `<#111111>` | body text |
| `--color-muted` | `<#6B7280>` | secondary text |
| `--color-accent` | `<#8A6F4E>` | the one accent: links, CTAs |
| `--color-line` | `<#E5E2DC>` | borders, dividers |
| `--font-serif` | `<Cormorant Garamond>` | display headings only |
| `--font-sans` | `<Inter>` | everything else |

**Type scale** (stay on it, no in-between sizes):
`text-sm` captions · `text-base` body · `text-xl` lead · `text-3xl` h3 ·
`text-5xl` h2 · `text-7xl` h1.

**Spacing rhythm:** sections use `py-24` (`py-16` on mobile); content max width
`max-w-3xl` for text, `max-w-7xl` for full layouts. Gaps come from flex/grid
`gap-*`, never from per-element margins.

**Radius / shadow:** `rounded-<xl>` and `shadow-<sm>` only. Two options, not six.

**Motion:** transitions `<200ms>` with `ease-out`; respect
`prefers-reduced-motion`. No UI animation longer than `<300ms>`.

## Component inventory — reuse before creating

Check this list before writing any new component. If something close exists,
extend it with a prop instead of making a second version.

- `layout/` — `Navbar`, `Footer`
- `navigation/` — `Breadcrumbs`
- `ui/` — `Button`, `Card`, `Badge`, `Input`, `SectionHeading`, `<…>`
- `sections/<page>/` — one component per page section, prefixed with the page name

**One button component.** One card component. A second implementation of either is
a bug, not a variant.

## Page rules — every page, no exceptions

1. Wraps its content in `layouts/Layout.astro` and passes `title`, `description`,
   and `jsonLd`. Never ship the fallback title.
2. Exactly one `<h1>`, containing the page's primary keyword.
3. Headings nest properly (`h1` → `h2` → `h3`); size is CSS, not heading level.
4. Every image: `width`, `height`, `alt`, optimized source. One eager image per
   page (the hero), everything else `loading="lazy"`.
5. At least two internal links in from existing pages, with descriptive anchors.
6. Page file stays a thin composition; markup lives in section components.

### Keywords already targeted — do not cannibalize

| Page | Primary keyword |
|---|---|
| `/` | `<…>` |
| `<…>` | `<…>` |

Two pages competing for one keyword means both rank worse. Check this table before
adding a page.

## Performance budgets

LCP < 2.0 s · CLS < 0.05 · INP < 150 ms · total JS < 300 kB · hero image < 200 kB.
Lighthouse mobile: Performance ≥95, Accessibility ≥95, Best Practices 100, SEO 100.

## Never do this

- Hardcode a hex colour, font family, or spacing value in a component.
- Add a framework island for something that only displays content.
- Link Google Fonts directly, or add a third-party script without a reason.
- Invent facts in schema, `llm.txt`, or copy — addresses, prices, founding dates,
  certifications, and reviews come from the operator. Ask.
- Fabricate `aggregateRating` or review schema. It is a manual-action risk.
- Deploy without running the pre-deploy checker and confirming the host built your
  commit. **A push is not a deploy.**

## Before you finish any task here

1. `npm run build` — clean, zero warnings.
2. `node ~/.claude/skills/astro-ranking-site/scripts/check-seo.mjs dist` — no criticals.
3. New or changed page? Re-check the page rules above, one by one.
4. Say plainly what you changed, and what you did not verify.
