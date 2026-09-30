# Spec 06: record yourself

## Goal

On a lesson entry page the learner can record themselves saying the word and play it back, to
compare with the Danish voice. The recording lives only in memory: it is never stored, never sent,
and is gone when the learner leaves the entry or the page. Nothing else about the lesson changes.

Read first: `CLAUDE.md`, `docs/design/ART-DIRECTION.md`, `docs/lean/01-hej-og-tak.md` (the entry page
this extends) and `docs/lean/lessons.md`.

## Where it sits on the entry page

Between the Lamp row and the `I said it` button group the page gets a **recorder** block. Top to
bottom on the entry page: Specimen, Lamp row, recorder, `I said it` button and its hint, footer row.
The recorder is a `section` with the accessible name `Record yourself`, no visible heading.

```
ENTRY (phone), recorder states
idle            [  ● Record yourself  ]   ← secondary button, mic glyph
                Your recording stays on this device and is gone when you leave this page.

recording       [  ■ Stop  ]  ● Recording… 0:07      ← primary button; a lamp-coloured dot
recorded        [ ▶ Hear yourself ] [ Record again ]
denied          The microphone is blocked. Allow it in your browser settings, then try again.
                [ Try again ]
no microphone   No microphone found. Plug one in or check your settings.   [ Try again ]
unsupported     This browser can't record. You can still say it out loud.        (no button)
failed          Recording didn't work. Try again.   [ Try again ]
```

## Behaviour

- **States**: `idle`, `asking`, `recording`, `recorded`, `denied`, `no-microphone`, `failed`,
  `unsupported`. `unsupported` is decided on mount: no `navigator.mediaDevices.getUserMedia` or no
  `MediaRecorder`. Everything else starts at `idle`.
- **Record yourself** (idle, and `Try again`/`Record again`): asks for the microphone with audio only
  (`{ audio: true }`). The state is `asking` until the browser answers: the button is
  `aria-disabled`, `aria-busy="true"`, reading `Waiting for permission…`. A refusal
  (`NotAllowedError`, `SecurityError`) is `denied`; no device (`NotFoundError`,
  `OverconstrainedError`) is `no-microphone`; anything else is `failed`. On success it cancels any
  Danish voice speaking and starts a `MediaRecorder` on the stream.
- **Recording**: the button reads `Stop`; beside it a 10 px `lamp` dot and `Recording… {m}:{ss}`
  (elapsed, updating once a second; under reduced motion the dot is static, and it is static
  anyway). A visually hidden `role="status"` says `Recording.` on start and `Recording stopped.`
  on stop. Recording stops by itself at 20 seconds. Pressing `Stop` (or the 20 s limit) stops the
  recorder and releases every track of the stream at once.
- **Recorded**: the audio is kept as one `Blob` turned into an object URL and played through an
  `<audio>` element created in code (no visible controls). `Hear yourself` plays it and becomes
  `Stop` while playing; it returns to `Hear yourself` when the audio ends. Playing the recording
  cancels any Danish voice; playing the Danish voice (the play button on the Specimen) stops the
  recording's playback. `Record again` discards the old recording (revoking its URL) and starts a
  new one exactly as above.
- **Leaving**: moving to another entry, another page, or unmounting the page stops a running
  recorder, releases the stream's tracks, stops any playback and revokes the object URL. The
  recording is gone. Nothing is written to storage, `localStorage`, IndexedDB or the network.
- **Denied, no microphone, failed**: show the sentence from the wireframe with `Try again`, which
  asks again. `role="status"` for the sentence.
- **Independent of progress**: recording or playing back never lights a window; `I said it` works
  exactly as before, in every recorder state.
- **Copy**: the privacy line `Your recording stays on this device and is gone when you leave this
  page.` shows in `idle`, `recording` and `recorded`; not in the error states.
- **Look**: the recorder's buttons are the existing primary and secondary buttons (52 px tall), the
  row wraps on a narrow phone, the sentences use body 17 and `ink-soft` 15 for the privacy line. The
  mic, stop and play glyphs are inline SVG in `currentColor`. No new tokens or colours.
- **Support is not assumed**: `MediaRecorder` output type comes from the browser (`recorder.mimeType`);
  the `Blob` uses it.

## WebMCP

Tools never start the microphone: consent is the learner's own gesture. `get_entry` gains one
field, `recording: 'none'|'asking'|'recording'|'recorded'|'denied'|'no-microphone'|'failed'|'unsupported'`
(`'none'` is `idle`). No new tool. `public/llms.txt` is unchanged except that the `get_entry`
line says it also returns the recorder's state. The tools test and the sync test are updated.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
Tests fake `navigator.mediaDevices.getUserMedia`, `MediaRecorder`, `URL.createObjectURL`,
`URL.revokeObjectURL`, `HTMLMediaElement.prototype.play/pause` and timers in
`src/test/setup.ts` or a helper. They prove, at least:

1. **State machine** (a pure module, tested without React): every transition in `idle`, `asking`,
   `recording`, `recorded`, `denied`, `no-microphone`, `failed`, `unsupported`, including the three
   error mappings, the 20 s auto-stop, and `Record again`.
2. **Entry page**: the recorder appears in the right place; each state shows its exact copy and its
   buttons (names, `aria-busy`, `aria-disabled`); the status messages are announced; the elapsed time
   counts up; `unsupported` shows the note and no button.
3. **Cleanup**: stopping releases every track; leaving the entry, navigating away and unmounting each
   stop the recorder, stop playback, release tracks and revoke the URL; `Record again` revokes the
   old URL.
4. **Audio interplay**: starting to record cancels speech; playing the recording cancels speech;
   pressing the Specimen's play button stops the recording's playback.
5. **Independence**: `I said it` lights the window in every recorder state; recording never does.
6. **No persistence**: after a full record, play, leave cycle nothing new is in `localStorage`, and
   no source file mentions `indexedDB`, `fetch(`, `XMLHttpRequest`, `sendBeacon` or `WebSocket`.
7. **WebMCP**: `get_entry.recording` is correct in each state; no tool starts or stops recording;
   `llms.txt` and the registered names agree.

## Answers to the grill

- The 20 second limit, the `Waiting for permission…` label and every sentence above are final.
- The recorder block is part of the entry page only; Sounds and the done page do not get one.
- Recording does not light windows on purpose: the window means the learner said it aloud, which the
  app cannot check either way.
- Error messages are plain and never blame the learner; `Try again` is always offered when a retry
  could help.
- Tests of earlier specs that snapshot the entry page's structure are updated, not deleted.

## Out of scope

Saving or sharing a recording, waveform or level meters, comparing the recording to the voice,
audio files, more than one take kept at once, recording on the Sounds page, any change to routes,
tokens, `CLAUDE.md`, `docs/design/` and other specs.
