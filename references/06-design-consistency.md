# Design consistency — how a site still looks like one site after 30 edits

Inconsistency is what makes a site feel amateur, and it never arrives as one big
mistake. It arrives as a fourth shade of grey, a second button, a section with
different padding, and a dark mode nobody checked.

## 1. Write the project's CLAUDE.md first

Before building page two, copy `assets/CLAUDE.md` to the project root and fill it
in: tokens, type scale, spacing rhythm, component inventory, keyword table.

This is the mechanism, not paperwork. A Claude session three months from now has no
memory of this conversation — it reads `CLAUDE.md`. Without it the site drifts with
every session. With it, the rules survive.

Update it whenever a decision changes. A stale `CLAUDE.md` is worse than none.

## 2. Tokens are the only source of colour and type

Define everything once in `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --color-ground: #F0EEE9;
  --color-ink:    #111111;
  --color-muted:  #6B7280;
  --color-accent: #8A6F4E;
  --color-line:   #E5E2DC;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans:  'Inter', system-ui, sans-serif;
}
```

Then audit for leaks — this should return nothing from `src/components`:

```bash
grep -rnE "#[0-9a-fA-F]{3,6}" src/components
```

A raw hex inside a component is how the fourth shade of grey is born.

## 3. One component per job

Before creating anything, search first:

```bash
ls src/components/ui && grep -rl -i "button" src/components/ui
```

If a `Button` exists, add a `variant` prop. Two button implementations means two
hover states, two focus rings, and two places to fix later.

Keep the inventory in `CLAUDE.md` current so the next session can check it without
reading every file.

## 4. A fixed vocabulary of values

Consistency comes from having few options:

- **Type scale:** six steps, nothing between them.
- **Spacing:** section padding is one value (plus one mobile value). Gaps come from
  `gap-*` on a flex/grid parent, never per-element margins that collapse.
- **Radius:** one, maybe two. **Shadow:** one, maybe two.
- **Content widths:** one for prose, one for wide layouts.
- **Motion:** one duration and one easing for UI transitions.

When a new value seems necessary, the honest question is whether an existing step
works. It usually does.

## 5. Every interactive element has all its states

A button is not done until it has default, hover, focus-visible (a real visible
ring — keyboard users exist), active, disabled, and loading if it triggers work.

Every list or data view needs loaded, empty, loading, and error states. Empty states
are where unfinished sites show most. Write them while building the component, not
after a bug report.

## 6. Dark mode is designed, not inverted

If the site has dark mode, check every page in it. Naive inversion produces
unreadable muted text and an accent that glows. Define the dark values as
deliberate choices in the token block, and verify contrast in both themes.

## 7. Responsive means checked, not assumed

Verify at 375 px, 768 px, and 1440 px. Specifically: headings that wrap to five
lines on mobile, tables that push the page sideways (wrap them in
`overflow-x: auto`), and tap targets under 44 px.

## 8. Use the design skills for judgement, tokens for consistency

The design skills (`taste-skill`, `impeccable`, `emil-design-eng`) decide *what it
should look like*. Tokens and `CLAUDE.md` make that decision stick across every
later session. You need both: taste without tokens drifts, and tokens without taste
are tidy but forgettable.

## Consistency check before finishing

- [ ] No raw hex, font-family, or px spacing values in components
- [ ] No duplicate component doing an existing component's job
- [ ] Type sizes and section padding come from the scale
- [ ] Hover, focus-visible, active, disabled, loading all present
- [ ] Empty, loading, and error states exist for every data view
- [ ] Checked in light and dark, at 375 / 768 / 1440 px
- [ ] `CLAUDE.md` updated if any rule or token changed
