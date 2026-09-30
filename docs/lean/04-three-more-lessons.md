# Spec 04: lessons 3 to 5, numbers, food and drink, the city

## Goal

The street reaches its planned five houses. Lessons 3, 4 and 5 are added to the catalog as data;
the code from spec 03 already handles any number of lessons, so this spec changes no behaviour
except one visible consequence: with five lessons the empty plot and `Coming next` disappear.

Read first: `CLAUDE.md`, `docs/design/ART-DIRECTION.md`, `docs/lean/01-hej-og-tak.md`,
`docs/lean/03-hvem-er-du.md` and `docs/lean/lessons.md`.

## The lessons

Append, after `hvem-er-du`, in this order. Every cell is character for character (IPA symbols:
`ɡ` U+0261, `ɛ` U+025B; `ɐ̯` is `ɐ` followed by U+032F).

### Lesson 3: `tal`

Title `Tal`, English title `Numbers`, colour `hav`, gable `bell`, ten entries.

| id | da | en | respelling | ipa | note |
|---|---|---|---|---|---|
| `en` | En | One | ehn | `[ˈeˀn]` | One. Before a noun Danes use en or et, depending on the noun. |
| `to` | To | Two | toe | `[ˈtoˀ]` | Two. The voice catches at the end. |
| `tre` | Tre | Three | treh | `[ˈtʁɛˀ]` | Three. The Danish r is made at the back of the throat. |
| `fire` | Fire | Four | FEE-uh | `[ˈfiːʌ]` | Four. Two syllables. |
| `fem` | Fem | Five | fem | `[ˈfɛmˀ]` | Five. The m has a small catch at the end. |
| `seks` | Seks | Six | sehgs | `[ˈsɛɡs]` | Six. The k sounds like a g. |
| `syv` | Syv | Seven | sue | `[ˈsywˀ]` | Seven. Say ee with your lips rounded, as if for oo. |
| `otte` | Otte | Eight | OH-duh | `[ˈɔːdə]` | Eight. The tt sounds like a d. |
| `ni` | Ni | Nine | nee | `[ˈniˀ]` | Nine. Like the English word knee. |
| `ti` | Ti | Ten | tee | `[ˈtiˀ]` | Ten. Like the English word tea, with a catch at the end. |

`praise`: `Super` · `Great` · `SOO-buh` · `[ˈsuˀbʌ]`.

### Lesson 4: `mad-og-drikke`

Title `Mad og drikke`, English title `Food and drink`, colour `salvie`, gable `cornice`, ten entries.

| id | da | en | respelling | ipa | note |
|---|---|---|---|---|---|
| `vand` | Vand | Water | van | `[ˈvanˀ]` | Water. The first word to know in a café. |
| `kaffe` | Kaffe | Coffee | KAH-fuh | `[ˈkɑfə]` | Coffee. Stress the first syllable. |
| `te` | Te | Tea | teh | `[ˈteˀ]` | Tea. Short, with a small catch at the end. |
| `maelk` | Mælk | Milk | melg | `[ˈmɛlˀɡ]` | Milk. The k at the end sounds like a g. |
| `oel` | Øl | Beer | url | `[ˈøl]` | Beer. Say ur without the r. |
| `broed` | Brød | Bread | brurth | `[ˈbʁœðˀ]` | Bread. The d is soft, like th in this. |
| `smoer` | Smør | Butter | smur | `[ˈsmɶɐ̯]` | Butter. The ø glides into a soft r. |
| `ost` | Ost | Cheese | awst | `[ˈɔsd]` | Cheese. The last t sounds like a d. |
| `aeble` | Æble | Apple | EH-bluh | `[ˈɛːblə]` | Apple. The æ is like the e in bet, held a little longer. |
| `suppe` | Suppe | Soup | SAW-buh | `[ˈsɔbə]` | Soup. The pp sounds like a b. |

`praise`: `Velbekomme` · `Enjoy your meal` · `VEL-buh-KUM-uh` · `[ˈvɛlbəˈkʌmˀə]`.

### Lesson 5: `byen`

Title `Byen`, English title `The city`, colour `rosa`, gable `step`, ten entries.

