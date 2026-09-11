# Phase 3 — Architecture & structure

## Folder layout

```
src/
  layouts/
    Layout.astro              # the ONE layout every page uses (SEO contract)
  pages/
    index.astro               # redirect or default-language entry
    404.astro
    sitemap.xml.ts            # sitemap endpoint (prerender = true)
    [lang]/                   # only when multilingual
      index.astro
      <page>.astro
  components/
    layout/                   # Navbar, Footer
    navigation/               # Breadcrumbs
    sections/                 # ONE component per page section
      <page-name>/            # grouped by the page they belong to
        ServicesHero.astro
        ServicesList.astro
    ui/                       # buttons, cards, small reusable pieces
  content/
    pages/<page>/             # editable copy, one folder per page
  i18n/
    ui.ts                     # translation dictionary
    utils.ts                  # useTranslations(), getStaticLang()
  lib/                        # helpers: cdn image, slugs, supabase client
  styles/
    global.css                # @import "tailwindcss" + @theme tokens
public/
  robots.txt  llm.txt  llms.txt  favicon.ico  apple-touch-icon.png
```

## The section pattern (most important structural rule)

**Page files are thin compositions. All markup lives in section components.**

```astro
---
// src/pages/[lang]/services.astro
import Layout from "../../layouts/Layout.astro";
import ServicesHero from "../../components/sections/services/ServicesHero.astro";
import ServicesList from "../../components/sections/services/ServicesList.astro";
import ServicesCTA  from "../../components/sections/services/ServicesCTA.astro";
import { useTranslations, type Lang } from "../../i18n/utils";

export function getStaticPaths() {
  return [{ params: { lang: 'en' } }, { params: { lang: 'de' } }];
}

const lang = Astro.params.lang as Lang;
const t = useTranslations(lang);

const jsonLd = { /* see 03-seo-geo-checklist.md */ };
---

<Layout title={t('services.title')} description={t('services.description')} jsonLd={jsonLd}>
  <ServicesHero lang={lang} />
  <ServicesList lang={lang} />
  <ServicesCTA  lang={lang} />
</Layout>
```

Why: a page you can read in 20 lines is a page you can restructure and reorder.
Sections stay independently reviewable, and a section can move to another page
without untangling it.

Naming: prefix section components with the page (`AboutHero`, `ContactForm`) so
30 files in `sections/` stay unambiguous.

## Multilingual sites

Use a `[lang]` dynamic segment with `getStaticPaths` — never duplicated page trees.

```ts
// src/i18n/ui.ts
export const languages = { en: 'English', de: 'Deutsch' } as const;
export const defaultLang = 'en';
export const ui = {
  en: { 'nav.home': 'Home',  'hero.title': 'Welcome' },
  de: { 'nav.home': 'Start', 'hero.title': 'Willkommen' },
} as const;
```

```ts
// src/i18n/utils.ts
import { ui, defaultLang } from './ui';
export type Lang = keyof typeof ui;

export function useTranslations(lang: Lang) {
  return (key: keyof typeof ui[typeof defaultLang]) => ui[lang][key] ?? ui[defaultLang][key];
}

export function getStaticLang(url: URL): Lang {
  const seg = url.pathname.split('/')[1];
  return (seg in ui ? seg : defaultLang) as Lang;
}
```

Rules:

- Translate the **content**, keep the **path shape** identical across languages
  wherever possible — that makes hreflang derivable automatically.
- When a translated page lives at a different path (articles with localized
  slugs), that page must pass explicit `alternates` to `Layout`.
- When no translation exists, pass `alternates={null}`. Emitting an hreflang that
  points at a 404 is worse than emitting none.

## The Layout contract

`Layout.astro` is the single place that owns the `<head>`. Its props are the
contract every page fills in:

| Prop | Required | Purpose |
|---|---|---|
| `title` | yes | `<title>`, `og:title`, `twitter:title` |
| `description` | yes | meta description + OG/Twitter description |
| `jsonLd` | yes in practice | structured data object, serialized into a script tag |
| `ogImage` | no | social preview; falls back to the site default |
| `noindex` | no | keeps legacy/duplicate routes out of the index |
| `alternates` | no | explicit hreflang pair; `undefined` derives it, `null` disables it |

Never add head tags inside a page or a section. If something belongs in the head,
it belongs in the Layout behind a prop. That is what keeps the SEO audit passing
on every route instead of only on the ones someone remembered.

## Styling

Tailwind 4, configured in CSS:

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-ground: #F0EEE9;
  --color-ink:    #000000;
  --color-accent: #8A6F4E;
  --font-serif: 'Cormorant Garamond', serif;
  --font-sans:  'Inter', sans-serif;
}
```

Define tokens once in `@theme` and use utility classes in markup. Do not scatter
raw hex values through components — a palette change must be a one-file edit.
