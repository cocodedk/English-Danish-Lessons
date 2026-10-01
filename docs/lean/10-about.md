# Spec 10: an About page, with the maker, cocode.dk, dates and credits

## Goal

A new page, `About`, tells a visitor what Hej. is, who made it (Babak, at cocode.dk), when it was
published and last updated, where the Danish comes from, what is stored, and what it is built
with. A small footer line on the main pages links to it and to cocode.dk. Nothing else changes.

Read first: `CLAUDE.md`, `docs/design/ART-DIRECTION.md`, `docs/lean/01-hej-og-tak.md` (Me page,
the model for this page's cards), `docs/lean/05-sounds.md` (a page that adds a tool and a nav
state) and `docs/lean/lessons.md`. Match the merged app's look.

## Route, title, focus

- `#/about` shows the page. Title `About · Hej.`; on arrival focus moves to the `h1`.
- The main nav (Street, Sounds, Me) appears on it with **none** current and no `aria-current`, like
  Not found. About is not a fourth nav item.

## The footer line

A `footer` at the end of the content (above the bottom nav), 15 px `ink-soft`, centred, 32 px
above it and 24 below, on Home, Sounds, Me and About; not on the lesson entry, the done page or
Not found. Text: `Made by Babak at cocode.dk · About` where `cocode.dk` is an external link to
the maker's site and `About` is an internal link to `#/about`. On the About page itself the line
reads `Made by Babak at cocode.dk` (no About link). Links use the app's link style (underlined,
`fjord`, 3 px focus ring).

## Links module

All external addresses live in one file, `src/links.ts`, as named exports, and nowhere else in
`src/`:

| export | URL |
|---|---|
| `COCODE` | `https://cocode.dk` |
| `REPO` | `https://github.com/cocodedk/English-Danish-Lessons` |
| `ISSUES` | `https://github.com/cocodedk/English-Danish-Lessons/issues` |
| `LICENSE_URL` | `https://github.com/cocodedk/English-Danish-Lessons/blob/main/LICENSE` |
| `DDO` | `https://ordnet.dk/ddo` |
| `OFL` | `https://openfontlicense.org` |

An external link is an `<a>` with `target="_blank"` and `rel="noopener noreferrer"`, and ends with
a visually hidden ` (opens in a new tab)` inside the link so its accessible name says so. One small
`ExternalLink` component does this for every external link in the app.

## Dates

- `FIRST_PUBLISHED = '2026-09-30'` in `src/about/buildInfo.ts`.
- `BUILD_DATE`, an ISO date `YYYY-MM-DD`, injected at build time: `vite.config.ts` gets
  `define: { __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)) }` (no Node
  globals), declared for TypeScript, and exported from `buildInfo.ts`.
- `formatDate('2026-10-01')` returns `1 October 2026`: day without a leading zero, a fixed English
  month name from an array in the file (never `Intl`), the four-digit year; anything that is not a
  valid `YYYY-MM-DD` is returned unchanged.

## The page

Top bar (wordmark, and on desktop the nav); `h1` `About Hej.`; the cards below, 24 px apart, as
on Me (`paper` card, radius 22, padding 20, `h2` Bricolage 700 26, body 17, small 15 `ink-soft`),
one column, max width 720 from 600 px up; the footer line; the bottom nav on phone and tablet.
No houses, no facade colours.

```
ABOUT (phone)
┌──────────────────────────┐
│ Hej.                     │
│ About Hej.               │
│ ┌──────────────────────┐ │
│ │ What it is           │ │
│ │ Hej. teaches …       │ │
│ └──────────────────────┘ │
│ ┌ Made by ──────────────┐ │
│ │ Babak at cocode.dk    │ │
│ │ Published 30 Sep …    │ │
│ │ Updated 1 October …   │ │
│ └──────────────────────┘ │
│   … more cards …         │
│ Made by Babak at cocode… │
│  Street   Sounds   Me    │
└──────────────────────────┘
```

Cards, in this order, copy final (`{…}` is filled in by code):

