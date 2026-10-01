# Spec 12: the landing page on a phone: one "Hej", and a street that fits

## Goal

Two defects on the landing page, measured on a real phone (Chrome on Android, 384 CSS px wide):

1. With no saved name the page says Hej twice: the top bar's wordmark `Hej.` and, right under it,
   the greeting `Hej.`.
2. The street is wider than the screen. The page itself does not scroll sideways (its width is
   384), but the row of five houses is 510 px wide inside a 344 px column, so the fourth house is
   cut off at the screen's edge and its title is squeezed into a one-letter column (`M / d / 0`).

Fix exactly these two. Read first: `docs/design/ART-DIRECTION.md` (the Skyline and Wordmark
paragraphs were updated for this), `docs/lean/01-hej-og-tak.md`, `docs/lean/03-hvem-er-du.md`,
`docs/lean/lessons.md`.

## 1. One Hej

- The Home page shows no wordmark. Its top bar keeps only what the other pages' bars keep besides
  the wordmark: from 900 px up, the main nav, right-aligned; on phone and tablet the bar holds
  nothing, so it is not rendered at all (no empty 64 px strip) and the greeting `h1` starts the
  page with 24 px of space above it.
- The greeting is unchanged: `Hej.` with no saved name, `Hej, {name}.` with one.
- Every other page keeps its wordmark exactly as today. The main nav (bottom bar on phone and tablet)
  stays on Home as today.

## 2. A street that fits

- Items in the street's two rows (the houses, and the titles under the ground line): the lessons,
  plus the empty plot while `lessons.length < PLANNED_LESSONS`. Call their number `N`.
- Every item is as wide as lets all `N` fit in the row: `(row width - 6 px × (N - 1)) / N`, but at
  most 96 px and at least 48 px. Both rows use the same width, so each title sits under its house.
  Houses scale uniformly: the SVG keeps its aspect ratio, so a narrower house is also shorter, and
  the ground line and the water still run the full content width, under the houses.
- The width rule is one piece of code shared by both rows. The number `N` reaches CSS as a custom
  property on the street element (`--lessons`), the one inline style the street may have (it is
  computed geometry).
- Titles: 14 px, weight 600, centred, `lang="da"`, wrap at spaces (`Mad og drikke` becomes two
  lines), never one letter per line; the count under it stays 13 px `ink-soft`, centred.
- The row scrolls sideways with snap only if `N` items at 48 px plus gaps still do not fit (not the
  case with five lessons on any width from 320 px up, so five houses are all on screen).
- Nothing else about the street changes: link names, lit windows, empty plot, the caption row
  `Your street` and `5 lessons`, tools.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
The tests prove, at least:

1. **One Hej**: with no name, exactly one element on Home reads `Hej.` (the `h1`) and there is no
   wordmark link; with a name, `Hej, Sam.` and no wordmark; on Sounds, Me, About, Not found and the
   lesson entry the wordmark is still there; Home still has the main nav landmark.
2. **Top bar**: on Home the bar renders no wordmark and, when it would be empty (phone and tablet),
   no `header` element at all; the nav stays reachable.
3. **Street items**: with five lessons the street has five items in each row and no empty plot; with
   three lessons (rendered directly) it has four (three plus the plot); `--lessons` equals the item
   count on the street element.
4. **Shared width**: the two rows use the same width rule (a structural test: one exported
   expression, imported by both); its clamp bounds are 48 px and 96 px and its gap is 6 px, asserted
   from the exported constants.
5. **Titles**: each title is `lang="da"` and sits in the same item as its count; the long title
   `Mad og drikke` is one text node (so it wraps at spaces).
6. Everything else, including the existing Skyline and Home tests, passes; earlier tests that
   asserted the wordmark on Home or the old widths are updated, not deleted.

jsdom has no layout, so the real proof is by eye on a phone after it is deployed; do not try to
assert pixel widths.

## Answers to the grill

- Home is the one page without a wordmark because its big greeting is the brand there; a name makes
  the greeting `Hej, Sam.`, which would still sit under a `Hej.` wordmark.
- 96 px stays the maximum, so tablet and desktop look as before; only phones get smaller houses.
- The minimum is 48 px so that five houses plus gaps (264 px) fit a 320 px screen's 280 px column.
- The empty plot counts as an item so it takes a house's width and the row never overflows because
  of it.
- Previews in `docs/design/previews/` show the old street and the wordmark on Home; the text above
  wins over them.

## Out of scope

Any other page, the nav, copy, colours, tokens, tools, audio, `CLAUDE.md`, `docs/design/` (already
updated) and other specs.
