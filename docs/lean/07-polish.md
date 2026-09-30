# Spec 07: two visible defects on the lesson entry page

## Goal

Two defects found on the live site. Fix exactly these two and nothing else.

Read first: `docs/design/ART-DIRECTION.md` (the Specimen), `docs/lean/01-hej-og-tak.md` and
`docs/lean/03-hvem-er-du.md` (long entries), `docs/lean/lessons.md`.

## 1. The pronunciation line runs under the play button

On a phone, a long entry such as `Hyggeligt at møde dig` (lesson 2, entry 8) has a pronunciation
line that wraps to two lines, and its last part (`dɑj]`) sits under the round play button, which
straddles the seam at the pane's right edge and reaches 30 px up into the Danish pane. Fix it
vertically, not horizontally:

- The Danish pane's bottom padding becomes the button's half height plus 6 px of air: 30 + 6 = 36 px
  (it was 20). The last line of the pane (the pronunciation line, or the `role="note"` /
  `role="status"` sound line under it) then always ends above the button's top edge, whatever its
  width, so nothing can run under the button.
- One exported constant holds the number (name it `PLAY_OVERHANG`, in the file that defines the play
  button), derived from the button's size constant (`size / 2 + 6`), never typed twice; the pane's
  bottom padding reads it.
- A pane whose content already needs more than the 170 px minimum height grows by 16 px; a pane
  shorter than that keeps its 170 px minimum and does not grow at all. The 170 px minimum height
  does not change. The play button still sits on the seam and the English pane's top padding still
  clears it.
- Line breaking is unchanged: the IPA keeps `white-space: nowrap` and never splits; the line breaks
  at the `·`, and the respelling may wrap at its own spaces when it alone is wider than the pane.
- Only the entry page's Specimen changes. The Home card, the Sounds rows and the done page are
  untouched. In `docs/design/ART-DIRECTION.md` the Danish pane padding is now `44px 22px 36px`.

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
2. `PLAY_OVERHANG` equals half the play button's size plus 6 (36 today), is defined next to the
   play button, and is the value the entry page's Danish pane uses for its bottom padding (a
   structural test: jsdom has no layout, so assert the pane reads the constant and that the Sounds
   rows, the Home card and the done page do not use it).
3. Everything else still passes unchanged; earlier tests are updated only where they assert the old
   label text.

## Answers to the grill

- No other visual change: no colours, sizes, copy or layout besides the two fixes.
- The fix is the pane's bottom padding only; the minimum height stays 170 px, so short panes do not
  change size and long ones grow by up to 16 px. A right-hand reserve would have made short entries
  such as `Tak` wrap at 360 px, which is worse.
- The respelling may wrap at its spaces, as it already could; only the IPA is kept whole.
- No new tool, route or token.

## Out of scope

Everything else, including any other overlap or spacing you notice: list it in the pull request
description instead.
