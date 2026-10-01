# Spec 11: no stray space before the punctuation after an external link

## Goal

On the About page every external link is followed by a visible, underlined space before the
punctuation that comes next: `cocode.dk .`, `ordnet.dk )`, `GitHub .`, `licence )`. Fix exactly
that and nothing else.

Read first: `docs/lean/10-about.md` (the `ExternalLink` component and the links), `docs/lean/lessons.md`.

## Cause (checked on the live page)

`ExternalLink` renders `cocode.dk ` (with a trailing space inside the anchor) followed by the
visually hidden `<span>(opens in a new tab)</span>`. The hidden span is out of the flow, but the
space before it is a real text node and shows, underlined.

## Fix

- The visible text node of an external link has no leading or trailing whitespace: the anchor's
  first child is exactly the link text (`cocode.dk`).
- The space that separates the link text from the hidden note moves inside the hidden span:
  `<span …> (opens in a new tab)</span>`, so the accessible name is still
  `cocode.dk (opens in a new tab)` and nothing visible changes except the removed stray space.
- Every use of `ExternalLink` benefits; no call site changes.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
Tests prove, at least:

1. For each external link on the About page: the anchor's first child is a text node equal to the
   link text with no whitespace at either end, and its hidden span's `textContent` is exactly
   ` (opens in a new tab)` (leading space).
2. The accessible name of each external link is `{link text} (opens in a new tab)` with one space.
3. In the About page's rendered paragraphs the text around each link reads without a space before
   the following punctuation: `Made by Babak at cocode.dk.`, `(ordnet.dk).`, `tell us on GitHub.`
   (compare each paragraph's `textContent` with the hidden suffix removed).
4. Earlier tests that asserted the old markup are updated, not deleted.

## Answers to the grill

- No visual change other than the removed space; the hidden note stays visually hidden and the link
  style stays the same.
- The footer line's `cocode.dk` link follows the same component and gets the same fix.

## Out of scope

Any other copy, spacing or link change; `CLAUDE.md`, `docs/design/` and other specs.
