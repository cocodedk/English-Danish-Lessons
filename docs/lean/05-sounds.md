# Spec 05: the Sounds page

## Goal

A new page, `Sounds`, teaches the four things English speakers trip on first in Danish: the
letters æ ø å, the soft d, the Danish r and the stød. Each is a card with a short explanation and
three example words to hear. The main nav gets a third item, `Sounds`. There is no progress on this
page: nothing is lit, nothing is stored.

Read first: `CLAUDE.md`, `docs/design/ART-DIRECTION.md` (including its new Sound card and three-link
nav), `docs/lean/01-hej-og-tak.md` and `docs/lean/03-hvem-er-du.md`. Match the merged app's look.

## Route and navigation

- `#/sounds` shows the page. Title `Sounds · Hej.`; on arrival focus moves to the `h1`, as on every
  page. No other route changes.
- The main nav now has three items in this order: `Street` (`#/`), `Sounds` (`#/sounds`), `Me`
  (`#/me`): a bottom bar on phone and tablet, in the top bar on desktop, on Home, Sounds, Me and
  Not found (Sounds is current on `#/sounds`; Not found has none current). The lesson entry and done
  pages still have no main nav.
- Home, Me and Not found keep working; their tests are updated for the third item.

## The page

Top to bottom: top bar (wordmark, and on desktop the nav); `h1` `Sounds`; the line `Danish has
sounds English lacks. Hear each one, then say it.`; the no-sound note when it applies; the four
cards in the order below, 24 px apart; the bottom nav on phone and tablet. Content is one column,
max width 720 from 600 px up. Like Me, it has no houses and no facade backgrounds apart from each
card's tile.

```
SOUNDS (phone)
┌──────────────────────────┐
│ Hej.                     │
│ Sounds                   │
│ Danish has sounds …      │
│ ┌──────────────────────┐ │
│ │ ┌────┐ Three extra   │ │
│ │ │æ ø å│ letters       │ │
│ │ └────┘                │ │
│ │ Danish ends its …    │ │
│ │ ──────────────────── │ │
│ │ (▶) Æble      Apple  │ │
│ │     Sounds like …    │ │
│ │     tip              │ │
│ │ ──────────────────── │ │
│ │ (▶) Øl   …           │ │
│ └──────────────────────┘ │
│   Street  Sounds   Me    │
└──────────────────────────┘
```

### A card

A `paper` card (radius 22, padding 20) as a `section` with an `h2`. The header row holds a **tile**
and the `h2`: the tile is 72 × 72, square corners, filled with the card's facade colour and text
`on-…` colour, the mark in Bricolage 800 (40 px; the three-letter mark `æ ø å` at 28 px), centred;
the `h2` is Bricolage 700 26 beside it, vertically centred, 16 px gap. Under the header: the
explanation, body 17, each paragraph its own `p`. Then the **examples**, a list separated by 1.5 px
`line` hairlines. Each example row, left to right:

- a 48 px round play button (`fjord` / `on-fjord`), `aria-label` `Hear {Danish}`, the same play and
  stop glyphs and behaviour as the lesson page's button;
- a block with the Danish word (`lang="da"`, Bricolage 800, 32 px), the pronunciation line `Sounds
  like “{respelling}” · {IPA}` (Atkinson 17, the IPA in `fonts.ipa`, `white-space: nowrap`), the
  English (15, `ink-soft`), and the tip (15, `ink-soft`).

### Hearing

One shared rule for the whole page, the same as the lesson page: speak only with a local Danish
voice (`lang` starting `da`, `localService` true), at rate 0.85, never with another voice; known
voices with none qualifying at mount, or no speech API, show a `role="note"` under the intro line:
`This device has no Danish voice, so there is no sound here. The sound guides still work.` or
`This browser can't play sound. The sound guides still work.` and every play button is
`aria-disabled="true"`. Empty voice list: nothing until a tap; on a tap the button is busy (stop
glyph, `aria-busy="true"`) for at most 1 s, then speaks or falls back to the no-voice note. Only one
word speaks at a time: starting another cancels the first, pressing the playing button stops it.
A speech `error` other than a cancel shows `role="status"` `The sound didn't play. Try again.`
Reuse the lesson page's speech hook; do not write a second one.

## The four cards

Data lives in `src/catalog/sounds.ts`: `SoundCard = { id, mark, color, title, paragraphs:
readonly string[], examples: readonly SoundExample[] }` and `SoundExample = { id, da, en,
respelling, ipa, tip }`, exported as `sounds`. Character for character:

### `vowels`: mark `æ ø å`, colour `gul`, title `Three extra letters`

Paragraphs: `Danish ends its alphabet with æ, ø and å. None of them is hard once you hear it.`

| id | da | en | respelling | ipa | tip |
|---|---|---|---|---|---|
| `aeble` | Æble | Apple | EH-bluh | `[ˈɛːblə]` | æ is like the e in bet, held a little longer. |
| `oel` | Øl | Beer | url | `[ˈøl]` | ø is like ur in fur, without the r. |
| `aar` | År | Year | aw | `[ˈɒˀ]` | å is like the aw in law. The voice catches at the end. |

### `soft-d`: mark `d`, colour `hav`, title `The soft d`

Paragraphs: `After a vowel, d is often soft. Put your tongue where you put it for th in this, and do not push.` · `You will meet it in many of the most common words.`

| id | da | en | respelling | ipa | tip |
|---|---|---|---|---|---|
| `mad` | Mad | Food | mahth | `[ˈmað]` | The d at the end is a soft th. |
| `roed` | Rød | Red | rurth | `[ˈʁœðˀ]` | A soft th again, and the voice catches at the end. |
| `gade` | Gade | Street | GEH-thuh | `[ˈɡæːðə]` | The d between two vowels is soft too. |

