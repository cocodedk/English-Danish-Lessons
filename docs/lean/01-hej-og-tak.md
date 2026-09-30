---
lean_status: stopped
lean_worktree: /tmp/graph-bostmis7/task-01-hej-og-tak
---
# Spec 01: Hej og tak, the first lesson, end to end

## Goal

An English speaker opens the site, sees a street with one house, works through eight Danish
entries by hearing and saying each, lights the eight windows, gets a celebration, and is back on
the street. That whole journey works, in both colour themes, on a phone and on a desktop, with
StyleX, browser storage and WebMCP tools on every page. Nothing else exists yet.

Read first: `CLAUDE.md`, `docs/design/ART-DIRECTION.md` (binding: colours, type, geometry,
motion, copy voice) and the two PNGs in `docs/design/previews/`. Match that design. Where the
ART-DIRECTION and the previews differ, ART-DIRECTION wins; where this spec and the previews
differ, this spec wins.

## Routes

`HashRouter` in `App`; the routes themselves live in a component that tests can render inside a
`MemoryRouter`.

| Hash | Page |
|---|---|
| `#/` | Home |
| `#/lesson/:lessonId` | redirect (replace) to the entry page of the first unlit entry, or position 1 when none or all are lit |
| `#/lesson/:lessonId/:position` | Lesson entry, `position` a whole number 1..N |
| `#/lesson/:lessonId/done` | Done |
| `#/me` | Me |
| anything else, including an unknown lesson or a position that is not a whole number in 1..N | Not found |

On every route change: set `document.title` (below), and move focus to the page's `h1`
(`tabIndex={-1}`), except on the first render. Titles: Home `Hej. Danish for English speakers`;
entry `{Danish} · {lesson title} · Hej.`; done `Done · {lesson title} · Hej.`; me `Me · Hej.`;
not found `Not found · Hej.`.

## Catalog

`src/catalog/`: the types, the data and `getLesson(id)`. One lesson, `hej-og-tak`:
title `Hej og tak`, English title `Hello and thanks`, colour `gul`, gable `step`.

```ts
type Entry = { id: string; da: string; en: string; respelling: string; ipa: string; note: string }
type Lesson = {
  id: string; title: string; titleEn: string
  color: 'gul' | 'tegl' | 'hav' | 'salvie' | 'rosa'
  gable: 'step' | 'bell' | 'point' | 'cornice'
  entries: readonly Entry[]
  praise: Pick<Entry, 'da' | 'en' | 'respelling' | 'ipa'>
}
```

The eight entries, in this order, character for character (the IPA characters are `ɡ` U+0261 and
`ɛ` U+025B; DDO = ordnet.dk, Den Danske Ordbog):

| id | da | en | respelling | ipa | note |
|---|---|---|---|---|---|
| `hej` | Hej | Hello | hi | `[ˈhɑj]` | Hello, or hi. Say it twice, hej hej, to mean bye. |
| `goddag` | Goddag | Good day | go-DEH | `[ɡoˈdæˀ]` | A polite hello, good for meeting someone new. |
| `tak` | Tak | Thanks | tahg | `[ˈtɑɡ]` | Thanks. You will say it all day. |
| `mange-tak` | Mange tak | Thank you very much | MAHNG-uh tahg | `[ˈmɑŋə ˈtɑɡ]` | Literally, many thanks. |
| `ja` | Ja | Yes | yeh | `[ˈja]` | Yes. Short and light. |
| `nej` | Nej | No | nigh | `[ˈnɑjˀ]` | No. The voice stops for a moment at the end. Danes call that catch stød. |
| `undskyld` | Undskyld | Sorry | ON-skewl | `[ˈɔnˌsɡylˀ]` | Sorry, or excuse me when you need to get past. |
| `farvel` | Farvel | Goodbye | fah-VEL | `[fɑˈvɛl]` | Goodbye. It sounds more final than hej hej. |

`praise` for this lesson: `Velkommen` · `Welcome` · `VEL-kum-en` · `[ˈvɛlˌkʌmˀən]`.

