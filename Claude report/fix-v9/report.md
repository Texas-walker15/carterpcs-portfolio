# CarterPCs fix-v9 — Full responsive QA pass

## Summary

Twelve viewports were exercised in English, French and Spanish, in dark,
light and system themes, at six scroll anchors each, plus 200% browser zoom
and `prefers-reduced-motion`. **Four defects were found and fixed.** Three of
them were invisible to the checks the suite already runs, which is the more
useful part of this report:

- The Hero's entire light/system theme was **black-on-black** — the
  overrides that were supposed to swap in a light environment were scoped to
  a class that CSS Modules hashes away, so all of them matched nothing.
- At 1024px the **language switcher sat 25px off the right edge of the
  screen** in French. `.nav` is `position: fixed`, so nothing it pushes past
  the end ever reaches `documentElement.scrollWidth` — every horizontal
  overflow check in the suite read clean while the control was unreachable.
- The six section links present a **17px-tall tap target** against WCAG 2.2
  AA's 24px minimum, at every viewport.

A fifth finding — the dark theme's violet accent at 3.65:1 — is real but is
**deliberately not fixed**, because clearing it means changing the brand
accent. It is written up below rather than quietly left out.

Everything else in the brief was checked and needed no change. The approved
dark composition is provably untouched: a pixel diff of the 1440×900 dark
Hero before and after reports **0 changed pixels**, as do every dark capture
at 320×568, 768×1024 and 844×390.

## What was tested

| Viewport  | en  | fr  | es  | Notes                                    |
| --------- | --- | --- | --- | ---------------------------------------- |
| 320×568   | ✓   | ✓   | ✓   | narrowest phone; bar wraps to three rows |
| 360×800   | ✓   | ✓   | ✓   |                                          |
| 390×844   | ✓   | ✓   | ✓   |                                          |
| 414×896   | ✓   | ✓   | ✓   |                                          |
| 844×390   | ✓   | ✓   | ✓   | mobile landscape                         |
| 768×1024  | ✓   | ✓   | ✓   | tablet portrait                          |
| 820×1180  | ✓   | ✓   | ✓   |                                          |
| 1024×768  | ✓   | ✓   | ✓   | first single-row bar — two defects here  |
| 1280×800  | ✓   | ✓   | ✓   |                                          |
| 1440×900  | ✓   | ✓   | ✓   |                                          |
| 1536×1024 | ✓   | ✓   | ✓   | the approved reference frame             |
| 1920×1080 | ✓   | ✓   | ✓   | above the frame; rem presentation scale  |

Each combination was measured at six scroll anchors (Hero, Creator, Featured,
Hardware, Content Universe, document end) for page overflow, out-of-flow
elements, clipped or hidden text, surviving animation `clip-path`, tap-target
size and nav geometry — 216 measurements per run, run before and after.

On top of that: all three themes swept for text contrast across every
section; the preference menus put through their whole behaviour cycle at all
twelve viewports; 200% zoom at four sizes in two languages; reduced motion at
desktop and mobile; and a scroll-to-the-end walk at every viewport to confirm
no pinned sequence traps the page.

Widths between the tested viewports were swept too, at 20px steps from 1000
to 1300, because both nav defects turned out to live in a band rather than at
a single size.

## Defect 1 — the light and system themes broke the Hero completely

### What was wrong

`global.css` carries three light-mode rules for the Hero: a high-key
environment gradient, a lighter disc, and dark ink for the primary CTA. All
three were scoped `html[data-theme='light'] .hero …`.

The section's class comes from a CSS module, so the class in the DOM is
`_hero_1ed0a_20`, not `hero`. A literal `.hero` ancestor matches nothing, so
**every one of those rules was dead**. The `[class*='env']` parts were fine —
substring matching does work against hashed names — only the ancestor was
wrong, which is why the rules looked correct in review.

The consequence in the browser: the Hero kept its hard-coded near-black
environment (`#050608 → #030406`) while every text token flipped to
near-black `#151516`. Measured on the rendered pixels, the primary CTA label
sat at **1.07:1** against its own pill — white text on a white pill. The
headline, support copy, nav labels, tile text and Featured-In strip were all
black on black. Every other section was fine, because they use tokens.

The contrast sweep on its own did _not_ catch this: it resolves backgrounds by
walking up for `background-color`, and `.env` paints with a gradient, which
reports as transparent. The screenshot caught it. That limitation is worth
recording, since the same blind spot would hide the same class of bug again.

### What changed

