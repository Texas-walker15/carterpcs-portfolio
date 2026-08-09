# CarterPCs fix-v10 — Closing statement (06)

## Summary

One new section, directly after Content Universe, built from the existing
visual language and wired through the existing typed i18n system in all three
languages. No footer, and nothing in the section anticipates one.

Everything above it is provably untouched: 29 of 30 before/after section
captures are **0 changed pixels**, and the one exception is 14 pixels
explained in full below.

One defect was found during the work — in the new section, by measurement,
not by eye: **the back-to-top link rendered at `opacity: 0` permanently.** It
is fixed, the root cause is interesting enough to be worth reading, and it is
covered by a test that would fail again if it regressed.

## What was built

| Element    | Content                                                        |
| ---------- | -------------------------------------------------------------- |
| Identity   | CarterPCs                                                      |
| Statement  | Making tech / interesting.                                     |
| Disclaimer | Independent creative concept. / Not affiliated with CarterPCs. |
| Control    | Back to top ↑ → `#hero`                                        |

Files added: `src/sections/closing/Closing.tsx`,
`src/sections/closing/Closing.module.css`.

### Two judgement calls, stated rather than buried

**Casing.** The brief writes the content in capitals — `CARTERPCs`,
`MAKING TECH INTERESTING.` Nothing on this site sets display type in
uppercase: the Hero is "Built Different.", Creator is "Hardware knowledge,
delivered without the fluff.", Hardware is "Built from the inside out." Since
the brief also asks to use the existing visual language, I read the capitals
as indicating the display treatment rather than literal casing, and set the
statement in the site's sentence case. The identity is likewise rendered as
the proper noun `CarterPCs`, exactly as the nav bar and the Hero's
Featured-In strip already write it — uppercasing it would have produced
`CARTERPCS`, silently restyling the identity. Both are one-line reversals if
you want the literal capitals.

**One element the brief did not ask for.** The section carries a large "06"
in its own layer behind the type. It is the same environmental-numeral device
Hardware (04) and Content Universe (05) already use, it is `aria-hidden`, and
it states nothing — it is visual language, not new copy. It also lands
correctly: the Hero's index rail already reads "01 / 06", so Closing is the
sixth section that rail has been counting all along.

### What it does not contain

No social links, no handles, no contact details, no counts, no claims of any
kind. Asserted, not just intended — a test walks the rendered section and
fails if it finds more than one link, any `button`/`form`/`input`, any
`http:`/`mailto:`/`tel:`/`@`, or any digit in non-`aria-hidden` text.

## Translations

Added through the existing typed dictionary, so a missing key is a
`npm run typecheck` failure rather than a silent English fallback.

| Key                 | English                        | French                           | Spanish                          |
| ------------------- | ------------------------------ | -------------------------------- | -------------------------------- |
| `headlineLineOne`   | Making tech                    | La tech rendue                   | Tecnología                       |
| `headlineLineTwo`   | interesting.                   | intéressante.                    | que engancha.                    |
| `disclaimerLineOne` | Independent creative concept.  | Concept créatif indépendant.     | Concepto creativo independiente. |
| `disclaimerLineTwo` | Not affiliated with CarterPCs. | Sans affiliation avec CarterPCs. | Sin afiliación con CarterPCs.    |
| `backToTop`         | Back to top                    | Haut de page                     | Volver arriba                    |

Two deliberate choices:

- **The statement is stored as two lines, not one string split in the
  component**, so each language breaks where it naturally breaks. French keeps
  its article with its noun ("La tech rendue / intéressante."); Spanish breaks
  after the subject ("Tecnología / que engancha.").
- **The statement reuses each language's own existing phrasing** from
  `hero.support` rather than inventing a second translation of the same claim.
  This section is the bookend to that line, so in French it is "La tech rendue
  intéressante" and in Spanish "Tecnología que engancha" — the wording those
  files already use.

`CarterPCs` is deliberately absent from the dictionary: it is a proper noun
and is written as a literal, matching the policy documented at the top of
`en.ts`.

## The defect found during this work

The back-to-top link rendered at `opacity: 0` — permanently, not slowly.
Probed at 1536×1024 after scrolling the section into view:

| Element              | ~300 ms | ~1700 ms | ~3500 ms |
| -------------------- | ------- | -------- | -------- |
| CarterPCs            | 0.2287  | 1        | 1        |
| Making tech          | 1       | 1        | 1        |
| interesting.         | 1       | 1        | 1        |
| Independent concept… | 0       | 1        | 1        |
| **Back to top**      | **0**   | **0**    | **0**    |