Sources, checked 2026-09-30: DDO for `hej`, `goddag`, `tak`, `ja`, `nej`, `undskyld`, `farvel`,
`velkommen`; `mange` and `tak` for `mange tak`. Wiktionary agrees except: `ja` (`[jɛ]`, DDO
`[ˈja]`, kept), `goddag` (`[ɡ̊ɔ̽ˈd̥æˀ]`, DDO kept) and `farvel` (`[fɑːˈvɛl]` or `[fɔˈvɛl]`, DDO kept).
These are drafts until the owner has read them: list all eight entries in the pull request
description under "Danish for review".

## Storage

`src/storage/`. Everything goes through one small module that never throws.

- `localStorage` when it works (a write, read and remove probe succeeds), otherwise an in-memory
  map for the session. `isPersistent()` says which.
- Envelope: `{"schemaVersion":1,"value":…}`. Absent, unparsable, wrong-schema or wrong-shape data
  reads as the default and is never repaired until the next write.
- Keys and values:
  - `edl.v1.profile`: `{ name: string }`, the name trimmed, 1..24 characters counted with
    `Array.from`, no control characters; anything else reads as no name.
  - `edl.v1.progress`: `{ lit: Record<lessonId, string[]> }`, entry ids, unique. On read, ids not in
    the catalog are dropped.
  - `edl.v1.prefs`: `{ colorMode: 'auto' | 'light' | 'dark' }`, default `auto`.
- Components read and write through hooks built on `useSyncExternalStore` (one small store per
  key, also updated by the `storage` event from other tabs), so a change on one page shows on
  every mounted component at once.

## Themes and tokens

- `src/styles/tokens.css`: the only file with colour values. `:root` holds the light theme;
  `:root[data-theme='dark']` the dark theme; `@media (prefers-color-scheme: dark)
  { :root:not([data-theme='light']) { … } }` the same dark values for `auto`. Token names and
  values are exactly the table in `ART-DIRECTION.md`. Set `color-scheme` per theme.
- `src/styles/tokens.stylex.ts`: `defineVars` exports, each colour `var(--name)`, plus the
  non-colour tokens (font families, spacing, radii). Components import these and nothing else for
  colour. No colour literal in any `.ts` or `.tsx` (a test scans for `#` colours and `rgb(`,
  outside `tokens.css` and `*.test.*`).
- A small inline script in `index.html`, before the app, reads `edl.v1.prefs` and, when the mode is
  `light` or `dark`, sets `data-theme` on `<html>` before first paint. It never throws. The Me page
  sets and removes the same attribute (removed for `auto`).
- Fonts: `main.tsx` already imports the two families. `font-family` values come from tokens.

## Pages

All colours, sizes and geometry are in `ART-DIRECTION.md`. All copy below is final unless a
sentence is in braces.

### Home `#/`

Top to bottom: top bar (wordmark, and on desktop the two nav links); `h1` greeting; one line of
text; the street; the continue card; the bottom nav on phone and tablet.

- **Greeting** `h1`: `Hej, {name}.` with a saved name, else `Hej.`
- **Line**, by state (`n` windows lit of `N` in total): none lit `Your street is waiting. Start
  with Hej og tak.`; some lit `{n} window lit on your street.` or `{n} windows lit on your
  street.`; all lit `Every window is lit on your street.`
- **Street**: caption row `Your street` (left) and `1 lesson` (right). The skyline holds the house
  for Hej og tak (eight windows, two columns of four, the lit ones from storage), a link to
  `#/lesson/hej-og-tak` named `Hej og tak, {n} of 8 windows lit`, then the empty plot captioned
  `Coming next`.
