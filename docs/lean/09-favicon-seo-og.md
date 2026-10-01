# Spec 09: a Danish flag favicon, a social card, and the search basics

## Goal

The site gets a favicon (the Danish flag), a link preview that looks right when shared (Open Graph
and Twitter cards with a proper image), and the basic search signals it lacks today (canonical URL,
robots, sitemap, structured data, a no-JavaScript message). No page, route or visible UI changes.

The four binary files are **already in the repository**, made by the owner's agent from the art
direction: `public/favicon.svg` (the Dannebrog, 37:28, red `#C8102E` with a white cross whose arms are
4 wide, the vertical arm from x 12 to 16 and the horizontal from y 12 to 16), `public/favicon.ico`
(16, 32 and 48 px, transparent), `public/apple-touch-icon.png` (180 × 180, the flag on the sky colour)
and `public/og.png` (1200 × 630, the wordmark, the headline and the five houses). Do not change,
recreate or optimise them; reference them.

The public origin is `https://hej.cocode.dk`. It may appear in `index.html`, `public/robots.txt`,
`public/sitemap.xml` and `README.md` only (social cards need absolute URLs).

## `index.html`

Replace the head's title, description and theme colour, and add the rest. Final values, character
for character; keep the existing charset, viewport and pre-paint script as they are.

- `<title>`: `Hej. Learn Danish by hearing it and saying it`
- `<meta name="description" content="A free, private way for English speakers to learn Danish: hear each word, say it out loud and light a window on your street. No account, no ads.">`
- `<link rel="canonical" href="https://hej.cocode.dk/">`
- `<meta name="robots" content="index, follow, max-image-preview:large">`
- `<meta name="color-scheme" content="light dark">`
- `<meta name="theme-color" content="#E5ECF1" media="(prefers-color-scheme: light)">` and
  `<meta name="theme-color" content="#0B1730" media="(prefers-color-scheme: dark)">` (these two
  replace the single `theme-color`)
- Icons, relative so the build works at any path: `<link rel="icon" href="./favicon.svg" type="image/svg+xml">`,
  `<link rel="icon" href="./favicon.ico" sizes="48x48">`,
  `<link rel="apple-touch-icon" href="./apple-touch-icon.png">`
- Open Graph, each as `<meta property="…" content="…">`: `og:type` `website`; `og:site_name` `Hej.`;
  `og:title` the title above; `og:description` the description above; `og:url`
  `https://hej.cocode.dk/`; `og:locale` `en_US`; `og:image` `https://hej.cocode.dk/og.png`;
  `og:image:type` `image/png`; `og:image:width` `1200`; `og:image:height` `630`; `og:image:alt`
  `Hej. with five painted Danish houses, their windows lit: Learn Danish by hearing it and saying it.`
- Twitter, each as `<meta name="…" content="…">`: `twitter:card` `summary_large_image`;
  `twitter:title`, `twitter:description` (the same two strings); `twitter:image`
  `https://hej.cocode.dk/og.png`; `twitter:image:alt` the same alt text.
- Structured data, one `<script type="application/ld+json">` holding exactly this object
  (formatting free):
  `{"@context":"https://schema.org","@type":"WebApplication","name":"Hej.","url":"https://hej.cocode.dk/","description":` the description above `,"applicationCategory":"EducationalApplication","operatingSystem":"Any","inLanguage":"en","isAccessibleForFree":true,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"teaches":"Danish","author":{"@type":"Person","name":"Babak","url":"https://cocode.dk"}}`
