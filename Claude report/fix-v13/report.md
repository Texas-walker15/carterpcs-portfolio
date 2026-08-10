# fix-v13 — Featured: the far-right sequence rail

**Task.** Make the desktop Featured panel's far-right negative space read as
intentional, with a very quiet vertical segmented progress indicator echoing
the existing bottom timeline. Nothing else in the composition moves.

## Executive summary

The right side of each story panel was genuinely empty — 408px of it at
1440×900, 643px at 1920×1080 — and empty space only reads as composed when
something sits on its edge. Added is one decorative element per panel: three
2px hairlines stacked vertically on the section's own right margin, the active
one in the same cyan the bottom timeline's active dot already uses. It is
`aria-hidden`, `pointer-events: none`, carries no label, no numeral and no
control, and it is drawn only where the space it marks actually exists.

Nothing moved. The copy column, the 9:16 plate, the action rail, the bottom
timeline, the numeral and the stage are byte-for-byte where they were: the new
element is absolutely positioned and pointer-inert, so it cannot affect any of
them. The diff is 209 added lines and zero deleted.

One judgement call worth stating up front: **it is not drawn below 1280px.**
See "Technical decisions" — it is a measurement, not a preference.

## Files changed (3)

| File | Change |
|---|---|
| `src/sections/featured/Featured.tsx` | +25 lines — one `aria-hidden` `<div data-sequence-rail>` per panel, three spans, active index from the same `activeIndex` the bottom timeline uses |
| `src/sections/featured/Featured.module.css` | +88 lines — `.sequence`, `.sequenceMark`, `.sequenceMarkActive`, off by default, on in a `min-width: 1280px and (prefers-reduced-motion: no-preference)` block |
| `e2e/app.spec.ts` | +96 lines — one new test locking placement, decorativeness and non-collision at 1440×900, plus its absence at 1024×768 |

No i18n, data, unit-test, Creator, Hero, Hardware, Content Universe, Closing or
Footer file was touched. Nothing was committed, pushed, reset, cleaned or
reverted.

## Exact changes

**Markup** — a sibling of the existing horizontal timeline, inside the panel so
it travels with it:

```tsx
<div className={styles.sequence} aria-hidden="true" data-sequence-rail>
  {stories.map((other, i) => (
    <span key={other.index}
      className={i === activeIndex
        ? `${styles.sequenceMark} ${styles.sequenceMarkActive}`
        : styles.sequenceMark} />
  ))}
</div>
```

**CSS** — `display: none` at every width, switched on only here:

```css
@media (min-width: 1280px) and (prefers-reduced-motion: no-preference) {
  .sequence {
    display: flex;
    position: absolute;
    z-index: 1;
    inset-block-start: 50%;
    inset-inline-end: var(--container-padding-inline);
    translate: 0 -50%;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
    pointer-events: none;
  }
  .sequenceMark {
    inline-size: 2px;
    block-size: 2.5rem;
    border-radius: 999px;
    background-color: color-mix(in srgb, var(--color-text-primary) 20%, transparent);
    transition:
      background-color var(--duration-base) var(--ease-standard),
      box-shadow var(--duration-base) var(--ease-standard);
  }
  .sequenceMarkActive {
    background-color: var(--color-accent-primary);
    box-shadow: 0 0 0.5rem color-mix(in srgb, var(--color-accent-primary) 40%, transparent);
  }
}
```

## Technical decisions

**Placed on the section's own margin, not on an invented offset.**
`inset-inline-end: var(--container-padding-inline)` is the same declaration the
"Selected Stories" header above uses for its right padding, so the mark lands
on a line the page has already established: 51.2px in from the edge at 1280,
57.6px at 1440, 71.7px at 1920. Nothing to keep in step by hand.

**Not drawn below 1280px.** The copy column is a fixed 36rem at every width, so
the plate is held to the right by its own left floor and the space left after
the action rail collapses as the window narrows:

| width | space right of the action rail | drawn? |
|---|---|---|
| 1024 | 69.9px | no |
| 1280 | 301.8px | yes |
| 1366 | 400.2px | yes |
| 1440 | 407.5px | yes |
| 1536 | 451.4px | yes |
| 1920 | 643.0px | yes |

At 1024 a hairline in 70px does not read as the far edge of the composition; it
reads as a scrollbar stuck to the action rail — that version was built and
screenshotted first, which is what settled it. The brief asked for the mark to
be placed "far enough right that it never competes with the action rail", and
below 1280 no such placement exists. Screenshot 08 shows 1024×768 unchanged.

**Vertically centred on the panel, not on the plate.** The plate's height is a
`min()` of three terms; duplicating that expression here to be ~20px more
precise would mean two places to keep in step for a difference nobody can see.

**Colour-only transitions**, exactly like the horizontal timeline's `.tick`, so
the global reduced-motion rule collapses the duration and nothing is left
moving. Nothing here resizes, travels or pulses. Below the desktop-pinned
layout — mobile, tablet, narrow desktop, and reduced motion at any width — the
element is `display: none` and the panels are the same vertical stack as before.