- **Continue card** (`paper`, radius 22), by state:
  - none lit: label `Start Hej og tak`; word `Hej`; the pronunciation line `Sounds like “hi” ·
    [ˈhɑj]` (17/1.35); the English `Hello`; button `Start`.
  - some lit, not all: label `Next in Hej og tak`; the first unlit entry's Danish word (`lang="da"`,
    Bricolage 800, 44 px); its pronunciation line, then its English; button `Continue`. It links to
    that entry.
  - all lit: label `Hej og tak is done`; word `Hej og tak` (a lesson title, a navigation label, so
    no pronunciation line); line `Say it all again`; button `Practise`, linking to entry 1.
- **No name yet**: under the card a text link `Add your name` to `#/me`.
- **Storage not saving**: above the street, a `role="status"` note in a `paper` card: `This browser
  can't save your progress, name or colour choice. They will be lost when you reload or close the page.` It shows every time
  Home or Me is shown while storage is not saving, and cannot be dismissed: it is a fact about the
  page, not an interruption.

### Lesson entry `#/lesson/:lessonId/:position`

- **Top bar**: a round back chip (`aria-label` `Back to your street`, links to `#/`), and the label
  `{lesson title} · {position} of {N}` (15/600, `ink-soft`), centred.
- **Specimen**: the Danish pane in the lesson colour with the Danish word as the page's `h1`
  (`lang="da"`) and the pronunciation line `Sounds like “{respelling}” · {IPA}` (the IPA in its own
  span, `white-space: nowrap`); the play button on the seam, `aria-label`
  `Hear {Danish}`; the English pane with the English meaning and the note.
- **Lamp** row: the glyph and `Not lit yet`, or `Lit` once the entry is lit.
- **Actions**: primary `I said it`. Tapping it lights the entry and the button reads `Said it ✓`
  with `aria-pressed="true"`; tapping it again does nothing. A line under it in `ink-soft`:
  `Say it out loud, then tap “I said it”.` A `role="status"` region, visually hidden, announces
  `Window lit. {n} of {N} lit.`
- **Footer row**: secondary `Back` (disabled on position 1) and primary `Next: {next Danish}`; on the
  last entry the primary is `Finish` and links to the done page. Next and Finish never need a lit
  window: skipping is allowed.
- **Hearing** (`src/speech/`): the play button speaks the Danish with the browser's speech
  synthesis at rate 0.85. Rules:
  - Use only a voice whose `lang` starts with `da` (case-insensitive, `da-DK` or `da_DK`) **and**
    whose `localService` is `true`. A Danish voice that is not local counts as no Danish voice: a
    remote voice would send the text to a speech service, and no request leaves this site. Never
    speak with any other voice either: an English voice reading Danish teaches the wrong sound.
  - When the page mounts, read `getVoices()` once and listen to `voiceschanged` for the life of the
    page. If voices are known and none qualifies, show the no-voice state at once. If the list is
    empty, show nothing yet.
  - The one-second wait for voices happens on a tap, never on load. On a tap the button goes at once
    to the speaking state (stop glyph, `aria-label` `Stop`, `aria-busy="true"` while it looks up); if
    a qualifying voice appears within 1 s it speaks, otherwise the button returns to play and the
    no-voice state shows.
  - While speaking, the button shows a stop glyph and `aria-label` `Stop`; pressing it cancels. It
    returns to play on `end`, `error` or cancel. Starting a new one cancels the last.
  - No Danish voice: the button is `aria-disabled="true"` and a `role="note"` line appears under the
    pronunciation line: `This device has no Danish voice, so there is no sound. Use the sound guide
    above.` No speech API: the same, with `This browser can't play sound.` in place of the first
    sentence.
  - A speech `error` other than a cancel: `role="status"` line `The sound didn't play. Try again.`

### Done `#/lesson/:lessonId/done`

A visually hidden `role="status"` region announces the result on mount, exactly: all lit
`All 8 windows lit. Velkommen!`; part lit `{n} of 8 windows lit. {8 - n} left to light.` (`1 left to
light.` when one remains); none lit `No windows lit yet.`

- **All eight lit**: the bunting drops (motion 2); `h1` the praise word (`lang="da"`), then its
  pronunciation line, then `Welcome` (26/700); the large house, all windows lit; a chip
  `Hej og tak · all 8 windows lit`; primary `Back to your street`, secondary `Practise again` (entry 1).
