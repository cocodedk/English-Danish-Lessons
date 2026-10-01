# Spec 13: tell people when there is no Danish sound

## Goal

Hej. plays Danish only with a Danish voice the device already has. On a device without one (the
owner's own phone is one), nothing can be heard, and today the landing page does not say so: the
note only appears on the lesson and Sounds pages, and only once the voice list is known. Say it
early and plainly, on the landing page, and tell people how to fix it. Nothing else changes.

Read first: `CLAUDE.md`, `docs/design/ART-DIRECTION.md`, `docs/lean/01-hej-og-tak.md` (the
hearing rules), `docs/lean/05-sounds.md`, `docs/lean/06-record-yourself.md` (the reworded notes) and
`docs/lean/lessons.md`. Match the look of the merged app.

## 1. Know early

In the speech hook (`src/speech`), the voice state is decided on mount, not only on a tap:

- States: `checking`, `available`, `none`, `unsupported`.
- No speech API: `unsupported` at once. A voice list that already holds a qualifying voice
  (`lang` starting `da`, `localService` true): `available`. A list with voices but none that
  qualifies: `none` at once.
- An empty list: `checking`. Listen for `voiceschanged` for at most 2 seconds from mount. A
  qualifying voice means `available`; otherwise, after the 2 seconds, `none`. A qualifying voice
  that arrives later still turns it to `available` (the notice disappears).
- The one-second wait on a tap stays as it is.
- The hook exposes the state (the existing `voice` value gains `'checking'`; `get_entry`,
  `get_sounds` and the new `get_street.voice` report `'unknown'` for `checking` and otherwise the
  state's name).

## 2. The landing page tells people

On Home, when the state is `none` or `unsupported`, a **notice** shows between the line under the
greeting and the street (above the storage note when both show). While `checking` and when
`available` nothing shows. It is a `paper` card like the storage note (radius 22, padding 20,
`role="note"`, body 17), not dismissible, with these exact texts:

- `none`: first paragraph `No Danish sound on this device.` in 17/700, then `Hej. plays Danish with a
  Danish voice your device already has, and this one has none. The sound guides under each word still
  work.` Then a native `<details>` whose `<summary>` reads `How to add a Danish voice` and whose body
  is two paragraphs: `Open your device's text-to-speech or spoken-content settings, add a Danish
  voice, then reload this page. On Android it is usually under Settings, General management,
  Text-to-speech. On an iPhone it is under Settings, Accessibility, Spoken Content, Voices.` and
  `Voices that need the internet are not used, because that would send the words to a speech
  service.`
- `unsupported`: `No Danish sound in this browser.` (17/700) and `Hej. cannot play sound here. The
  sound guides under each word still work. Another browser may play it.` No details.

The `<summary>` is a 48 px-high target, `fjord` text, underlined, with the default marker; the open
state needs no animation.

```
HOME (phone), no Danish voice
┌──────────────────────────┐
│ Hej.                     │
│ Your street is waiting.  │
│ ┌──────────────────────┐ │
│ │ No Danish sound on   │ │
│ │ this device.         │ │
│ │ Hej. plays Danish …  │ │
│ │ ▸ How to add a Danish│ │
│ │   voice              │ │
│ └──────────────────────┘ │
│ Your street     5 lessons│
│  …houses…                │
└──────────────────────────┘
```

## 3. Everywhere else

The lesson entry and Sounds notes already say it; they now also appear in the empty-list case after
the 2 seconds (the new state), with their existing texts. No new note elsewhere.

## WebMCP

`get_street` gains `voice: 'available'|'none'|'unsupported'|'unknown'`. The other tools keep their
shapes (`get_entry` and `get_sounds` already report `voice`). `public/llms.txt`'s `get_street` line
says it also returns whether a Danish voice is available. The sync test is updated.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
Tests fake `speechSynthesis` (voices, `voiceschanged`, fake timers) and prove, at least:

1. **State machine**: no API gives `unsupported`; a local Danish voice gives `available`; only
   non-Danish or only non-local Danish voices give `none` at once; an empty list gives `checking`,
   then `none` after exactly 2 s with no event, `available` if a qualifying voice arrives by
   `voiceschanged` before 2 s, and also if it arrives after (turning `none` back to `available`).
2. **Home notice**: nothing while `checking` or `available`; the `none` text with the `<details>`
   (closed by default, the exact summary and two paragraphs) and the `unsupported` text without
   details; placement before the storage note and before the street; `role="note"`; no dismiss
   control; it disappears when a voice turns up.
3. **Other pages**: the lesson entry and Sounds notes appear in the empty-list case after 2 s and
   disappear if a voice arrives; their texts are unchanged.
4. **WebMCP**: `get_street.voice` in each state; `llms.txt` and the registered names agree; the old
   tap behaviour (1 s wait, busy button, fallback to the note) still passes.
5. The existing hearing tests pass unchanged except where they assumed an empty list means unknown
   forever; those are updated, not deleted.

## Answers to the grill

- The 2 s window is for the browser to load its voice list (Chrome on Android returns an empty list
  at first); after it, "none" is the honest answer, and it reverses if a voice appears.
- Not dismissible on purpose: it is a fact about the device, like the storage note, and it vanishes
  once the cause is fixed.
- Remote voices stay refused: privacy first (no request leaves the site). A consented online voice or
  recorded audio would be a separate spec.
- The platform paths are hints (`usually under`); they vary by maker and version.
- `get_street.voice` reports `unknown` while `checking`.

## Out of scope

Recorded audio, remote voices, any consent flow, a settings control, copy changes elsewhere,
colours, tokens, `CLAUDE.md`, `docs/design/` and other specs.