The three rules are scoped by `#hero` instead — a stable id the nav already
links to, and one CSS Modules does not touch.

Two consequences of the now-live rules also needed handling, both found by
measuring the result rather than by assuming:

- `.ctaBadge`'s ring was `color-mix(… var(--color-bg-base) 36% …)`. In dark
  mode that is the same colour as the label; in light mode bg-base is
  near-white and the ring vanished into the white pill. It now derives from
  `currentcolor`, which is **byte-identical in dark mode** and correct in
  light.
- The one Featured-In mark that is an image is forced to flat white with
  `brightness(0) invert(1)`. On the light ground it disappeared — the crop of
  where it should be came back blank. Light mode drops the invert.

After: light and system themes report **0 contrast failures** across every
section, down from 9.

## Defect 2 — at 1024px the language switcher was off-screen

### What was wrong

From 1024px the bar becomes a single `1fr auto 1fr` row. The reference gaps
were measured from the 1536 frame with the six **English** labels; the French
cluster runs about 61px wider. The surplus pushed the right-hand zone past
the end of the bar.

Because `.nav` is `position: fixed`, that surplus never contributes to
`documentElement.scrollWidth`. Every horizontal-overflow assertion in the
suite passed while the control was gone. Measured directly against the
viewport instead:

| Viewport / language | Language button's right edge                 | Verdict           |
| ------------------- | -------------------------------------------- | ----------------- |
| 1024 · French       | x1049.3 on a 1024px viewport                 | 25.3px off-screen |
| 1024 · Spanish      | x1038.8                                      | 14.8px off-screen |
| 1060 · French       | inside, but 35px past the bar's padding edge | crammed           |
| 1140 · French       | inside                                       | first clean width |
| 1100 · Spanish      | inside                                       | first clean width |

So in French the language switcher was **simply unreachable at 1024×768** —
one of the viewports in this brief, and a very common laptop size.

A second, independent failure lives in the same band. The bar applies an
optical centre-shift to the link cluster (`translate: max(-3.125rem,
-3.26vw)`), calibrated against the 1536 frame. Applied from 1024 down, it
drove the cluster into an identity that had not shrunk with the viewport:
measured on glyph ink, **"CarterPCs" overlapped the first section link by
1.38px at 1024 in all three languages**, and stayed negative up to ~1130px in
French and Spanish. It is visible in the before screenshot — the "s" of
CarterPCs runs straight into "Work".

### What changed

Two changes, and the report is explicit that **both are needed**, because the
obvious assumption is wrong and I checked it:

1. **1024–1239 rides a tighter link gap** that ramps back to exactly the
   reference value at 1240 (`9.2vw − 72px` gives 22.2px at 1024 and 41.9px at
   1239, which is what `3.38vw` gives there), plus a tighter utilities gap.
   This is what brings the right-hand zone back on-screen.
2. **The optical centre-shift now starts at 1240**, the frame it was measured
   on, instead of at 1024.

Change 1 does _not_ fix the overlap: with only the gap ramp in place, French
still measured **−1.38px at 1024**. When the row overflows, the two `1fr`
tracks collapse to min-content and the `auto` track absorbs the remainder, so
narrowing the cluster removes the surplus from the right end without moving
its left edge at all. Change 2 is what moves it.

After both, the tightest gap anywhere in the band is **32px on each side, in
all three languages** (French at 1024, the previous worst case), and nothing
sits past the viewport or past the bar's padding at any width in any
language.

**1240 and above are untouched.** The post-fix ink gaps at 1240 (130.28 /
74.86 / 85.40 px for en/fr/es) are identical to the pre-fix values, and the
optical shift is still in force there — there is an e2e test asserting
exactly that, so a future edit cannot quietly drop it.

## Defect 3 — tap targets below the 24px minimum

WCAG 2.2 AA SC 2.5.8 asks for 24×24 CSS px. The "inline within a sentence"
exemption does not apply to a standalone list of destinations. Measured at
every viewport:

| Control                          | Target height | Where            |
| -------------------------------- | ------------- | ---------------- |
| the six nav section links        | **17px**      | every viewport   |
| Hero About card's "Learn more ↗" | **19.5px**    | 1280px and above |
| the "CarterPCs" identity         | **22.5px**    | below 1024px     |

The area is enlarged with an absolutely-positioned pseudo-element rather than
with padding. Padding would have grown the wrapped two-row bar by 8px and
moved the Hero card's ink-calibrated interior rows; a pseudo-element is part
of the link's own hit test and changes no box at all — which is why the
mobile nav pixel diff is 0.