- **Not all lit** (also reachable straight from the URL): no bunting. `h1` `{n} of 8 windows lit`;
  text `Go back to the entries you skipped to light the rest.` (`n` = 0: `Start with Hej and light your
  first window.`); the large house with its real lit windows; primary `Light the rest` (`Start the
  lesson` when none is lit), linking to the first unlit entry; secondary `Back to your street`.

### Me `#/me`

`h1` `Me`. Four sections, each with an `h2`:

1. **Your name**: a labelled text input (`Name`), hint `Optional. Used for your greeting. It stays
   in this browser.` Buttons: primary `Save name`, enabled only when the trimmed input is 1..24
   characters and differs from the saved name; secondary `Remove name`, shown only when a name is
   saved. Over 24 characters: an inline error `Use 24 characters or fewer.` and Save disabled.
   A name with a control character is refused like an over-long one: inline error `That name has a
   character we can't save. Remove it and try again.` and Save disabled; `set_name` answers `{ ok:
   false, error }` with the same sentence. Feedback in a `role="status"` line: `Name saved.` /
   `Name removed.`; while storage is not saving: `Name saved for now.` / `Name removed for now.`
2. **Colours**: a radio group, legend `Colour mode`, options `Auto`, `Light`, `Dark`, shown as one
   segmented control; hint `Auto follows your phone or computer.` Changing it applies at once.
3. **Your progress**: `{n} of {N} windows lit.` With no windows lit it reads `No windows lit yet.`
   and there is no delete button. Otherwise a secondary button `Delete progress` opens a
   native `<dialog>` (modal): title `Delete your progress?`, text `Every lit window on your street
   goes dark. You can't undo this.`, buttons `Delete progress` (primary) and `Keep it` (secondary,
   focused first). Escape and `Keep it` close it and change nothing. Deleting closes it, clears
   progress, and says `Progress deleted.` in the status line. Focus returns to the button that
   opened the dialog; after a delete that button is gone (nothing is lit any more), so focus goes to
   the section's `h2` (`tabIndex={-1}`) and the status line announces `Progress deleted.`
4. **Privacy**: `Hej saves your name, your progress and your colour choice in this browser only.
   Nothing is sent anywhere, and there are no accounts.`

The storage-not-saving note (Home) appears at the top of this page too. Layout: no preview exists
for Me or Not found, so build them from the same parts as Home and match its look: top bar, `h1`
(Bricolage 700 44, `ink`), then on Me each section as a `paper` card (radius 22, padding 20, 32 px
between cards) with its `h2` (Bricolage 700 26), body 17 `ink`, hints 15 `ink-soft`, buttons as in
ART-DIRECTION, left-aligned, max width 720 from 600 px up. No houses, no facade colours.

```
ME (phone)
┌──────────────────────────┐
│ Hej.                     │
│ Me                       │
│ ┌──────────────────────┐ │
│ │ Your name            │ │
│ │ [ Name field       ] │ │
│ │ [Save name] [Remove] │ │
│ └──────────────────────┘ │
│ ┌ Colours ─ (Auto|Light|Dark) ┐
│ ┌ Your progress ─ 3 of 8 … ┐  │
│ ┌ Privacy ─ text ─────────┐  │
│   Street        Me         │
└──────────────────────────┘
```

### Not found

`h1` `That page doesn't exist.`, one primary link `Back to your street`. Same look and gutters as
Me, content left-aligned under the top bar, nothing else.

### Navigation by page

The main nav (`Street`, `Me`) is a bottom bar on phone and tablet and moves into the top bar on
desktop (see ART-DIRECTION). It appears on Home (`Street` current), Me (`Me` current) and Not
found (nothing current, no `aria-current`). Lesson entry and Done are focused flows and have no
main nav: the entry page has the back chip in its top bar, and Done ends in its own buttons and
shows only the wordmark in its top bar.

## WebMCP

