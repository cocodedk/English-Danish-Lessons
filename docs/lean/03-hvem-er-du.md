# Spec 03: a second lesson, "Hvem er du?", and a street with more than one house

## Goal

The street gets its second house. Lesson 2, `Hvem er du?` (Who are you?), teaches introducing
yourself. Everything that assumed one lesson becomes correct for any number of lessons, and the
IPA is set in a font that really contains its symbols. No new page, no new tool, no new route.

Read first: `CLAUDE.md`, `docs/design/ART-DIRECTION.md`, `docs/lean/01-hej-og-tak.md` (the
behaviour this extends) and `docs/lean/lessons.md`. Match the look of the merged app.

## 1. Lesson 2 in the catalog

Add `hvem-er-du` after `hej-og-tak` in `src/catalog`: title `Hvem er du?`, English title
`Who are you?`, colour `tegl`, gable `point`, eight entries in this order, character for
character (IPA symbols: `ɡ` U+0261, `ɛ` U+025B, `ɐ` U+0250 with no combining marks here):

| id | da | en | respelling | ipa | note |
|---|---|---|---|---|---|
| `jeg` | Jeg | I | yai | `[ˈjɑj]` | I. It is written with an e but said yai. |
| `du` | Du | You | doo | `[ˈdu]` | You, to one person. Say it like the English word do. |
| `hvad-hedder-du` | Hvad hedder du? | What is your name? | va HEH-ther doo | `[va ˈheðɐ du]` | Literally, what are you called. The h in hv is silent. |
| `jeg-hedder` | Jeg hedder … | My name is … | yai HEH-ther | `[jɑj ˈheðɐ]` | Say your own name after it. The dd is soft, like th in this. |
| `hvordan-har-du-det` | Hvordan har du det? | How are you? | vor-DAN hah doo DEH | `[vɒˈdan hɑ du ˈde]` | Literally, how have you it. |
| `godt` | Godt | Good, fine | gut | `[ˈɡʌd]` | Good, or fine: the usual answer to how are you. |
| `og-dig` | Og dig? | And you? | ow dai | `[ɒw dɑj]` | And you? Og means and. |
| `hyggeligt-at-moede` | Hyggeligt at møde dig | Nice to meet you | HEW-guh-lid uh MUR-thuh dai | `[ˈhyɡəlid ʌ ˈmøːðə dɑj]` | Nice to meet you. Hyggelig is the Danish word for cosy and friendly. |

`praise`: `Flot` · `Well done` · `flut` · `[ˈflʌd]`.

Sources, checked 2026-09-30 on ordnet.dk (DDO), the only source for this lesson (CLAUDE.md: DDO is
required, Wiktionary optional): `jeg` `[ˈjɑj]`, `du` the pronoun `[ˈdu]` (the verb `due` is `[ˈduˀ]`
and is not used), `dig` `[ˈdɑj]`, `hedde` `[ˈheðə]`, `hvad` `[ˈva]`, `hvordan` `[vɒˈdan]`, `har` the
present tense `[ˈhɑˀ]` or, unstressed, `[hɑ]` (used; `[ˈha]` belongs to the infinitive `have`), `det`
`[ˈde]`, `godt` `[ˈɡʌd]` (a plain d, not the soft `ð`), `og` `[ˈɒw]`, `hyggelig` `[ˈhygəli]`, `at`
the infinitive marker `[ʌ]` (DDO's `[ad]` is the conjunction and the sentence-initial form, not used
here), `møde` `[ˈmøːðə]`, `flot` `[ˈflʌd]`. The phrases are **composed**: DDO's words joined in
order, with the stress mark kept on content words only; `hedder` uses `ɐ` for the present-tense
`-er` ending and `hyggeligt` adds the `d` of the neuter `-t`, both regular rules DDO does not list. List all eight entries and the praise in the pull
request description under "Danish for review", saying which IPA is composed.

## 2. A street with more than one house

Home changes; the other pages already work per lesson (check each for a hard-coded lesson name,
count or praise, and remove it).

- **Line under the greeting**: none lit `Your street is waiting. Start with {first lesson's title}.`;
  some lit `{n} window lit on your street.` or `{n} windows lit on your street.`; every lesson
  fully lit `Every window is lit on your street.`
- **Continue card**: the subject lesson is the first lesson, in catalog order, that has an unlit
  entry.
  - Subject lesson has no lit window: label `Start {title}`, button `Start`.
  - Subject lesson has some lit window: label `Next in {title}`, button `Continue`.
  - Both show the first unlit entry's Danish word, pronunciation line and English, and link to that
    entry, as today. So a learner who finished lesson 1 sees `Start Hvem er du?` with `Jeg`.
  - No lesson has an unlit entry: label `Every lesson is done`, the first lesson's title as the
    word (`lang="da"`), the line `Start again from the beginning.`, button `Practise` linking to the
    first lesson's entry 1 (so the word, the line and the link all mean the first lesson).
- **Skyline**: the houses in catalog order, each with its own colour, gable and window count, each
  a link named `{title}, {n} of {N} windows lit`. The empty plot and its caption `Coming next` show
  only while `lessons.length < PLANNED_LESSONS`; export `PLANNED_LESSONS = 5` from the catalog.
  The plot is as tall as the last house. The row scrolls sideways with snap when it overflows.
- **Section caption** reads `{k} lessons` (`1 lesson` for one).
- `describe` for Home says `Your street: one house per lesson with its lit windows, and a card
  that continues the next lesson.`; `get_street` already lists every lesson and the first unlit
  entry; keep both working with two lessons.