Verified the way a finger meets it, by walking `document.elementFromPoint`
outward from each control's centre across 1909 samples:

| Control      | Element box | Hit-tested target |
| ------------ | ----------- | ----------------- |
| `.link`      | 17–19px     | **25–27px**       |
| `.wordmark`  | 22.5–35.3px | **29–40px**       |
| `.aboutLink` | 19.5–21.8px | **25–29px**       |

Nothing anywhere on the page is now under 24×24 by hit test. Note that the
element-box scan still reports 17px for the links — that is expected, and the
distinction is why the hit test exists.

## Defect 4 — light-theme accent text missed AA

`--color-accent-primary` in light mode was `#167f89`: **4.34:1** against the
light base and 3.85:1 against the light surface, where AA wants 4.5:1 for
normal text. It sets the Featured panel indices, the Hardware and Content
Universe kickers, and the beat numerals.

Changed to `#14727b` — the smallest darkening that clears 4.5:1 on **both**
light grounds (5.16:1 and 4.59:1). It is the same teal; the section captures
change by 0.1–2.4%, which is the small type recolouring and nothing else.

## Found but not fixed

**The dark theme's violet accent is below AA for small text.**
`--color-accent-secondary` `#7c4fd6` on `#0d0d0d` measures **3.65:1** against
a 4.5:1 requirement. It affects eight small labels: the Hero card indices
`01`/`02`, the tile indices `03`/`04`/`05`, the Creator kicker, and two
Content Universe entry labels.

This is a real failure and I am not going to describe it as anything else.
It is left unchanged because clearing it is a design decision, not a QA fix:
reaching 4.5:1 on that ground needs roughly `#8f5bf6`, a visibly lighter
violet, and it is the brand accent across Hero, Creator and Content Universe.
The brief asks to preserve the approved visual design, so this needs sign-off
rather than a unilateral change. Defect 4 was fixed instead of reported
because it needed a change of about 0.16 of a contrast point and stays
perceptually the same colour, where this one does not.

Recommended value if it is approved: `#8f5bf6` (4.62:1). Alternatively, raise
those specific labels to 18.66px bold or 24px, where 3:1 applies and the
current violet already passes.

## Checked and found correct — no change needed

- **Horizontal overflow.** Zero at every one of the 216 before-measurements
  and 216 after-measurements, and zero at 200% zoom.
- **Clipped or hidden text.** No element with a clipping overflow had content
  larger than its box, at any viewport, in any language.
- **Heading reveals.** No surviving animation `clip-path` on any section
  headline once its section has revealed — fix-v8 holds. (The `fromTo`
  applies its from-state immediately, so a heading is legitimately clipped
  until its own trigger fires; only the post-reveal state was counted.)
- **Preference menus.** Selection, Escape, outside press, focus loss,
  keyboard open, arrow navigation and Enter-to-select all pass at all twelve
  viewports. The panel never covers the bar's own links and never leaves the
  viewport — the tightest margin is 20px inside the right edge at 320px, and
  the panel occupies at most 31% of the viewport height (844×390 landscape).
  One measured caveat, for completeness: at 414px and below the open panel
  does overlap part of the Hero `h1`, because at those widths the headline
  begins immediately under a bar that has wrapped to two or three rows. It is
  a right-aligned, content-width dropdown that closes on any outside press,
  so this reads as ordinary dropdown behaviour rather than a defect — but it
  is a measurement, so it is stated rather than rounded away.
- **Pinned and scrubbed sequences.** At every viewport the page scrolls to its
  natural end with the Content Universe section fully resolved, and no
  horizontal overflow appears at any point during the walk. The 844×390
  landscape case runs to 11,465px of scroll and still completes.
- **Reduced motion.** No pin spacers are created, nothing is stranded
  mid-animation, no overflow. The elements the probe flags below full opacity
  are the section `.tags` line, which carries a static `opacity: 0.85` in its
  own stylesheet, and the desktop-only index rail, which is `display: none`
  on mobile.
- **200% zoom.** Emulated the way real zoom works, by halving the CSS-pixel
  viewport. No overflow and no clipped text at 1280, 1440, 1920 or 390, in
  English or French.
- **Hero image cropping, cards, stats and the lower strip** at every viewport,
  including the 844×390 landscape case where the composition stacks.
- **No console or page errors** in any of the 36 baseline runs.

## Observations that are design decisions, not defects

Two things are worth flagging without changing them, because both are the
approved composition behaving as specified:

- **The bar has no background.** Once scrolled away from the Hero, section
  content passes under the nav labels — most noticeably at 320×568, where the
  bar wraps to three rows and covers ~197px. `Nav.module.css` states the
  intent plainly ("No bar background — typography and spacing carry it"), so
  giving it a backdrop would be a material change to the approved design.
- **At 844×390 the fixed bar occupies 128px of a 390px-tall viewport** — a
  third of the screen in landscape. Same root cause, same reasoning.

## Files changed

| File                                       | Change                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `src/styles/global.css`                    | Light-theme Hero rules scoped by `#hero`; light Featured-In glyph       |
| `src/sections/hero/Hero.module.css`        | CTA badge ring from `currentcolor`; About-card link hit area            |
| `src/components/navigation/Nav.module.css` | 1024–1239 gap band; optical shift held to 1240+; link/identity hit area |
| `src/styles/tokens.css`                    | Light `--color-accent-primary` `#167f89` → `#14727b`                    |
| `e2e/app.spec.ts`                          | 7 regression tests                                                      |

## Tests added

**E2E: +7, 32 → 39.**

- Every nav control stays inside the viewport and inside the bar's padding
  box at 1024×768, and the identity's glyph ink clears the first section
  link — one test per language, so a longer future label fails loudly rather
  than silently pushing a control off-screen.
- The 1240+ bar still carries its optical centre-shift, so the band fix
  cannot creep upward into the approved frame.
- The light-theme Hero renders on a light ground, asserted by **sampling the
  rendered pixel**, not by reading the stylesheet — a rule that silently
  matches nothing cannot pass it.
- The light-theme primary CTA label clears 4.5:1 against its own pill.
- The six nav links meet 24×24 by hit test on mobile.

## Validation

| Check                  | Result                                 |
| ---------------------- | -------------------------------------- |
| `npm run typecheck`    | PASS                                   |
| `npm run lint`         | PASS                                   |
| `npm run test:run`     | PASS — 27/27                           |
| `npm run build`        | PASS                                   |
| `npm run test:e2e`     | PASS — 39/39 (was 32)                  |
| `git diff --check`     | PASS (exit 0; CRLF advisories only)    |
| `npm run format:check` | FAIL — 3 pre-existing files, see below |

`format:check` reports `Claude report/fix-v1/report.md`,
`fix-v2/report.md` and `fix-v3/report.md`. All three belong to prior fix
folders this task forbids overwriting. Every file created or edited this pass
is prettier-clean.

## Regression evidence

Pixel diffs of identical captures before and after, same build pipeline:

| Capture                           | Changed pixels | Reading                                             |
| --------------------------------- | -------------- | --------------------------------------------------- |
| 1440×900 dark Hero                | **0**          | the approved desktop frame is untouched             |
| 390×844 dark Hero                 | **0**          |                                                     |
| 390×844 and 320×568 nav crops     | **0**          | the tap-target overlays are invisible               |
| 320×568 dark, all five sections   | **0**          |                                                     |
| 768×1024 dark, all five sections  | **0**          |                                                     |
| 844×390 dark, all five sections   | **0**          |                                                     |
| 1024×768 dark, all five sections  | ~1.0% each     | the nav band fix; the fixed bar is in every capture |
| 1440×900 light, non-Hero sections | 0.1–2.4%       | the accent token                                    |
| 1440×900 light Hero               | 85%            | the dead-selector fix                               |

Every non-zero number is accounted for by a fix; every number that should be
zero is zero.

## Git

No commit, push, reset, clean, or revert. `HEAD` is still `b2f0946`. No prior
`Claude report/fix-v*` folder was touched. Five files are modified in the
working tree and nothing else.

## Screenshots

`screenshots/` holds 52 captures.

- `01-before-*` / `02-after-*` — the paired evidence: the light-theme Hero at
  1440×900 and 390×844, the 1024×768 nav in English and Spanish, the light
  CTA crop, the Featured-In glyph crop, and the pairs that are identical by
  pixel diff (1440×900 dark Hero, the 320 and 390 nav crops) which are
  themselves the proof that the approved composition did not move.
- `03-matrix-*` — the post-fix state across 320×568 fr, 844×390 en, 768×1024
  es, 1024×768 en, 1440×900 en light and 390×844 es light, one capture per
  section.

## Verdict

READY FOR REVIEW. Four verified defects fixed, one verified defect reported
with a recommendation and left for design sign-off, and the approved
composition demonstrated unchanged by pixel diff rather than by assertion.