Follow the CLAUDE.md rules. `src/webmcp/` holds one helper and `src/test/webmcp.ts` a fake
registry for tests.

- The helper registers a page's tools with `document.modelContext.registerTool` when the page
  mounts, each in its own try/catch, with an `AbortSignal` it aborts on unmount. Without
  `document.modelContext` it does nothing and throws nothing. Tools read live state (storage hooks,
  router) when they run, never a copy made at registration.
- Every tool returns a JSON-serialisable object of exactly the shape below and never throws:
  bad input gives `{ "ok": false, "error": "<one sentence>", … }` plus the valid options.
  Input is normalised first (objects only; wrong types, extra keys and missing keys are handled).
- `describe` is registered once by the shell and answers for the current page.

| Page | Tool | Input | Answer |
|---|---|---|---|
| all | `describe` | `{}` | `{ page: 'home'\|'lesson'\|'done'\|'me'\|'not-found', summary: string, tools: string[] }` |
| Home | `get_street` | `{}` | `{ name: string\|null, windowsLit: number, windowsTotal: number, storage: 'saved'\|'session-only', lessons: {id,title,titleEn,lit,total,done}[], next: {lessonId,position,da,en}\|null }` |
| Home | `open_lesson` | `{ lessonId: string, position?: integer }` | `{ ok: true, page: 'lesson', lessonId, position }` or `{ ok: false, error, lessonIds: string[] }` |
| Lesson | `get_entry` | `{}` | `{ lessonId, position, total, da, en, respelling, ipa, note, lit: boolean, voice: 'available'\|'none'\|'unsupported', speaking: boolean }` |
| Lesson | `hear_entry` | `{}` | `{ ok: boolean, started: boolean, reason?: 'no-danish-voice'\|'unsupported'\|'error' }` |
| Lesson | `mark_said` | `{}` | `{ ok: true, lit: true, windowsLit, windowsTotal }` |
| Lesson | `go_to` | `{ where: 'back'\|'next'\|'finish' }` | `{ ok: true, page: 'lesson'\|'done', position?: number }` or `{ ok: false, error, valid: string[] }` |
| Done | `get_result` | `{}` | `{ lessonId, lit, total, allLit: boolean, praise: { da, en } }` |
| Done | `go_from_done` | `{ where: 'street'\|'practise'\|'light_the_rest' }` | `{ ok: true, page }` or `{ ok: false, error, valid: string[] }` |
| Me | `get_settings` | `{}` | `{ name: string\|null, colorMode: 'auto'\|'light'\|'dark', windowsLit, windowsTotal, storage: 'saved'\|'session-only' }` |
| Me | `set_name` | `{ name: string }` | `{ ok: true, name }` or `{ ok: false, error, maxCharacters: 24 }` |
| Me | `clear_name` | `{}` | `{ ok: true }` |
| Me | `set_color_mode` | `{ mode: 'auto'\|'light'\|'dark' }` | `{ ok: true, colorMode }` or `{ ok: false, error, valid: string[] }` |
| Me | `delete_progress` | `{ confirm: true }` | `{ ok: true }` or `{ ok: false, error }` |
| Not found | `go_to_street` | `{}` | `{ ok: true, page: 'home' }` |

Annotations: every `get_*` and `describe` is `readOnlyHint: true`; `delete_progress` is
`consequentialHint: true`; nothing else needs one. Each action tool runs the same code path as its
button (`mark_said` is the "I said it" handler, `delete_progress` the dialog's confirm handler,
`hear_entry` the play handler). Each description is one sentence saying what it does and returns.

`public/llms.txt`: keep the intro, then one `##` section per page in the table above, each tool as
```
- `tool_name`: the tool's description.
```
A test compares the set of names in `llms.txt` with the set registered by rendering every route.

## Motion, accessibility, responsive