| id | da | en | respelling | ipa | note |
|---|---|---|---|---|---|
| `by` | By | City, town | bue | `[ˈbyˀ]` | City, or town. Say ee with your lips rounded. |
| `gade` | Gade | Street | GEH-thuh | `[ˈɡæːðə]` | Street. The d is soft, like th in this. |
| `bus` | Bus | Bus | boos | `[ˈbus]` | Bus. Close to the English word, with a short oo. |
| `tog` | Tog | Train | taw | `[ˈtɔˀw]` | Train. The g is not said; it glides into a w. |
| `station` | Station | Station | stah-SHOHN | `[sdaˈɕoˀn]` | Station. The stress is on the last syllable, and ti sounds like sh. |
| `butik` | Butik | Shop | boo-TEEG | `[buˈtiɡ]` | Shop. The k at the end sounds like a g. |
| `hus` | Hus | House | hoos | `[ˈhuˀs]` | House. The voice catches after the u. |
| `cykel` | Cykel | Bicycle | SUE-gull | `[ˈsyɡəl]` | Bicycle. The c is an s, and the y is ee with rounded lips. |
| `bro` | Bro | Bridge | broh | `[ˈbʁoˀ]` | Bridge. The Danish r is made at the back of the throat. |
| `torv` | Torv | Square | tor | `[ˈtɒˀw]` | Town square, or market square. The rv sounds like a w. |

`praise`: `Hyggeligt` · `Lovely` · `HEW-guh-lid` · `[ˈhyɡəlid]`.

Sources, checked 2026-09-30 on ordnet.dk (DDO), one entry per word, in DDO's notation with `g`→`ɡ`
and `ε`→`ɛ`; `Hyggeligt` adds the neuter `d` to DDO's `hyggelig` `[ˈhygəli]`, and
`Velbekomme` keeps DDO's two stress marks. List all 30 entries and the three praise words in the
pull request description under "Danish for review", marking the two derived ones.

## Behaviour

- The catalog lists five lessons. `PLANNED_LESSONS` is already 5, so the empty plot and `Coming
  next` no longer show; the caption reads `5 lessons`; `windowsTotal` is 46.
- Houses are as tall as their entries need (ten entries make five rows of windows); the skyline row
  scrolls sideways with snap on a phone and shows all five houses side by side on desktop.
- Nothing else changes: same pages, tools, copy rules and look.

## Acceptance

`npm ci && npm run verify` passes; the new test count is in `assert-count.mjs` and the pull request.
The tests prove, at least:

1. **Catalog**: lessons 3, 4 and 5 with every cell above; the five lessons in order; entry ids
   unique across all five; the allowed-IPA-symbols test already covers them (extend its set if a
   symbol above is missing, never the data).
2. **Street**: five house links named `{title}, {n} of {N} windows lit`; no empty plot and no `Coming
   next`; the caption `5 lessons`; `get_street.windowsTotal` is 46 and lists five lessons; the
   continue card and line for: nothing lit, lessons 1 and 2 complete (`Start Tal` with `En`), all
   five complete (`Every lesson is done`).
3. **Houses**: a ten-entry house has five rows of two windows and the right height; lit windows follow
   storage per lesson.
4. **Pages**: an entry page, the done page (live region `All 10 windows lit. Super!`, `All 10
   windows lit. Velbekomme!`, `All 10 windows lit. Hyggeligt!` for the three lessons) and the
   bare-URL redirect work for each new lesson; the done page chip names the lesson.
5. **Smør's combining mark**: `smoer`'s IPA contains U+032F and the IPA span renders it (the text
   is unchanged by any processing).

## Answers to the grill

- The builder copies the strings and never edits them; an apparent mistake goes in the pull
  request description, not in the data.
- The respellings are hand-made English-reader guides and are not meant to be consistent beyond
  the rules in `CLAUDE.md`.
- Existing tests that assumed two lessons (the plot's presence, the caption, the total) are updated,
  not deleted.

## Out of scope

Sounds page, recording, audio, new components, tokens, routes, tools, design changes, any change
to `CLAUDE.md`, `docs/design/` or other specs.
