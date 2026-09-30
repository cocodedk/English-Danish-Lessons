# Spec 07: two visible defects on the lesson entry page

## Goal

Two defects found on the live site. Fix exactly these two and nothing else.

Read first: `docs/design/ART-DIRECTION.md` (the Specimen), `docs/lean/01-hej-og-tak.md` and
`docs/lean/03-hvem-er-du.md` (long entries), `docs/lean/lessons.md`.

## 1. The pronunciation line runs under the play button

On a phone, a long entry such as `Hyggeligt at møde dig` (lesson 2, entry 8) has a pronunciation
line that wraps to two lines, and its last part (`dɑj]`) sits under the round play button, which
straddles the seam at the pane's right edge. Fix:

- The Danish pane's pronunciation line, and the `role="note"` / `role="status"` sound lines that sit
  under it, reserve the play button's column on the right: their right padding is the button's size
  plus its right inset plus 6 px of air. Today that is 60 + 18 + 6 = 84 px.
- One exported constant holds the number (name it `PLAY_COLUMN`, in the file that defines the play
  button), derived from the button's size and inset constants, never typed twice; the button and the
  reserved padding both read from it.
- The IPA keeps `white-space: nowrap`; the line still breaks only at the `·`. At 360 px wide
  the widest IPA in the catalog (`[ˈhyɡəlid ʌ ˈmøːðə dɑj]`) fits in the remaining width; check by
  reading the numbers, not by browser.
- Only the entry page's Specimen changes. The Home card, the Sounds rows and the done page are
  untouched.

## 2. `Next:Mange tak` has no space

The footer button on the entry page reads `Next:Mange tak` instead of `Next: Mange tak`: the button
is a flex container, which drops the trailing space of the text node before the Danish `<span>`.
Fix it so the label is `Next: {Danish}` with one space, for every entry, keeping `lang="da"` on the
Danish word. The accessible name of the button is exactly `Next: Mange tak`. `Finish` and `Back`
are unchanged.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
The tests prove, at least:

1. The footer button's accessible name is `Next: Hvordan har du det?` (and one more entry of your
   choice) with a single space after the colon, and its Danish part has `lang="da"`.
2. `PLAY_COLUMN` equals the play button's size plus inset plus 6, is imported by both the play button
   and the pronunciation wrapper on the entry page, and the wrapper and the sound notes use it (a
   structural test: jsdom has no layout, so assert that the wrapper is the one carrying the reserved
   padding and that the Sounds rows and the Home card do not use it).
3. Everything else still passes unchanged; earlier tests are updated only where they assert the old
   label text.

## Answers to the grill

- No other visual change: no colours, sizes, copy or layout besides the two fixes.
- The fix is the reserved right padding, not a taller pane: short entries look exactly as before.
- No new tool, route or token.

## Out of scope

Everything else, including any other overlap or spacing you notice: list it in the pull request
description instead.