Exactly the three motions in `ART-DIRECTION.md`, each also under `prefers-reduced-motion: reduce`
(instant). Headings in order, one `h1` per page. Danish text carries `lang="da"`. The nav is a
`<nav aria-label="Main">` with `aria-current="page"` on the current link. Every control is at
least 48 px in both directions. Focus is always visible. Layout follows the breakpoints in
`ART-DIRECTION.md`; check 360 px, 768 px and 1280 px wide by reading the styles, not by browser.

## Acceptance

`npm ci && npm run verify` passes (lint, type-check, build, tests). The number in
`scripts/assert-count.mjs N` inside the `test` script equals the number of tests, and the pull
request says the number. The tests prove, at least:

1. **Catalog**: eight entries in the given order with the given values; unique ids; every field
   non-empty; every `ipa` uses only symbols from a short allowed set (`ˈ ˌ ˀ ː`, the IPA letters
   used above, `[ ]` and a space) and contains no ASCII `g` and no Greek `ε`.
2. **Storage**: round-trip; absent, corrupt and wrong-schema data read as defaults; a `getItem` and a
   `setItem` that throw fall back to memory and `isPersistent()` is false; unknown entry ids are
   dropped; name validation (trim, 24 characters counted by `Array.from`, control characters).
3. **Tokens**: every token in the table is declared in the light block, the dark block and the
   `auto` media block with the table's values; the contrast floor in `ART-DIRECTION.md` holds in
   both themes, computed from `tokens.css`; no colour literal outside `tokens.css`.
4. **Pre-paint script**: executed against `index.html`'s own script text with a seeded
   `localStorage`: `dark` and `light` set `data-theme`, `auto`, missing and corrupt data set nothing,
   a throwing `localStorage` does not throw.
5. **Speech**: a local Danish voice is chosen and the utterance uses it at rate 0.85; a Danish voice
   with `localService: false`, or only non-Danish voices, means nothing is spoken and the note
   shows; with known voices and none qualifying the note shows on mount without a tap; with an empty
   list nothing shows until a tap, the button is busy during the wait, `voiceschanged` is waited for
   at most 1 s on that tap only; a second press cancels; `error` resets the button; no
   `speechSynthesis` shows the no-support note.
6. **Home**: every state of the greeting, the line and the continue card (with its respelling and
   IPA); the main nav is present on Home, Me and Not found with the right current link, and absent
   on Lesson entry and Done; the house shows the
   lit windows from storage; the link names; `Add your name` appears only without a name; the
   storage note appears only when storage is not saving.
7. **Lesson entry**: every field of the entry is on screen with `lang="da"` on the Danish; "I said it"
   lights the window, persists it, is idempotent, and announces it; Back is disabled on 1; the last
   entry offers `Finish`; skipping works; bad positions and unknown lessons render Not found; the
   bare lesson URL redirects to the first unlit entry.
8. **Done**: all-lit shows the praise, the chip and the bunting; not-all-lit and none-lit show the
   gentle versions and the right link targets; the live region says exactly the three strings.
9. **Me**: saving, removing, over-length and unchanged names; no delete button with nothing lit; colour mode changes `data-theme` and
   storage; the dialog opens with `Keep it` focused, Escape and `Keep it` change nothing, confirm
   clears progress and returns focus.
10. **Routing and focus**: titles, and focus moves to the `h1` on navigation but not on first render.
11. **WebMCP**: with a fake registry, every tool in the table is registered on its page and only
    there, `describe` answers for the current page, each tool returns its exact shape for valid
    input; the tools with required input (`open_lesson`, `go_to`, `go_from_done`, `set_name`,
    `set_color_mode`, `delete_progress`) answer `{ ok: false, … }` for `{}`, wrong-typed and unknown
    values; the tools with no input (`describe`, every `get_*`, `hear_entry`, `mark_said`,
    `clear_name`, `go_to_street`) give their normal shape for `{}`, for `[]` and for extra keys, and
    no tool ever throws; `delete_progress` refuses without `confirm: true`; `mark_said` and the button
    give the same storage; no registry means no error and a working app; an aborted signal on
    unmount; a registration that rejects does not stop the others; `llms.txt` names equal the
    registered names.
