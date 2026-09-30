# Art direction — Hej.

Binding for every screen. The loop never edits this file. Propose a change in a spec's
`## Questions`, never by quietly diverging. Exact colour values live in `src/styles/tokens.css`
and must equal the table below.

## Concept: a Danish street

Nyhavn by day, the *blå time* (blue hour) by night. The learner builds a street: **each lesson is
a house, each entry is a window, and a window lights when the learner has heard and said that
entry.** A finished lesson gets bunting, the flags Danes string up for birthdays.

That house-and-window row is the one memorable thing. Everything around it is quiet: cool pale
sky, deep-blue ink, one action colour, generous air. The interface is never a card grid.

- **Light theme «Dagslys»**: pale fjord-mist sky, painted facades in Nyhavn colours, unlit
  windows dark like real daytime windows, lit windows amber.
- **Dark theme «Den blå time»**: midnight-blue sky, the same facades one step darker, windows
  glow. Not a generic dark mode: the lamps are the reward.
- Both follow the device by default (`auto`), and the learner can force either.

Sharp corners for architecture (houses, gables); full round for controls (pills, the play
button); 22 px for the paper card. No gradients except the 18 px water under the ground line.
No drop shadows: separation comes from colour and the paper ring around the play button.

## Colour tokens (exact)

Names are roles, never palette names. Every token is declared in both themes.

| Token | Light | Dark | Role |
|---|---|---|---|
| `sky` | `#E5ECF1` | `#0B1730` | page background |
| `paper` | `#F8FAFB` | `#13223D` | English pane, cards, nav bar |
| `ink` | `#14233B` | `#EDF2F7` | text |
| `ink-soft` | `#485A72` | `#A9B8CB` | secondary text |
| `line` | `#C3CFD9` | `#2A3B58` | hairlines, water, dashed plots |
| `edge` | `#6A7F96` | `#61789A` | outline of secondary buttons and inputs |
| `fjord` | `#1D4E85` | `#8DB8EE` | the one action colour: primary buttons, links, focus ring |
| `on-fjord` | `#F8FAFB` | `#0B1730` | text on `fjord` |
| `lamp` | `#F4B63A` | `#FFC65A` | a lit window; the active nav pip |
| `window-off` | `#33465F` | `#1C2E4E` | an unlit window |
| `window-frame` | `#F8FAFB` | `#0B1730` | window frames, mullions, door |
| `ground` | `#14233B` | `#3A4E70` | the ground line under the street |
| `flag` | `#C8102E` | `#F0546D` | the Dannebrog red: the full stop in the wordmark, nothing else |
| `gul` | `#EBB94A` | `#B58A2A` | facade: yellow |
| `on-gul` | `#14233B` | `#0B1730` | text on `gul` |
| `tegl` | `#A5402D` | `#8E3626` | facade: brick |
| `on-tegl` | `#F8FAFB` | `#EDF2F7` | text on `tegl` |
| `hav` | `#2E7291` | `#2A6580` | facade: sea blue |
| `on-hav` | `#F8FAFB` | `#EDF2F7` | text on `hav` |
| `salvie` | `#93B08C` | `#4A664A` | facade: sage |
| `on-salvie` | `#14233B` | `#F1F5F0` | text on `salvie` |
| `rosa` | `#DA9C9A` | `#B98283` | facade: dusty pink |
| `on-rosa` | `#14233B` | `#0B1730` | text on `rosa` |

Contrast floor, tested from `tokens.css` in both themes:

- Text pairs at least **4.5:1**: `ink/sky`, `ink/paper`, `ink-soft/sky`, `ink-soft/paper`,
  `on-fjord/fjord`, and each `on-X/X` for `gul`, `tegl`, `hav`, `salvie`, `rosa`.
- Non-text pairs at least **3:1**: `fjord/sky`, `fjord/paper`, `edge/sky`, `edge/paper`,
  `lamp/window-off`.
- The `flag` red is decorative (a full stop in the logo) and is exempt.

## Type

Two families, both self-hosted (`@fontsource-variable`, latin + latin-ext, so æ ø å and IPA
render): **Bricolage Grotesque** for display, **Atkinson Hyperlegible Next** for everything else
including IPA. Fallback `system-ui, sans-serif`.

