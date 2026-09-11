# Phase 2 — Stack & setup

## Always resolve the newest version yourself

Never hardcode a version from memory. Check first:

```bash
npm view astro version
npm view tailwindcss version
```

Astro 7.x is the current line (Astro 6 is the previous major). If the resolved
major is newer than what is written here, trust the resolved version and skim
`https://docs.astro.build/en/guides/upgrade-to/` for that major before scaffolding.

## Scaffold

```bash
npm create astro@latest <project-name> -- --template minimal --typescript strict --no-git
cd <project-name>
```

Then add only what the project actually needs — nothing speculative:

```bash
npx astro add tailwind            # styling (always)
npx astro add vercel              # or: netlify — whichever host the operator uses
npx astro add react               # ONLY if interactive islands are needed
npx astro add markdoc             # ONLY if editable long-form content is needed
```

`npx astro add` writes the config and installs matching versions. Do not
hand-edit `package.json` versions afterwards.

## Config baseline

`astro.config.mjs` — the house baseline:

```js
// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://example.com',        // REQUIRED: canonical + sitemap depend on it
  output: 'static',
  adapter: vercel(),
  build: {
    // 'auto' inlines small stylesheets and links large ones, so one cached
    // stylesheet is fetched once instead of being duplicated into every page.
    // Critical above-the-fold CSS stays inline in Layout.astro.
    inlineStylesheets: 'auto',
  },
  vite: { plugins: [tailwindcss()] },
  integrations: [],                    // add react()/markdoc() only if used
  fonts: [
    { name: 'Cormorant Garamond', cssVariable: '--font-serif', provider: fontProviders.fontsource() },
    { name: 'Inter',              cssVariable: '--font-sans',  provider: fontProviders.fontsource() },
  ],
});
```

Notes that matter:

- **`site` is not optional.** Canonical URLs, hreflang, and the sitemap all derive
  from it. Set it before writing any page.
- **Tailwind goes through `@tailwindcss/vite`**, not the legacy `@astrojs/tailwind`
  integration. Tailwind 4 is configured in CSS (`@import "tailwindcss"` plus
  `@theme`), not in a `tailwind.config.js`.
- **Fonts use Astro's built-in `fonts` API.** It self-hosts, subsets, and generates
  preloads. Never hand-link Google Fonts — that is a render-blocking third-party
  request and costs Lighthouse points.

## Data & content layer — pick the lightest thing that works

| Need | Use |
|---|---|
| Copy the developer edits | Markdown/Markdoc in `src/content/` |
| Copy the *client* edits | Keystatic (`@keystatic/astro`) on top of content collections |
| Dynamic records (listings, posts, leads) | Supabase, read through a content-collection custom loader |
| Client-side state (theme, modal, cart) | `nanostores` + `@nanostores/persistent` — never Redux |
| Forms / email | An API route plus the host's function runtime |

A custom loader keeps database records inside Astro's content layer, so pages stay
static and are built at deploy time rather than queried on every visit:

```ts
// src/content.config.ts
const postsLoader = {
  name: 'supabase-posts',
  load: async ({ store }) => {
    store.clear();
    const { data, error } = await supabase.from('posts').select('*').eq('status', 'published');
    if (error) { console.error(error.message); return; }   // fail loud, build empty
    for (const post of data) store.set({ id: post.slug, data: post });
  },
};
```

## Images

Use a transforming CDN (Cloudinary is the house default) with a small helper that
injects `f_auto,q_auto,w_<width>` and builds a `srcset`. Never ship an
untransformed upload — originals are routinely 3–6 MB and destroy LCP.

For images committed to the repo, use `<Image />` / `<Picture />` from
`astro:assets` instead; it does the same job at build time.

## Environment variables

- Public values: `PUBLIC_*` in `.env`, committed as `.env.example` with empty values.
- Secrets (service keys, API tokens): set them in the host dashboard, never in the
  repo. `.env` stays in `.gitignore`.