12. **House**: the geometry for `step`, `bell`, `point` and `cornice` gables, the window count and
    grid for 8 entries, and lit versus unlit fills, checked on the rendered SVG.
13. **Static**: no source file outside tests mentions `fetch(`, `XMLHttpRequest`, `sendBeacon`,
    `WebSocket`, or an `http://` or `https://` URL other than the SVG `xmlns`; the built CSS in
    `dist/assets/` contains a `prefers-reduced-motion: reduce` block and both a light and a dark
    scheme (this one test reads `dist/`, and fails with a message saying to run `npm run build`
    first if it is missing).

`src/App.test.tsx` and `src/App.tsx` from the scaffold may be replaced; keep a test that shows a
component's class names come from StyleX.

## Decisions already made

- No new runtime dependency. The one dev dependency allowed if a test needs it is
  `@testing-library/user-event`. Everything else is installed.
- The app has no recorded audio and no microphone. Hearing is the browser's speech synthesis, only
  with a Danish voice. Recording and recorded native audio are later specs.
- "Say it" is a self-report ("I said it"): the app cannot check speech and does not pretend to.
- There is one lesson, so one house. The Skyline component must already handle several houses (a
  list), because lesson 2 is only data.
- The name of the app in the UI is `Hej`, from one constant. The path `/English-Danish-Lessons/`
  appears only in `vite.config.ts` and the workflows.
- Tests that read `tokens.css`, `index.html`, `llms.txt` or `dist/` read them from disk with
  `node:fs` and a path relative to the project root (Vitest runs from the root). Do not build
  paths with `new URL(…, import.meta.url)` in a template string: Vite rewrites it and the path
  becomes `undefined`. `@types/node` is a dev dependency you may add for these test files only.
- jsdom has no `<dialog>.showModal`; stub it in `src/test/setup.ts` if needed. It also has no
  `matchMedia`, `speechSynthesis` or layout; the setup file provides the stubs the tests use.
- StyleX notes: dynamic per-lesson colours use a static map keyed by the colour name, not runtime
  values. `@media`, `:hover`, `:focus-visible` go inside the property's object. Animations use
  `stylex.keyframes`. The plugin order in `vite.config.ts` is load-bearing; leave it.

## Answers to the grill

- **Zero-argument tools and `{}`**: only the six tools with required input must refuse `{}`. The
  others accept `{}`, ignore extra keys, and are tested with `[]`, extra keys and wrong types.
- **Remote voices**: hearing needs a Danish voice with `localService === true`. The privacy and no-
  request promises stand; a remote voice counts as no voice.
- **Home card**: it shows the respelling and the IPA on one line, then the English. CLAUDE.md's rule
  covers every taught entry and every praise word; lesson titles and the wordmark are navigation
  labels.
- **Nav**: on Home, Me and Not found only (see Navigation by page). Lesson entry and Done have none.
- **Voice lookup**: starts on the tap, never on load; the button is busy, then returns to play with
  the note if nothing qualifies. On load only the known-voices check runs.
- **Me and Not found design**: no preview; built from Home's parts as described under each page.
- **Zero lit windows on Me**: `No windows lit yet.` and no delete button.
- **Warning text**: `This browser can't save your progress, name or colour choice. They will be lost
  when you reload or close the page.` It covers all three because all three live in storage; the
  name form's feedback says `for now` and the colour mode still applies at once.
- **Focus after delete**: to the progress section's `h2`. **Control characters in a name**: refused
  with the sentence under Me, Save disabled, `set_name` answers `ok: false`.
- **How often**: every time Home or Me is shown while storage is not saving; not dismissible.
  CLAUDE.md says "on Home and Me" accordingly.
- **Done live region**: the three strings given under Done.

## Out of scope

Recorded audio, microphone, other lessons, the Sounds area, spelling exercises, rewards beyond lit
windows and bunting, sound effects, the GitHub Pages workflow, a landing page, PWA, analytics,
translations of the UI, any change to `CLAUDE.md`, `docs/design/` or this spec.
