# Phase 7 — Search Console, analytics, and API access

A site you cannot measure is a site you cannot improve. Set all of this up at
launch, not "later" — Search Console data only accumulates from the day the
property is verified.

## Security rules for every key on this page

1. **Claude never asks for a key value, and the operator never pastes one into a
   chat.** The operator creates the key in the service's dashboard and writes it
   into the file directly.
2. Keys live in **`.env.local`**, which is in `.gitignore`. The repo contains only
   `.env.example` with empty values.
3. Claude reads keys as **environment variables at runtime** (`process.env.X`) and
   never prints, echoes, or commits them.
4. Production secrets go in the **host's dashboard** (Vercel/Netlify environment
   variables), never in the repo.
5. Grant the **narrowest scope** the job needs, and rotate anything ever exposed.

A leaked analytics key is a nuisance; a leaked Google service-account key can
expose much more. Treat that one as the sensitive one.

## A. Google Search Console — the ranking source of truth

### Verify the property

Prefer a **Domain property** (DNS verification): it covers `www`, non-`www`,
`http`, and `https` in one property.

1. <https://search.google.com/search-console> → **Add property** → **Domain**.
2. Enter `example.com` (no protocol, no `www`).
3. Google shows a TXT record. Add it at the domain registrar:
   `TXT  @  google-site-verification=<token>`.
4. Wait for DNS propagation (minutes, sometimes hours), then click **Verify**.

No DNS access? Use **URL prefix** → **HTML file**: download the `google*.html`
file, drop it in `public/`, rebuild, deploy, then verify. Astro serves anything in
`public/` at the site root.

### Submit the sitemap

**Sitemaps** → enter `sitemap.xml` → Submit. Then **URL Inspection** on the most
important page → **Request indexing**. Repeat once per new page.

### Also do Bing (five minutes, real traffic)

<https://www.bing.com/webmasters> → Add site → **Import from Google Search
Console**. Bing feeds ChatGPT's web results, so this matters for AI visibility too.

### API access, so Claude can read the data

1. <https://console.cloud.google.com> → create a project.
2. **APIs & Services → Library** → enable **Google Search Console API**.
3. **IAM & Admin → Service Accounts** → create one → **Keys → Add key → JSON**.
   The file downloads once. Move it outside the repo, e.g.
   `~/.config/gcp/<project>-gsc.json`, and `chmod 600` it.
4. Copy the service-account email (`…@….iam.gserviceaccount.com`).
5. In Search Console: **Settings → Users and permissions → Add user** → paste that
   email → permission **Restricted** (read access is enough for reporting).
6. Point the environment at the file:
   `GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcp/<project>-gsc.json"`
   and `GSC_PROPERTY="sc-domain:example.com"` (that prefix is the form a Domain
   property takes; URL-prefix properties use the full URL instead).

With those set, the `seo-google` skill and any script can query Search Analytics
for clicks, impressions, CTR, and average position per query and per page.

## B. Plausible Analytics — light, cookie-free, EU-hosted

Chosen over Google Analytics because it is roughly 1 kB instead of ~50 kB, sets no
cookies, collects no personal data, and therefore generally needs no cookie banner
(confirm against your own legal requirements). The dashboard is also readable in a
minute rather than an afternoon.

### Set up

1. Create an account at <https://plausible.io> (or self-host — it is open source).
2. **Add a website** → enter the domain exactly as it appears live, without
   protocol (`example.com`).
3. In `Layout.astro`, uncomment the analytics line and set `data-domain`:

```html
<script defer data-domain="example.com" src="https://plausible.io/js/script.js"></script>
```

Script variants are combinable — include only what you use:

| Variant | Adds |
|---|---|
| `script.outbound-links.js` | automatic outbound-link clicks |
| `script.file-downloads.js` | download tracking |
| `script.tagged-events.js` | custom events via CSS classes |
| `script.hash.js` | hash-based routing |

Combined example: `script.outbound-links.tagged-events.js`.

4. Deploy, open the site, and confirm the dashboard shows your visit. **Unverified
   analytics is the most common launch failure** — it looks installed and records
   nothing, usually because `data-domain` does not match the live domain.

### Custom events (the conversions that matter)

Track the action the site exists for — a form submit, a phone-number click:

```js
window.plausible?.('Contact Form Submitted');
```

Then mark it as a **goal** in the site's Plausible settings so it shows as a
conversion rather than a raw event.

### Optional: first-party proxy to reduce blocking

Serving the script from your own domain means fewer blocked measurements. On
Vercel, add to `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/js/script.js", "destination": "https://plausible.io/js/script.js" },
    { "source": "/api/event",    "destination": "https://plausible.io/api/event" }
  ]
}
```

Then load `/js/script.js` instead of the plausible.io URL. Follow Plausible's
current proxy guide rather than guessing — the endpoint details matter.

### API access, so Claude can read the numbers

1. Plausible → **Account settings → API keys → New API key**. Copy it once.
2. Put it in `.env.local`: `PLAUSIBLE_API_KEY=...` plus
   `PLAUSIBLE_SITE_ID=example.com`.
3. The Stats API is a single `POST https://plausible.io/api/v2/query` with a
   `Bearer` token, taking `site_id`, `metrics`, and `date_range`. Check their Stats
   API docs for the exact payload before writing a query — it is versioned.

## C. What Claude can then do for the operator

Once both are wired up, these become ordinary requests:

- "Which pages lost impressions this month?" (Search Console)
- "Which queries do we rank 5–15 for?" — the cheapest ranking wins available
- "Did the new landing page convert better than the old one?" (Plausible goals)
- "Write three pages targeting queries where we get impressions but no clicks."

Claude reads the keys from the environment; it is never asked to store, repeat, or
commit them.

## Setup checklist

- [ ] Search Console domain property verified (DNS TXT preferred)
- [ ] `sitemap.xml` submitted; indexing requested for the most important page
- [ ] Bing Webmaster Tools added via GSC import
- [ ] GCP project created, Search Console API enabled
- [ ] Service account created, JSON key stored outside the repo, `chmod 600`
- [ ] Service-account email added as a Restricted user in Search Console
- [ ] `GOOGLE_APPLICATION_CREDENTIALS` and `GSC_PROPERTY` set
- [ ] Plausible site added, `data-domain` matches the live domain exactly
- [ ] A real visit confirmed in the Plausible dashboard
- [ ] Primary conversion tracked as a custom event and marked as a goal
- [ ] `PLAUSIBLE_API_KEY` and `PLAUSIBLE_SITE_ID` in `.env.local`
- [ ] `.env.local` gitignored; `.env.example` committed with empty values
- [ ] Production secrets set in the host dashboard
