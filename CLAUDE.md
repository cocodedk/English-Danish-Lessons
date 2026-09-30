# CLAUDE.md — English-Danish Lessons

## Project overview

A free, mobile-first, purely static web app that teaches English speakers to HEAR and SAY Danish
first. It assumes no Danish. "English-Danish-Lessons" is a working title: never hardcode it outside
`vite.config.ts` and the workflows. The name shown to learners is **Hej.**

It follows the sister projects Danish-Persian-Lessons and Danish-Japanese-Lessons (same product
idea, the other way round) and is meant to be more beautiful than both. Their code is not reused;
their product rules are, as written below.

- **Stack**: TypeScript (strict), React 19, Vite 8, **StyleX** for every style, React Router
  `HashRouter`, Vitest + jsdom. Node ≥ 20. Fonts self-hosted through `@fontsource-variable`.
- **Architecture**: static SPA. No backend, no database, no accounts, no analytics — ever.
- **Hosting**: GitHub Pages (a later spec). Vite `base` is `/English-Danish-Lessons/`.
- **Owner**: `cocodedk`.

## Product contract (non-negotiable)

- **Split screen** (lesson entry pages): the Danish word on top (`lang="da"`, large), English
  below (`lang="en"`), separated by one seam. The Sounds page's example rows are compact rows in a
  card instead. Every taught Danish entry and every praise word shows two pronunciation
  helps together: an English respelling ("Sounds like “tahg”") and IPA (`[ˈtɑɡ]`). Lesson titles
  and the wordmark are navigation labels and carry neither.
- **Hear, then say.** Each lesson entry: hear it, say it out loud, tap "I said it". The Sounds page
  is reference and practice: hear, say, no confirmation, no progress. Speaking comes before reading
  and spelling. Danish is never hidden behind a quiz.
- **Mobile first**: usable one-handed on a phone in portrait; nav in the thumb zone; 48 px targets.
- **100 % static**: every lesson is data committed to the repo. No runtime request leaves the site.
- **Browser storage only**: `localStorage`, keys `edl.v1.*`, envelope `{ schemaVersion: 1, value }`.
  It must survive empty, cleared, corrupt and denied storage: the app then works until the page
  reloads and says so on Home and Me. Nothing else is stored.
- **Generous by design**: the learner is never shamed and nothing is ever taken away by the app.
  Progress is windows lit on a house; a finished lesson gets bunting. No lives, no timers, no
  streak loss, no red crosses. Lessons never lock each other.
- **Name is optional**: the learner may give a name (skippable, editable, removable), stored only in
  `edl.v1.profile`, used for the greeting.
- **Accessible**: WCAG 2.2 AA. Colour is never the only cue. `prefers-reduced-motion` and
  `prefers-color-scheme` are respected. Focus is always visible.

## Curriculum (order matters, no rush)

1. **Hej og tak**: hello, thanks, yes, no, sorry, goodbye (spec 01).
2. Later, one spec each: introductions, numbers, food and drink, the city; a Sounds area for
   æ ø å, the soft d, the r and the stød; recording yourself; recorded native audio.

Per-lesson specs live in `docs/lean/`. Only the next unmerged one is ever built.

## Danish content rules (ALL Danish content)

- Everyday Standard Danish, Copenhagen. Words come from the spec; the builder never invents Danish.
- **IPA comes from Den Danske Ordbog (ordnet.dk)**, in DDO's own notation with two symbol
  substitutions: `g` → `ɡ` (U+0261), `ε` → `ɛ` (U+025B). Keep `ˈ` (main stress), `ˌ` (secondary) and
  `ˀ` (stød). DDO is the required source: read the entry for the right word class (a homograph can
  differ: `du` the pronoun is `[ˈdu]`, the verb `[ˈduˀ]`). Wiktionary is an optional second opinion;
  where it was consulted and differs, the spec lists the disagreement and DDO wins. A phrase's IPA
  is composed from its words' entries and the spec says so.
- The **respelling** is an English-reader approximation, written by hand in the spec: lower case,
  syllables joined by hyphens, the stressed syllable in capitals when there is more than one.
- Danish and IPA are drafts until the owner has read them. A content PR lists every new entry in
  its description so the owner can review it.
- English copy in the UI: plain, sentence case, active verbs, no exclamation marks except in
  celebrations, no sales tone, no "oops".

## Working rules

- **The simplest thing that works.** Minimal, YAGNI, shortest path. Build nothing the spec does not
  ask for.
- **200 lines maximum per file.** Extract when near it.
- **Every style is StyleX.** Colour values live only in `src/styles/tokens.css`; StyleX reads them
  through `src/styles/tokens.stylex.ts`. No colour literal anywhere else, no other CSS file, no
  inline `style` except for computed geometry (SVG).
- **Every page declares WebMCP tools** with `document.modelContext.registerTool`: one-sentence
  descriptions, closed answer shapes, and a `describe` tool saying what is on the page. The buttons
  stay for people. `public/llms.txt` lists every tool by page. The API is a draft that has already
  changed once: `document.modelContext`, one `registerTool` per tool, no `provideContext`. A tool
  returns `{ ok: false, error, … }` instead of throwing. With no `document.modelContext` the app
  runs unchanged and silent.
- **Tests**: TDD for logic. Assert the test count: `scripts/assert-count.mjs N` in `npm test` must
  equal the number of tests. A skipped test fails the gate. A mostly-red suite hides the shared
  cause: fix that first. Prefer asserting structure, behaviour and tokens over pixels.
- **Conventional Commits.** Never commit machine-specific absolute paths.
- Before writing UI, read `docs/design/ART-DIRECTION.md` and look at `docs/design/previews/`.

## Commands

```bash
npm ci               # install exactly the lockfile
npm run dev          # Vite dev server
npm run verify       # lint + type-check + build + tests (the gate; CI runs the same)
```

`profile-web.md` holds the exact suite the graph-loop runs. Tests run with an empty home, no
network and no browser: jsdom only.

## How work arrives

Specs in `docs/lean/NN-name.md`, built one per run by graph-loop's lean loop
(https://github.com/cocodedk/graph-loop): a builder works in a worktree, the suite is the gate, a
second model reviews the diff, one pull request opens. The owner merges. The loop never edits
CLAUDE.md, `docs/design/`, or a spec.