1. **What it is** (`h2`): `Hej. teaches English speakers to hear and say Danish. Each lesson is a house on your street, and every word you hear and say lights a window.` · `It is free, has no accounts and no ads, and runs entirely in your browser.`
2. **Made by**: `Made by Babak at ` + external link `cocode.dk` + `.` · `First published {formatDate(FIRST_PUBLISHED)}.` · `Updated {formatDate(BUILD_DATE)}.`
3. **How it works**: `Hear each Danish word, say it out loud, then tap “I said it” to light its window. On a lesson word you can also record yourself and listen back; your recording never leaves your device. The Sounds page covers the letters and sounds English speakers trip on.`
4. **Where the Danish comes from**: `The pronunciation symbols (IPA) are taken from Den Danske Ordbog (` + external link `ordnet.dk` (to `DDO`) + `). The sound you hear is your own device’s Danish voice reading the word: it is not a recording from the dictionary or from a native speaker, and it can differ from how a Dane says it. The English sound guides are written by hand and are approximate.` · `The Danish and its sound guides are a draft until a Danish speaker has read them. If you spot a mistake, please ` + external link `tell us on GitHub` (to `ISSUES`) + `.`
5. **Your privacy**: `Hej. saves your name, your progress and your colour choice in this browser only. Nothing is sent anywhere, and there are no accounts, no ads and no tracking.`
6. **Credits**: `Built with React, Vite and StyleX. Fonts: Bricolage Grotesque, Atkinson Hyperlegible Next and Noto Sans, under the ` + external link `SIL Open Font License` (to `OFL`) + `. The Danish flag icon is the Dannebrog.` · `Source code on ` + external link `GitHub` (to `REPO`) + `, licensed under the Apache License 2.0 (` + external link `licence` (to `LICENSE_URL`) + `).`
7. **For agents**: `This site declares WebMCP tools on every page, so an agent in your browser can read what is on screen. They are listed in ` + a plain link `llms.txt` to `./llms.txt` (relative, same tab) + `.`

## WebMCP

`describe` answers `page: 'about'` with the summary `About Hej.: who made it and when, where the
Danish comes from, what is stored, and what it is built with.` One new tool, only on this page:
`get_about` (`readOnlyHint`), input `{}`, answer
`{ madeBy: 'Babak', site: 'https://cocode.dk', firstPublished: '2026-09-30', updated: string, source: string, license: 'Apache-2.0', danishSource: 'Den Danske Ordbog (ordnet.dk)', draft: true, privacy: 'browser-only' }`
with `updated` the ISO `BUILD_DATE` and `source` the repository URL, both read from the same
constants the page uses. `public/llms.txt` gets an `## About` section and the sync test keeps it
equal to the registered names.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
The tests prove, at least:

1. **Route**: `#/about` renders the page, title `About · Hej.`, focus on the `h1`; the main nav is
   present with no `aria-current`; the lesson entry, done and Not found pages have no footer line.
2. **Cards**: the seven cards in order with their `h2`s and exact sentences; the dates come from
   the constants; each external link has the right `href`, `target`, `rel` and the hidden suffix in
   its accessible name; the `llms.txt` link is relative.
3. **Footer**: on Home, Sounds, Me and About with the exact text; the `About` link on the first
   three goes to `#/about`; none on About.
4. **Dates**: `formatDate` for 2026-10-01, 2026-09-30, 2026-12-09 and garbage input;
   `BUILD_DATE` matches `^\d{4}-\d{2}-\d{2}$`; `vite.config.ts` defines `__BUILD_DATE__` (read from
   disk) without a Node global.
5. **Links**: every URL in `src/links.ts` is in the table above; no other non-test file under `src/`
   mentions `http://` or `https://` except the SVG namespace; every external link in the app goes
   through `ExternalLink`.
6. **WebMCP**: `get_about` valid, `[]`, extra keys and wrong types give the exact shape and never
   throw; registered only on About; `describe` says `about`; `llms.txt` and the registered names
   agree.
7. **Static**: the usual no-network and no-colour-literal checks still pass (the static test's URL
   rule is amended to allow only `src/links.ts`).

## Answers to the grill

- **Recording** is on lesson entry pages only; the How it works card says so.
- **Audio versus IPA**: the Where the Danish comes from card says the IPA is DDO's and the sound is the
  device's own voice, so nobody mistakes synthesized speech for a dictionary recording.

- The footer's `Babak` is plain text, not a link; `cocode.dk` is the link.
- Two dates on purpose: the fixed first publication and the build date. The build date changes on
  every deploy; tests stub or only check its shape.
- External links open in a new tab so the app's state (an in-memory recording, a lesson in
  progress) is not lost; the hidden text tells screen-reader users.
- No email address, no social links, no contact form.
- The About page is not in the nav or the sitemap; it is reached from the footer and the Me page
  can stay unchanged.
- The nav's active-pip logic must cope with a route that has no current item (as Not found does).
- The builder may update earlier tests that assert the footer is absent, the static URL rule, or
  `describe`'s page union.

## Out of scope

A fourth nav item, a contact form, an email address, social links, changelog, any change to
lessons, Sounds, recording, the favicon and SEO files (spec 09), `CLAUDE.md` and `docs/design/`.
