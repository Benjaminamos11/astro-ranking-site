# astro-ranking-site

A Claude Code skill that builds **fast, top-ranking Astro websites** — and refuses to
let you deploy one that is missing a ranking signal.

It is an opinionated playbook, not a tutorial: seven phases with gates, a complete
SEO/GEO checklist, Lighthouse budgets, design-consistency rules, and a
dependency-free script that audits the built site and exits non-zero when something
important is missing.

Built for Claude Code; it also works with Codex, Cursor, and any agent that reads
`SKILL.md` files.

---

## Why this exists

Agents are good at making a page that looks finished. They are bad at remembering the
forty small things that decide whether the page ranks, loads fast, and still looks
like the same site after thirty edits. This skill encodes those forty things so they
happen every time, in the same order, verified rather than assumed.

---

## Install

```bash
git clone https://github.com/Benjaminamos11/astro-ranking-site.git \
  ~/.claude/skills/astro-ranking-site
```

Restart Claude Code. That's it — the skill is discovered automatically.

**Or just ask Claude:**

> Install the skill from https://github.com/Benjaminamos11/astro-ranking-site into ~/.claude/skills

**Project-scoped instead of global:** clone into `.claude/skills/` inside a repo.

---

## Use it

Plain language is enough — the skill triggers on intent:

| Say this | What happens |
|---|---|
| "Build me a website for my bakery in Zug" | Full seven-phase build, starting with the brief |
| "Make this page rank better" | SEO/GEO checklist pass over an existing site |
| "Why is my Lighthouse score bad?" | Performance diagnosis against the budgets |
| "Set up Search Console and Plausible" | Phase 7, including API access for Claude |
| "Check this site before I deploy" | The build checker plus the SEO skills |

Claude asks six questions first — goal, audience, primary keyword per page, pages,
languages, brand. **The keyword question is not optional:** pages are built around a
search intent, not decorated afterwards.

If you write in German, it answers in German.

---

## The seven phases

| Phase | What happens | Gate before moving on |
|---|---|---|
| **1. Brief** | Goal, audience, one primary keyword per page, page list, languages | The brief is restated and confirmed |
| **2. Scaffold** | Newest Astro resolved from npm, Tailwind, adapter, fonts, `site` set | `npm run build` succeeds |
| **3. Architecture** | Folder structure, the Layout `<head>` contract, section components, i18n | Every page routes through `Layout.astro` |
| **4. Design** | Direction via the design skills, then tokens + project `CLAUDE.md` | No raw hex values in components |
| **5. SEO / GEO** | Titles, descriptions, canonicals, hreflang, JSON-LD, sitemap, robots, `llm.txt` | Checklist walked route by route |
| **6. Verify & ship** | Build, checker, SEO skills, Lighthouse, deploy, confirm the deploy | Checker exits 0, Lighthouse targets met |
| **7. Measure** | Search Console, Bing, Plausible, API keys Claude can query | A real visit appears in the dashboard |

---

## What's inside

```
astro-ranking-site/
├── SKILL.md                          # the spine: phases, hard rules, delegation
├── references/
│   ├── 01-stack-setup.md             # resolve newest Astro, config baseline, data layer
│   ├── 02-architecture.md            # folders, section pattern, i18n, Layout contract
│   ├── 03-seo-geo-checklist.md       # every head signal, JSON-LD, site files, content rules
│   ├── 04-performance.md             # island strategy, images, fonts, CSS, budgets
│   ├── 05-verify-and-ship.md         # the four gates + launch-day checklist
│   ├── 06-design-consistency.md      # tokens, component reuse, states, dark mode
│   └── 07-analytics-and-consoles.md  # Search Console, Bing, Plausible, API keys
├── assets/
│   ├── Layout.astro                  # the SEO contract, ready to copy
│   ├── CLAUDE.md                     # project rules template (design consistency)
│   ├── sitemap.xml.ts                # sitemap endpoint with hreflang alternates
│   ├── robots.txt                    # including AI-crawler permissions
│   ├── llm.txt                       # the answer-engine fact sheet
│   └── .env.example                  # every env var the setup expects
└── scripts/
    └── check-seo.mjs                 # the pre-deploy gate (no dependencies)
```

---

## The pre-deploy checker

```bash
node ~/.claude/skills/astro-ranking-site/scripts/check-seo.mjs dist
```

Walks every built HTML file and reports what is missing. Exit code 1 means do not
deploy.

```
SEO build check — 2 pages, 0 kB JS, 0 kB CSS

CRITICAL
  ✖ about/index.html
      Duplicate meta description on 2 pages: about/index.html, index.html
  ✖ index.html
      Missing lang attribute on <html>.
  ✖ index.html
      No <h1> on the page.
  ✖ site
      No sitemap XML in the build output.
WARNING
  ▲ index.html
      Image without width/height (causes layout shift): …/a.jpg

7 critical · 9 warnings · 2 info

Do not deploy: fix the critical findings, then re-run.
```

It checks: titles and descriptions (presence, length, **uniqueness across pages**),
canonicals (present and absolute), `<html lang>`, OpenGraph and Twitter tags,
hreflang `x-default`, exactly one `<h1>`, heading-level skips, JSON-LD validity,
image `alt` and dimensions, eager-image count, `robots.txt` with an absolute
`Sitemap:` line and AI-crawler entries, sitemap presence, `llm.txt`, a 404 page,
total JS weight, and oversized assets.

Pure Node, no `node_modules`, reads only — safe to run anywhere, including CI.

---

## The non-negotiable rules

1. `output: 'static'` unless a feature genuinely needs a server.
2. No framework island for something that only displays content.
3. Every page through `Layout.astro` with `title`, `description`, `jsonLd`.
4. Every image: `width`, `height`, `alt`, optimized source. One eager image per page.
5. Exactly one `<h1>`, containing the primary keyword.
6. Nothing ships unverified: checker green, Lighthouse ≥95 and SEO 100 on mobile.
7. **Never invent facts** for schema, `llm.txt`, or copy. No fabricated
   `aggregateRating` — invented review schema is a manual-action risk.

---

## Design consistency

Phase 4 does two things: it picks a direction using whichever design skills you have
installed, then it **writes that decision down** in a project-root `CLAUDE.md` —
tokens, type scale, spacing rhythm, component inventory, and the keyword table.

This is the part most setups skip. A Claude session three months from now has no
memory of how the site was built; it reads `CLAUDE.md`. Without that file, every
session adds a fourth shade of grey and a second button component.

---

## Keys and secrets

Phase 7 sets up Search Console and Plausible API access so Claude can answer questions
like *"which pages lost impressions this month?"*. The rules are strict:

- Claude **never asks for a key value**, and you never paste one into a chat.
- Keys go in `.env.local` (gitignored). The repo holds `.env.example` with empty values.
- Production secrets live in the host dashboard.
- Google service-account JSON lives **outside** the repo, `chmod 600`.
- Grant the narrowest scope that works — "Restricted" is enough in Search Console.

---

## Requirements

- Node.js 18+, Git
- Claude Code (or another agent that reads `SKILL.md`)
- A host account (Vercel or Netlify) for deploys

**Optional, used when present:** `taste-skill`, `impeccable`, `emil-design-eng` for
design; `seo-page`, `seo-audit`, `seo-geo`, `seo-schema` for verification;
`seo-unlighthouse` or Chrome DevTools MCP for Lighthouse. None are required — the
skill degrades gracefully and says what it could not run.

---

## License

MIT — see [LICENSE](LICENSE). Use it, fork it, change it.