- In the body, before `<div id="root">`: `<noscript><p style="font:17px/1.45 system-ui,sans-serif;margin:24px;max-width:36em">Hej. teaches English speakers to hear and say Danish. It needs JavaScript to run: turn it on and reload.</p></noscript>`
  This is the one visible exception to "no visible UI changes": it shows only when scripts are
  off, when nothing of the app renders. Its design reference is the Not found page's text-only
  look (left-aligned text, nothing else on the page) without the top bar. The linked stylesheet
  still loads with scripts off, so the page keeps the app's own page background and text colour
  from `tokens.css` (sky and ink, light or dark by the device); the paragraph inherits them and
  adds only the font, margin and measure in the inline style above. No tokens are referenced from
  the HTML. Today the `html, body` rule in `src/styles/tokens.css` sets only the background, so the
  text would be the browser's black on a dark sky in dark mode: add one declaration to that rule,
  `color: var(--ink)`. That is the only change allowed in `tokens.css` and the only change under
  `src/` besides tests.

## New files

- `public/robots.txt`, exactly three lines: `User-agent: *`, `Allow: /`,
  `Sitemap: https://hej.cocode.dk/sitemap.xml` (each ending in a newline).
- `public/sitemap.xml`: the standard `urlset` (namespace `http://www.sitemaps.org/schemas/sitemap/0.9`)
  with one `url` whose `loc` is `https://hej.cocode.dk/`; no `lastmod`, `changefreq` or `priority`.
  The app's other pages are hash routes, which search engines do not index separately, so the
  single URL is right.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
Tests read the files from disk (`node:fs`, paths relative to the project root) and prove, at least:

1. `index.html` has every tag above with the exact values; the title is at most 60 characters and
   the description is 110 to 160; every absolute URL in the head and the JSON-LD starts with
   `https://hej.cocode.dk/` or is the `https://schema.org`, `https://cocode.dk` or w3 namespace
   URL named above; there is exactly one `<title>`, one description, one canonical.
2. The JSON-LD parses as JSON and has the fields above with the right values.
3. `public/og.png` is a PNG whose IHDR says 1200 × 630 and is under 300 KB; `apple-touch-icon.png`
   is a PNG of 180 × 180; `favicon.ico` starts with the ICO signature `00 00 01 00` and holds
   three images; `favicon.svg` has `viewBox="0 0 37 28"`, a `#C8102E` field and the two white arms
   at the stated positions.
4. `robots.txt` and `sitemap.xml` are exactly as specified (the sitemap parsed with a regex: one
   `<loc>`, correct namespace).
5. After `npm run build`, `dist/` contains the four assets, `robots.txt` and `sitemap.xml`, and
   `dist/index.html` references the icons with `./` URLs (this test reads `dist/` and fails with a
   message saying to run `npm run build` first if it is missing).
6. `src/styles/tokens.css`'s `html, body` rule has both the background and `color: var(--ink)`, and
   the existing contrast test (ink on sky, both themes) still passes.
7. The existing static checks (no network calls, no `http://` or `https://` in `src/` outside
   tests) still pass; the origin appears nowhere in `src/`.

Note on item 3: assert format facts (signature, dimensions, viewBox, colours) and, for `og.png`
only, the upper bound of 300 KB; never an exact byte size of any of the four binaries. That they
are unmodified is checked by review of the diff.

## Answers to the grill

- The author in the JSON-LD is the owner, Babak, with his site `https://cocode.dk`. No email or
  other personal data goes in the page.
- The Twitter and OG tags carry the same strings on purpose; one change must not drift from the other.
- `og:locale` is `en_US`: the page is English; the Danish is the subject, not the language of the UI.
- The no-JavaScript paragraph is the only visible change; the style attribute above is the one inline
  style allowed (it is static HTML, outside `src/`). It keeps the app's token-based page colours; it
  does not use the browser's default colours.
- No web app manifest, no `hreflang`, no analytics, no extra pages in the sitemap.
- The builder may update `src/deploy.test.ts` or other tests only to raise counts or to keep them
  passing with the new `index.html`.

## Out of scope

Any change under `src/` other than tests and the one `color` declaration in `tokens.css`, the four binary assets, `CLAUDE.md`, `docs/design/`,
a manifest, a service worker, analytics, and the About page (spec 10).
