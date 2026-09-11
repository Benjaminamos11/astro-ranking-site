# Performance — how the Lighthouse score stays green

Targets, mobile and throttled: **Performance ≥95, Accessibility ≥95, Best
Practices 100, SEO 100.** Core Web Vitals: LCP < 2.0 s, CLS < 0.05, INP < 150 ms.

Performance is decided by the choices below, not by optimizing at the end.

## 1. Ship as little JavaScript as possible

Static Astro sends zero JS by default. Everything you add, you add deliberately.

| Situation | Directive |
|---|---|
| Interactive and above the fold (nav, theme toggle) | `client:load` |
| Interactive but below the fold (form, carousel, map) | `client:visible` |
| Nice-to-have, never blocking (analytics widget, chat) | `client:idle` |
| Only needed on large screens | `client:media="(min-width: 768px)"` |

A section that merely renders content is an `.astro` component and costs nothing.
If you are reaching for a framework island to display a list, stop.

Avoid heavyweight animation libraries for simple work: CSS transitions and
`@keyframes` handle hover, reveal, and fade with no bundle. Reach for a JS
animation library only for genuinely orchestrated sequences, and load it inside an
island, never in the layout.

## 2. Images are the usual LCP villain

- Always set `width` and `height` — missing dimensions cause layout shift (CLS).
- Serve AVIF/WebP through a CDN transform (`f_auto,q_auto,w_<width>`) or
  `astro:assets`.
- Provide a `srcset` so phones do not download desktop-sized files.
- Exactly **one** eager image per page (the hero): `loading="eager"` plus
  `fetchpriority="high"`. Everything else `loading="lazy" decoding="async"`.
- Hero images belong under roughly 200 KB after transform. A 3 MB upload is an
  instant LCP failure.
- Add `<link rel="preconnect">` to the image CDN origin in the head.

## 3. Fonts

- Use Astro's `fonts` config with a self-hosting provider; it subsets and emits
  preloads automatically. Two families maximum, two weights each.
- Render `<Font cssVariable="..." preload />` in the head for each family.
- Always declare a real fallback stack so first paint has glyphs.
- Never link Google Fonts directly — an extra DNS lookup, an extra connection, and
  a render-blocking stylesheet.

## 4. CSS

- `build.inlineStylesheets: 'auto'` so the shared stylesheet is fetched and cached
  once instead of being copied into every page.
- Inline the genuinely critical above-the-fold rules in a `<style is:inline>` block
  in the Layout: background and text color, body font, the nav's position. Then the
  linked stylesheet arriving a moment later causes no flash.
- Keep that inline block under roughly 1 KB. It is a flash preventer, not a second
  stylesheet.

## 5. Theme without a flash

If the site has a dark mode, read the stored preference in a **blocking inline
script in the head**, before first paint. A theme applied by a framework component
after hydration produces a visible white flash on every navigation.

## 6. Third-party scripts

Each one costs real time. Analytics is acceptable (the host's own is lightest).
Anything else — chat widgets, heatmaps, embedded video, tag managers — needs a
reason, and loads with `client:idle`, behind a click, or inside a facade.

Embed video with a poster image that loads the player only on click. A YouTube
iframe on page load costs over 1 MB.

## 7. Build-time over request-time

Resolve data at build time (content collections, custom loaders) rather than
fetching in the browser. A static page with data baked in beats a fast skeleton
with a spinner, for both LCP and crawlers.

## 8. Verify, never assume

`npm run build`, then the checker and Lighthouse (Phase 6). Checking after each
feature is cheaper than a rescue mission before launch.