### `r`: mark `r`, colour `tegl`, title `The Danish r`

Paragraphs: `Danish r is made far back in the throat, close to a gentle gargle.` · `After a vowel it often fades into a short uh.`

| id | da | en | respelling | ipa | tip |
|---|---|---|---|---|---|
| `tre` | Tre | Three | treh | `[ˈtʁɛˀ]` | The r comes from the back of the throat. |
| `bro` | Bro | Bridge | broh | `[ˈbʁoˀ]` | Same r, after the b. |
| `bror` | Bror | Brother | broa | `[ˈbʁoɐ̯]` | One syllable: the last r fades into a short uh glide. |

### `stoed`: mark `ˀ`, colour `salvie`, title `The stød`

Paragraphs: `Some Danish syllables end in a tiny catch in the voice, like the pause in uh-oh.` · `It changes the word: hun is she, and hund is dog.`

| id | da | en | respelling | ipa | tip |
|---|---|---|---|---|---|
| `hun` | Hun | She | hoon | `[ˈhun]` | No catch. The sound runs straight on. |
| `hund` | Hund | Dog | hoon (with a catch) | `[ˈhunˀ]` | The same sounds plus the catch at the end. |
| `mand` | Mand | Man | mahn (with a catch) | `[ˈmanˀ]` | Another word with the catch. |

Sources, checked 2026-09-30 on ordnet.dk (DDO), one entry per word, `g`→`ɡ` and `ε`→`ɛ`: `æble`
`[ˈεːblə]`, `øl` `[ˈøl]`, `år` `[ˈɒˀ]`, `mad` `[ˈmað]`, `rød` `[ˈʁœðˀ]`, `gade` `[ˈgæːðə]`, `tre`
`[ˈtʁεˀ]`, `bro` `[ˈbʁoˀ]`, `bror` `[ˈbʁoɐ̯]`, `hun` `[ˈhun]`, `hund` `[ˈhunˀ]`, `mand` `[ˈmanˀ]`.
List all twelve examples and the four explanations in the pull request description under "Danish
for review".

## WebMCP

Extend the existing tools (same helper, same rules as spec 01). `describe` answers
`page: 'sounds'` with the summary `Four cards about Danish sounds, each with three example words to
hear.` Two new tools, registered only on this page:

| Tool | Input | Answer |
|---|---|---|
| `get_sounds` | `{}` | `{ voice: 'available'\|'none'\|'unsupported'\|'unknown', sounds: { id, mark, title, examples: { id, da, en, respelling, ipa }[] }[] }` |
| `hear_example` | `{ soundId: string, exampleId: string }` | `{ ok: boolean, started: boolean, reason?: 'no-danish-voice'\|'unsupported'\|'error' }` or `{ ok: false, error, soundIds?: string[], exampleIds?: string[] }` |

`get_sounds` is `readOnlyHint`. `hear_example` runs the play button's handler. `public/llms.txt`
gets a `## Sounds` section with both tools, and the sync test keeps it equal to the registered
names.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
The tests prove, at least:

1. **Data**: the four cards and twelve examples exactly as above; ids unique within the catalog;
   every IPA uses only the allowed symbol set and no ASCII `g` or Greek `ε`; each card has three
   examples; card colours are the five facade colours and differ.
2. **Page**: title, `h1`, intro, focus on arrival; four `section`s each with an `h2`, the tile mark,
   the paragraphs and three rows; every Danish word has `lang="da"`; each row shows respelling,
   IPA (in the IPA font), English and tip; every play button is named `Hear {Danish}`.
3. **Hearing**: a local Danish voice speaks the row's Danish at rate 0.85; a non-local Danish voice
   or only non-Danish voices speak nothing and show the note on mount; an empty voice list waits
   on the tap only; a second press stops; another row cancels the first; `error` shows the retry
   status; no speech API shows the other note; play buttons are `aria-disabled` when there is no
   sound.
4. **Nav**: three items in the right order on Home, Sounds, Me and Not found with the right one
   current (none on Not found) and no nav on the lesson entry and done pages.
5. **WebMCP**: `get_sounds` and `hear_example` with valid input, bad ids (answers list the valid
   ids), wrong types, `[]` and extra keys; nothing throws; both registered only on `#/sounds`;
   `describe` says `sounds`; `llms.txt` and the registered names agree.
6. **Static**: the usual no-network, no-colour-literal and built-CSS checks still pass.

## Answers to the grill

- **Split screen and seam**: the contract in `CLAUDE.md` governs lesson entry pages. A Sounds
  example is a compact row inside a card (Danish word, then the two pronunciation helps, then the
  English), not a specimen: no facade pane and no seam. `CLAUDE.md` now says so.
- **"I said it"**: only lesson entries have it. Sounds is reference and practice with no progress,
  so there is no confirmation state and nothing stored. `CLAUDE.md` now says so.
- **`bror` respelling**: `broa`, one syllable, because DDO's `[ˈbʁoɐ̯]` ends in a non-syllabic glide.
  A hand-made guide, flagged for the owner's review with the rest.

- No lit windows, no storage, no progress for this page: a learner who never opens it loses
  nothing, and opening it changes nothing stored.
- The tile is a plain square sign, not a house: houses mean lessons.
- Nav tests and helpers from earlier specs are updated for three items, not deleted.
- The builder copies the strings and never edits the Danish or the IPA.
- Desktop: one column, max 720, centred, nav in the top bar.

## Out of scope

Recording, audio files, exercises or quizzes, progress, minimal-pair games, more sounds, changes
to the lesson pages, `CLAUDE.md`, `docs/design/` and other specs.