**20%, not 16%.** The first pass used 16% of `--color-text-primary`; on the
light theme's near-white ground it all but vanished. 20% sits one notch under
the horizontal timeline's own connecting line (24%) — the same family of
hairline, pitched quieter because this one sits in open space.

## Measurements — all three stories, all desktop widths

Panel-relative, EN/dark, story 01 (identical on stories 02 and 03; the whole
composition is one shared rule set):

| width | action rail ends | mark | gap rail → mark | gap mark → panel edge | mark height ÷ video height |
|---|---|---|---|---|---|
| 1280×800 | 978.2 | 1226.8–1228.8 | 248.6px | 51.2px | 140 / 624 = 22.4% |
| 1366×768 | 965.8 | 1309.4–1311.4 | 343.6px | 54.6px | 140 / 592 = 23.6% |
| 1440×900 | 1032.5 | 1380.4–1382.4 | 347.9px | 57.6px | 140 / 702 = 19.9% |
| 1536×1024 | 1084.6 | 1472.6–1474.6 | 388.0px | 61.4px | 140 / 768 = 18.2% |
| 1920×1080 | 1277.0 | 1846.3–1848.3 | 569.3px | 71.7px | 156.8 / 842.4 = 18.6% |

Subordinate to the video by construction: 2px wide against a 333–474px plate,
and under a quarter of its height everywhere.

## Overlap — zero, at rest and in motion

**Rest states.** 18 readings (3 stories × 1024/1280/1440/1920 × EN/FR/ES ×
dark/light): overlap with the nav bar, the video frame, the action rail, the
copy column and the bottom timeline is **0px² in every one**. `elementFromPoint`
at the mark's own centre returns the panel, never the mark — the pointer goes
straight through it.

**In motion.** The pinned track was scrubbed forward through all three stories
and back again while every animation frame was sampled:

| viewport | frames | max overlap (nav / video / rail / copy / timeline) | left its panel | page overflow |
|---|---|---|---|---|
| 1280×800 | 830 | 0 / 0 / 0 / 0 / 0 | 0 | 0 |
| 1440×900 | 770 | 0 / 0 / 0 / 0 / 0 | 0 | 0 |
| 1920×1080 | 616 | 0 / 0 / 0 / 0 / 0 | 0 | 0 |

## Themes, languages, motion, mobile

| check | result |
|---|---|
| dark | inactive `rgb(245,245,241)/20%`, active `rgb(53,199,214)` — identical to the timeline's active dot |
| light | inactive `rgb(21,21,22)/20%`, active `rgb(20,114,123)` — identical to the timeline's active dot |
| system (no stored preference), OS dark | resolves dark, accent matches |
| system (no stored preference), OS light | resolves light, accent matches |
| EN / FR / ES | identical geometry — the mark carries no text, so translation cannot move it |
| reduced motion @ 1440×900 | `display: none` (as is the horizontal timeline) — stacked layout unchanged |
| mobile 320×568, 390×844 | `display: none`, 0×0 box, page overflow 0 |
| horizontal overflow | 0 at every viewport tested |

## Validation

| command | result |
|---|---|
| `npm run typecheck` | pass, 0 errors |
| `npm run lint` | pass, 0 problems |
| `npm run test:run` | **42/42** pass |
| `npm run build` | pass |
| `npm run test:e2e` | **67/67** pass (66 existing + 1 new) |
| `git diff --check` | clean |

`git status`: `M e2e/app.spec.ts`, `M src/sections/featured/Featured.module.css`,
`M src/sections/featured/Featured.tsx` — 209 insertions, 0 deletions. Nothing
committed, pushed, reset, cleaned or reverted.

## Screenshot index

| file | what |
|---|---|
| 01a/01b | 1440×900 story 01, before → after |
| 02a/02b | 1440×900 story 02, before → after |
| 03a/03b | 1440×900 story 03, before → after |
| 04a/04b | 1920×1080 story 01, before → after |
| 05a/05b | 1920×1080 story 02, before → after |
| 06a/06b | 1920×1080 story 03, before → after |
| 07 | 1280×800, EN, light — the narrowest width the mark is drawn at |
| 08 | 1024×768, EN, dark — not drawn, panel unchanged |
| 09 | 1440×900, FR, light, story 02 |
| 10 | 1920×1080, ES, dark, story 03 |
| 11 / 12 | 1920×1080, system theme, OS dark / OS light |
| 13 | 1440×900, reduced motion — stacked layout, not drawn |
| 14 / 15 | 320×568 FR, 390×844 ES — not drawn, no overflow |

"Before" is the same build with `[data-sequence-rail] { display: none }`
applied. The change is purely additive and absolutely positioned, so
suppressing it reproduces the previous composition exactly rather than
approximately.

## Remaining issues

**One, stated plainly:** at 1024×768–1279px the far-right space is not marked,
because at those widths there is no far-right space — 70px between the action
rail and the panel edge. Closing that would mean narrowing the copy column's
36rem measure at those widths, which rewraps every headline, and that is a
change to the composition the brief explicitly ruled out ("do not move the
video or copy again"). Panels at those widths are unchanged from before this
task.

Nothing else outstanding. No fake content, counts, labels or controls were
added; no story text, translation, URL, thumbnail, player behaviour, action
behaviour, snapping or mobile layout was touched.