| Role | Face | Size / line | Weight | Tracking |
|---|---|---|---|---|
| Danish word (specimen) | Bricolage | `clamp(72px, 22vw, 96px)` / 0.95 | 800 | −0.035em |
| Praise word (done page) | Bricolage | `clamp(44px, 13vw, 64px)` / 1 | 800 | −0.03em |
| Page title `h1` | Bricolage | 44 / 1.02 (≥ 900 px: 56) | 700 | −0.025em |
| Section title `h2`, English meaning | Bricolage | 26 / 1.15 | 700 / 600 | −0.01em |
| Wordmark | Bricolage | 26 / 1 | 800 | −0.02em |
| Body | Atkinson | 17 / 1.45 | 400 | 0 |
| Button, label | Atkinson | 17 / 1 | 700 | 0 |
| Pronunciation line | Atkinson | 19 / 1.35 | respelling 700, IPA 400 | 0 |
| Small | Atkinson | 15 / 1.4 | 400 / 600 | 0 |
| Caption | Atkinson | 13 / 1.3 | 400 | 0 |

Body lines stay under 60 characters. Sentence case everywhere. The pronunciation line reads
`Sounds like “hi” · [ˈhɑj]`; when it wraps, it breaks at the `·`, never inside the IPA
(`white-space: nowrap` on the IPA).

Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 44. Page gutter 20 (≥ 600 px: 32).
Radii: 26 (pills), 22 (paper card, dialog, English pane), 50 % (chips, play button), 0 (houses).

## Layout

Breakpoints: **phone** < 600, **tablet** 600–899, **desktop** ≥ 900. Content is one column, at
most 560 px wide on lesson pages and 720 px on Home and Me, centred from 600 px up. Phone and
tablet have a bottom nav; desktop moves the same two links into the top bar and drops the
bottom nav.

```
HOME (phone)                         LESSON ENTRY (phone)
┌──────────────────────────┐         ┌──────────────────────────┐
│ Hej.                     │         │ ‹   Hej og tak · 3 of 8  │
│                          │         │      ┌─┐▄▄┌─┐            │
│ Hej, Sam.                │         │ ▄▄▄▄▄│ gable  │▄▄▄▄        │
│ 8 windows lit on your    │         │ ██  Hej                 ██│  Danish pane,
│ street.                  │         │ ██  Sounds like “hi” ·  ██│  lesson colour
│                          │         │ ██  [ˈhɑj]        (▶)  ██│
│ Your street      1 lesson│         │ ▒▒ Hello               ▒▒│  English pane, paper
│  ┌┐ ┌──┐                 │         │ ▒▒ Hello, or hi. …     ▒▒│
│  ││ │▒▒│ · · ·           │         │  ◻ Not lit yet           │
│ ═╧╧═╧══╧═════════ ground │         │ [      I said it       ] │
│ ~~~~~~~~ water ~~~~~~~~~ │         │ [ Back ] [  Next: Tak  ] │
│ ┌──────────────────────┐ │         └──────────────────────────┘
│ │ Next in Hej og tak   │ │
│ │ Tak         [Continue]│ │         DONE (all lit)
│ │ Thanks · [ˈtɑɡ]      │ │         ┌──────────────────────────┐
│ └──────────────────────┘ │         │ ▼▼▼▼▼▼▼▼ bunting ▼▼▼▼▼▼▼ │
│ ──────────────────────── │         │      Velkommen!          │
│   Street        Me       │         │ Sounds like “VEL-kum-en” │
└──────────────────────────┘         │ · [ˈvɛlˌkʌmˀən]          │
                                     │ Welcome!                 │
                                     │      (large house, all   │
                                     │       windows lit)       │
                                     │ [ Back to your street ]  │
                                     └──────────────────────────┘
```

## Components

**Specimen** (the teaching card). Two stacked panes with no gap:

- *Danish pane*: background is the lesson colour (`gul` etc.), text `on-…`. Top edge is a stepped
  gable: `clip-path: polygon(0 26px, 14% 26px, 14% 17px, 28% 17px, 28% 8px, 44% 8px, 44% 0, 56% 0,
  56% 8px, 72% 8px, 72% 17px, 86% 17px, 86% 26px, 100% 26px, 100% 100%, 0 100%)`. Padding
  `44px 22px 20px`, min-height 170. Holds the Danish word and the pronunciation line.
- *English pane*: `paper`, bottom radius 22, padding `18px 22px 20px`. Holds the meaning and the
  note. When the play button sits on the seam, the pane's top padding is 34.
- *Play button*: 60 px round, `fjord` / `on-fjord`, `box-shadow: 0 0 0 5px var(--paper)` (the paper
  ring), `right: 18px`, its centre on the seam between the panes.

**House** (SVG, drawn from data). One per lesson. Geometry, in user units:

```js
// entries → 2 columns × rows = ceil(entries / 2). width w = 96, roof = 34, wall = 30 + 40 * rows
// H = wall + roof. The SVG is w × H; scale it with CSS width.
const gable = {           // filled with the lesson colour
  step:   `M0 34 L${w/5} 34 L${w/5} 22.4 L${2*w/5} 22.4 L${2*w/5} 11.2 L${3*w/5} 11.2 L${3*w/5} 22.4 L${4*w/5} 22.4 L${4*w/5} 34 L${w} 34 L${w} ${H} L0 ${H} Z`,
  bell:   `M0 40 Q${w*.18} 40 ${w*.24} 18.7 Q${w*.3} 1.7 ${w/2} 0 Q${w*.7} 1.7 ${w*.76} 18.7 Q${w*.82} 40 ${w} 40 L${w} ${H} L0 ${H} Z`,
  point:  `M0 34 L${w/2} 0 L${w} 34 L${w} ${H} L0 ${H} Z`,
  cornice:`M0 18.7 L${w} 18.7 L${w} ${H} L0 ${H} Z`,
}
// windows: pad 13, column gap 9, row gap 12, size gw = (w - 26 - 9) / 2, gh = 28, first row y = 34 + 13
// window i (row-major): lit → fill lamp + a glow rect (x-3, y-3, gw+6, gh+6, r 4, lamp, opacity .22)
//                       unlit → fill window-off
// every window: rx 3, stroke window-frame 2, plus a cross mullion (stroke window-frame 1.6, opacity .9)
// door: 18 × 24, rx 9, centred, bottom-aligned, window-frame at opacity .85
// baseboard: rect (0, H-8, w, 8), black at opacity .12
```

One window per entry, in entry order, filling row by row. A lit window is never the only cue:
the house always has a text count beside or under it ("6 of 8").

**Skyline**. The lesson houses in one row, bottom-aligned on the ground line, 6 px apart, each with
its title (15/600) and count (13, `ink-soft`) below. The row scrolls sideways with snap when it
overflows; the scrollbar is hidden. A 6 px `ground` bar runs full width under the houses and an
18 px water strip fades from `line` to transparent beneath it. After the last house a dashed
empty plot (`line`, dash 4 4, house-sized, `aria-hidden`) with the caption "Coming next".

**Bunting**. 11 triangular flags (26 wide, 30 tall) hung on a sagging string across the top of
the page, facade colours in the order `gul, tegl, hav, salvie, rosa` repeating. String: `ink` at
opacity .7, 1.6 wide. Decorative, `aria-hidden`.

**Lamp** (lesson page). A 30 × 26 window glyph plus text: unlit `window-off` + "Not lit yet",
lit `lamp` with glow + "Lit". It sits above the action buttons.

**Buttons**. Height 52, radius 26, padding `0 24px`. *Primary*: `fjord` / `on-fjord`.
*Secondary*: transparent, `box-shadow: inset 0 0 0 2px var(--edge)`, `ink` text. Disabled: 55 %
opacity and `aria-disabled`. Pressed: `translateY(1px)`. Hover changes colour only.
Focus-visible: `outline: 3px solid var(--fjord); outline-offset: 3px`, never removed.

**Nav**. Paper bar, top border 1.5 px `line`, padding `10px 16px 24px`, items centred with a
6 px × 22 px pip above the label: `lamp` when current, transparent otherwise (`aria-current="page"`
carries the meaning, the pip is a bonus). Labels 14/600; current `ink`, others `ink-soft`.

**Wordmark**. "Hej" in Bricolage 800 followed by a `flag`-coloured full stop. It links home.

## Motion

Three motions only. Everything else is static.

1. **Lamp glow** (answers a tap): when a window lights, its lamp fill and glow fade in over
   350 ms `ease-out`.
2. **Bunting drop** (the one orchestrated moment): on the done page, when every window is lit,
   the flags drop from above the viewport with a 40 ms stagger over 700 ms and settle. Once per
   visit.
3. **Press**: buttons move 1 px down for 120 ms.

Under `prefers-reduced-motion: reduce` all three happen instantly (the lamp is lit, the bunting is
hung), nothing is skipped. No parallax, no scroll effects, no hover lifts, no looping motion.

## Copy voice

Plain English, sentence case, second person, short. Name things by what the learner does: "I said
it", "Next: Tak", "Back to your street". An action keeps its name across the flow. Errors say what
happened and what to do, without apology. Empty states point at the next action. The Danish is
the hero: UI copy stays out of its way.

## The previews

`docs/design/previews/board-light.png` and `board-dark.png` show Home, a lesson entry and the done
page, on a phone. They are **layout and mood references**: where this document or the spec says
something different, the text wins. Known differences: the previews show a theme chip in the top
bar (there is none: the theme is chosen on Me), a third nav item "Sounds" (there are two items),
several lesson houses (there is one, plus the empty plot), a "Say it" button beside "Hear again"
(the play button on the specimen is the only way to hear; the action button is "I said it"),
6-window houses (a house has one window per entry), and placeholder Danish. The catalog is the
authority for every Danish word, respelling and IPA string.
