# Phase 5 — SEO & GEO checklist

Two audiences now: **search engines** (Google, Bing) and **answer engines**
(ChatGPT, Perplexity, Google AI Overviews, Claude). GEO is the second half, and
most sites skip it entirely.

## A. Per-page head signals — all required

| Signal | Rule |
|---|---|
| `<title>` | 30–60 characters. Primary keyword near the front, brand at the end. Unique across the whole site. |
| `meta description` | 70–160 characters. Written to earn the click, not to repeat the title. Unique site-wide. |
| `<link rel="canonical">` | Absolute URL, on every page, matching the real URL **including the trailing slash**. |
| `hreflang` | One `<link>` per language plus `x-default`, only when a translation truly exists. |
| OpenGraph | `og:type`, `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:site_name`, `og:locale`. |
| Twitter card | `twitter:card=summary_large_image`, title, description, image. |
| `<html lang>` | Real language code; regional codes like `de-CH` when the market is regional. |
| JSON-LD | At least one valid block per page (see below). |

Trailing slashes are a real ranking bug, not pedantry: if the canonical tag says
`/services` and the sitemap says `/services/`, you have told Google two different
things about one page. Pick one form and make Layout, sitemap, and internal links
agree.

## B. Structured data (JSON-LD)

Use one `@graph` array with `@id` cross-references instead of several loose blocks
— entities that point at each other get understood as one business.

```js
const SITE = 'https://example.com';
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      "name": "Example GmbH",
      "url": SITE,
      "logo": `${SITE}/apple-touch-icon.png`,
      "foundingDate": "2007",                       // only if the operator confirmed it
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Example Street 1",
        "addressLocality": "Zug",
        "postalCode": "6300",
        "addressCountry": "CH"
      },
      "telephone": "+41 00 000 00 00",
      "email": "hello@example.com"
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      "url": SITE,
      "inLanguage": lang === 'de' ? 'de-CH' : 'en-US',
      "publisher": { "@id": `${SITE}/#organization` }
    },
    // Then the page-specific type:
    // Service / ProfessionalService / Product / Article / FAQPage / BreadcrumbList
  ]
};
```

Per page type: a service page adds `Service`, an article adds `Article` with
`datePublished` and `author`, a page with questions adds `FAQPage`, and any page
below the root adds `BreadcrumbList`. **Never fabricate `aggregateRating`, review
counts, prices, or awards** — invented review schema is a manual-action risk, not
a clever trick.

## C. Site-level files

1. **`sitemap.xml`** — every indexable URL, with `<xhtml:link rel="alternate">`
   entries for translations. Use the endpoint in `assets/sitemap.xml.ts` when
   routes come from a database; `@astrojs/sitemap` is fine for purely static
   sites. Never list noindex or admin routes.
2. **`robots.txt`** — allow crawling, disallow `/admin` and `/api`, point at the
   sitemap with an absolute URL, and **explicitly allow the AI crawlers**
   (`GPTBot`, `ChatGPT-User`, `PerplexityBot`, `Googlebot-Extended`, `ClaudeBot`).
   If you want to appear in AI answers, you have to let them read.
3. **`llm.txt` / `llms.txt`** — a plain-text fact sheet for answer engines:
   identity, founding, address, phone, email, services, service area, languages,
   and the distinguishing facts. This is the highest-leverage GEO file and almost
   nobody ships it. See `assets/llm.txt`.
4. **`404.astro`** — a real page with navigation back into the site.

## D. On-page content rules

- **One `<h1>`**, containing the primary keyword in natural language.
- Headings form a real outline: `h1` → `h2` → `h3`, never skipping a level for
  visual reasons. Size is CSS, not semantics.
- The primary keyword appears in the title, the h1, the first 100 words, and at
  least one h2 — and nowhere else forced.
- Every page answers its search intent **above the fold**. A visitor arriving from
  Google must see within one screen that they are in the right place.
- **Internal links are a ranking signal.** Every new page gets at least two inbound
  links from existing pages, with descriptive anchor text ("Zug relocation
  services", never "click here"). No orphan pages.
- Images carry descriptive `alt` text that serves blind visitors first and search
  engines second. Decorative images get `alt=""`.
- Add an FAQ section with real questions when the intent is informational — it wins
  both featured snippets and AI citations.

## E. Before leaving this phase

Walk the checklist route by route, not once for the site. The most common failure
is a perfect homepage plus four subpages that share its description tag.