## 3. Long entries

Lesson 2 has entries up to 21 characters (`Hyggeligt at møde dig`). Make every entry fit on a
360 px phone without overflowing or clipping. The Danish word's size depends on its length `n`
(counted with `Array.from`, spaces included), in one pure function `wordSize(n)` used by the
Specimen and the Home card:

| n | Specimen word | Home card word |
|---|---|---|
| 1 to 6 | `clamp(72px, 22vw, 96px)`, line 0.95 | 44 px |
| 7 to 10 | `clamp(52px, 15vw, 72px)`, line 1 | 44 px |
| 11 to 16 | `clamp(36px, 10.5vw, 48px)`, line 1.05 | 32 px |
| 17 or more | `clamp(28px, 8vw, 36px)`, line 1.1 | 32 px |

Words wrap at spaces, never inside a word (`overflow-wrap: break-word` only as the last resort for
a single word wider than the pane). The Danish pane grows with its content (its 170 px minimum
stays). The play button keeps sitting on the seam between the panes, wherever the seam falls, and
the English pane's top padding keeps clearing it. On the Home card the word and the button wrap
under each other when they do not fit on one line. ART-DIRECTION's type table row for the Danish
word is superseded by this table.

## 4. The IPA font

The body font does not contain the IPA symbols, so the browser falls back to whatever the device
has. Fix it:

- Add `@fontsource-variable/noto-sans` as a dependency. `main.tsx` imports only its `latin` and
  `latin-ext` subset stylesheets (not the package's index, which pulls every script).
- A `fonts.ipa` token (`'Noto Sans Variable', system-ui, sans-serif`). Every IPA string on screen
  (the pronunciation line, the Home card, anywhere `[…]` IPA is shown) uses it, weight 400.
- ART-DIRECTION's type table says IPA is in Atkinson; this spec supersedes that line for IPA only.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
The tests prove, at least:

1. **Catalog**: the eight entries and the praise of lesson 2 exactly as above; lesson order; entry
   ids unique across all lessons; each lesson's colour and gable valid; every `ipa` string uses
   only these characters: `[ ] ˈ ˌ ˀ ː`, a space, and the letters
   `a b d e f h i j k l m n o s t u v w y æ ð ø ŋ œ ɐ ɑ ɒ ɔ ɕ ə ɛ ɡ ɶ ʁ ʌ` and the combining
   `U+032F` (lesson 2 uses none of the last few; later lessons do); no ASCII `g`, no Greek `ε`.
2. **Home with two lessons**, every state: nothing lit; lesson 1 part lit; lesson 1 fully lit (card
   says `Start Hvem er du?` with `Jeg`); lesson 1 fully lit and lesson 2 part lit (`Next in Hvem er
   du?`); both fully lit (`Every lesson is done`, `Practise`); the line under the greeting for
   each; the caption `2 lessons`; the two house links with their names; the plot and `Coming next`
   present with two lessons.
3. **Other pages with lesson 2**: an entry page, the done page (praise `Flot`, `All 8 windows lit.
   Flot!` in the live region, the chip with the lesson's title) and the bare lesson URL redirect all
   work for `hvem-er-du`; no source file outside tests and the catalog mentions `Hej og tak`,
   `Velkommen` or a window count other than from data.
4. **WebMCP**: `get_street` lists both lessons and the right `next`; `open_lesson` accepts
   `hvem-er-du` and lists both ids on a bad id; `go_from_done` and `get_result` work for it.
5. **Long entries**: `wordSize` returns the tiers above for n = 1, 6, 7, 10, 11, 16, 17, 21 and counts
   by code point; the Specimen and the Home card use it (checked on `Hyggeligt at møde dig` and
   `Hej`); the seam-anchored play button is not at a fixed pixel offset.
6. **IPA font**: the pronunciation line's IPA element's style resolves to the `fonts.ipa` family;
   `main.tsx` imports the two subset stylesheets and not the package index; the built CSS
   contains an `@font-face` for `Noto Sans Variable` and none for any other script's subset (this
   one test reads `dist/` from disk and fails with a message saying to run `npm run build`).
7. **llms.txt** and the tools table still agree.

## Answers to the grill

- **Long entries** follow the table under 3: the approved layout is the same split screen with a
  smaller, wrapping word. Lesson-page layout changes are in scope only for that.
- **`du`, `har`, `at`, `godt`**: corrected above from DDO; the reviewer's readings were right. The
  note on `godt` no longer claims a soft d.
- **Wiktionary**: not consulted for this lesson. CLAUDE.md now makes DDO the required source and
  Wiktionary optional, so no comparison table is owed.
- **Completed-street card**: its line is `Start again from the beginning.` and it names the first
  lesson through its word.

- The builder may update existing tests and test helpers that assumed one lesson
  (`src/test/render.tsx`, `src/test/mcpCalls.ts`) and `describe.ts`'s Home sentence.
- Placement of the IPA font family is the pronunciation component's and the Home card's; no other
  text changes font.
- Phrase IPA is composed and flagged for review as said above; the builder copies, never edits, the
  strings.
- No new token, colour or component is needed beyond `fonts.ipa`; lesson 2 uses `tegl`, whose
  `on-tegl` text colour already exists.

## Out of scope

Lessons 3 to 5, a Sounds page, recording, audio files, any change to the routes, pages other than
the Home card/skyline/caption/describe, `CLAUDE.md`, `docs/design/` and other specs.