Its transform finished — the element had travelled its 16px — while its
opacity did not. The inline styles at rest showed why: GSAP had settled it on
`opacity: 0`, meaning **0 was the tween's recorded end value**.

The only thing separating it from the two elements that worked was a CSS
`transition: opacity` for its hover state. `gsap.from()` records its end value
when the tween first _renders_; `immediateRender` had already written
`opacity: 0` at timeline-creation time, the CSS transition then carried the
element to 0 for real, and when the ScrollTrigger fired later GSAP read 0 back
as the "natural" value and animated 0 → 0.

Fixed on both sides:

- The entrance is now `fromTo` with both ends stated explicitly, so it never
  depends on reading a value back off the element. This also protects anything
  added to the section later.
- The link's hover transitions **colour** instead of opacity, so the CSS and
  the tween are no longer writing the same property. This matches the nav
  links' own hover treatment anyway.

Screenshots `01-before-fix-…` and `02-after-fix-…` are the same capture before
and after.

The lesson generalises: any element with a CSS transition on a property GSAP
also animates is exposed to this, and the site has several such elements. This
one is fixed; a broader audit was out of scope for this task and is worth
raising separately.

## A second measurement error, corrected

The first contrast sweep reported "0 failures" — and had **silently skipped
the identity line**. Its colour is a `color-mix()`, which Chromium serialises
as `color(srgb 0.960784 0.960784 0.952941 / 0.62)`, and the probe's parser
only matched `rgb()`/`rgba()`, so it returned null and the element was dropped
instead of flagged.

Re-measured with a probe that paints each colour into a canvas and reads the
pixel back — the browser's parser, not mine — and that asserts zero unparsed
colours before reporting. The corrected numbers are in the table below. The
identity passes, but I would not have known that from the first run.

## Verification

All measured against a production build, 12 viewports × 3 languages × 2
themes = 72 combinations for the section, 576 contrast samples.

| Check                                     | Result                                 |
| ----------------------------------------- | -------------------------------------- |
| Page horizontal overflow                  | 0 in all 72                            |
| Copy ink past the canvas padding box      | 0 in all 72                            |
| Ink past the viewport edge                | never (closest: 6.4px inside at 320px) |
| Headline `clip-path` surviving the reveal | 0 in all 72                            |
| Back-to-top target size                   | 93.5–119.9 × 44 CSS px                 |
| Text contrast failures (dark and light)   | 0                                      |

Worst-case contrast per element, across all 576 samples:

| Element             | Dark    | Light      | Needs |
| ------------------- | ------- | ---------- | ----- |
| headline lines      | 17.80:1 | 16.70:1    | 3     |
| identity            | 7.14:1  | **4.93:1** | 4.5   |
| disclaimer lines    | 7.69:1  | 5.76:1     | 4.5   |
| back-to-top + arrow | 17.80:1 | 16.70:1    | 4.5   |

The section numeral measures 1.17–1.18:1 and a naive sweep lists it as a
failure. It is decorative, `aria-hidden`, and states nothing — and it is not a
new posture: measured side by side, its colour is **byte-identical to
Hardware's "04"** (`text-primary` at 0.08 alpha) and fainter than Content
Universe's digits (0.1). Raising it would make the closing beat louder than
the two sections above it.

**Back to top works, measured rather than assumed.** From the bottom of the
page at 1440×900: `scrollY 9308 → 0`, `location.hash` becomes `#hero`, and the
Hero's top lands at 0. It is a real anchor to an element that exists, it sits
in the natural tab order, and the global `:focus-visible` ring applies
(screenshot 22).

**Reduced motion.** The reveal is skipped entirely — the effect returns before
creating any GSAP context — so nothing can be left stranded: `hidden=0`,
`pinSpacers=0`, `overflow=0` at both 1440×900 and 390×844, with all copy and
the control present. The arrow's hover nudge is dropped by a reduced-motion
media query too, so the only motion the section can produce is disabled.

**Themes.** Nothing in the section is hard-coded; every colour resolves from a
token, so light and the system setting that resolves to it follow the palette
with no per-theme rules at all.

## Nothing above it moved

Same captures, same pipeline, before and after adding the section — 30 section
captures across 320×568 fr, 844×390 en, 768×1024 es, 1024×768 en, 1440×900 en
light and 390×844 es light:

**29 of 30 are 0 changed pixels.**

The exception is **14 pixels (0.00%)** in a 12×3 box at (856, 706) of the
1024×768 Content Universe capture, shifting `rgb(16,28,29) → rgb(20,48,51)` —
the teal of that section's scroll-scrubbed connecting thread. The cause is not
a style change: Content Universe used to be the last section, so at 1024×768
scrolling it to the top was clamped by the end of the document and it could
never actually get there. With a section below it, it now lands where it
should (section top = 96px, its own `scroll-margin`), so the scrub sits at a
slightly different progress at capture time. Measured after: `scrollY 8293`,
`maxScroll 10547`, section top 96. The composition is unchanged; the section's
anchor simply works at that viewport now, which is a small improvement rather
than a regression.

The full fix-v9 responsive sweep was also re-run with the new section in
place — 12 viewports × 3 languages × 6 anchors — and still reports no page
overflow, no clipped text, and no residual clip-path anywhere.

## Files changed

| File                                      | Change                                      |
| ----------------------------------------- | ------------------------------------------- |
| `src/sections/closing/Closing.tsx`        | **new** — the section                       |
| `src/sections/closing/Closing.module.css` | **new** — its styles                        |
| `src/app/App.tsx`                         | mounts `<Closing />` after Content Universe |
| `src/i18n/en.ts`                          | `closing` block (shape source of truth)     |
| `src/i18n/fr.ts`                          | French `closing` block                      |
| `src/i18n/es.ts`                          | Spanish `closing` block                     |
| `src/app/App.test.tsx`                    | 2 new tests, 3 updated for the new section  |
| `e2e/app.spec.ts`                         | 7 new tests                                 |

## Tests

**Unit: 27 → 29.** The section renders after Content Universe with identity,
statement, disclaimer and a `#hero` link; and a "invents nothing" test that
fails on any extra link, any form control, any URL/mail/tel/`@`, or any digit
in non-decorative text. Three existing tests were updated for the new section
rather than worked around: the landmark/heading-order test now expects six
`h2`s and checks the last two by accessible name, and the reduced-motion test
now also asserts the Closing copy and control are present.

**E2E: 39 → 46.** Per language: the section is Content Universe's next
sibling, all four content blocks render in that language, every revealed
element settles at `opacity: 1` with no `clip-path`, and clicking back-to-top
actually returns `scrollY` to 0 with the hash set. Plus: no overflow and no
copy outside the canvas at 320px and 390px in all three languages; AA contrast
for the section's copy in light theme; and the reduced-motion resting state.

The `opacity: 1` assertion is the regression guard for the defect above — it
fails on exactly the state that shipped in my first attempt.

## Validation

| Check                  | Result                                 |
| ---------------------- | -------------------------------------- |
| `npm run typecheck`    | PASS                                   |
| `npm run lint`         | PASS                                   |
| `npm run test:run`     | PASS — 29/29 (was 27)                  |
| `npm run build`        | PASS                                   |
| `npm run test:e2e`     | PASS — 46/46 (was 39)                  |
| `git diff --check`     | PASS (exit 0; CRLF advisories only)    |
| `npm run format:check` | FAIL — 3 pre-existing files, see below |

`format:check` reports `Claude report/fix-v1/report.md`, `fix-v2/report.md`
and `fix-v3/report.md` — prior fix folders this task does not touch. Every
file created or edited this pass is prettier-clean.

## Git

No commit, push, reset, clean, or revert. `HEAD` is still `d309313`. No prior
`Claude report/fix-v*` folder was modified, and all pre-existing uncommitted
work is intact.

## Screenshots

`screenshots/` holds 13 captures.

- `01-before-fix-…` / `02-after-fix-…` — the invisible back-to-top link and
  its fix, same capture.
- `10`–`17` — the section at 1440×900 light, 1024×768 fr, 768×1024 es,
  844×390 landscape, 390×844 fr dark and es light, and 320×568 es dark and fr
  light.
- `20` — the Content Universe → Closing boundary, showing the shared hairline
  seam.
- `21` — the reduced-motion resting state.
- `22` — the focus ring on the back-to-top control.

## Verdict

READY FOR REVIEW. The section is complete in three languages, both themes, and
from 320px up; nothing above it moved; the one defect found was in the new
work, is fixed, and is now guarded by a test. The footer remains untouched, as
asked.
