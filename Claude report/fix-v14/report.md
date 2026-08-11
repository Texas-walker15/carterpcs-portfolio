# fix-v14 — Section 04 / Hardware (`#hardware`)

**Task.** Make Hardware feel like a deliberate editorial continuation after
Featured — clean, premium, technical — without copying Featured's layout, and
only where evidence supports the change.

Baseline: `d0b8ecf`. Every "before" number below was re-measured by building
that commit's Hardware files into a second app and serving it on :4191
alongside the working tree on :4190, then running the same probe against both.

## Executive summary

The QA pass found six defects. Four of them were the same defect wearing
different clothes: **the section was 210–547px taller than the viewport it
pins in**, so a composition designed as one frame never appeared as one.

- The desktop trigger pins the section for 0.65 of a viewport. Across
  1024/1440/1920 the tags line was **off-screen for the pin's entire
  duration**, and at 1024 the third beat was too. The reader scrolled ~585px,
  nothing moved, and the part they had not read yet stayed below the fold.
- Meanwhile there were 160–179px of dead space above the first line.
- The copy column and the object deliberately shared a grid column. That works
  until a headline is long enough to reach it: at 1440 the rear plate crossed
  **4,856px² of live headline ink in English and 6,229px² in Spanish**,
  greying out the last glyph of "the".
- The `#hardware` anchor landed **101px behind the fixed bar** at 390px and
  32px behind it at 768px.

Fixed by re-flowing the desktop grid (copy and object in their own columns,
the three beats as a band across the base), capping the object on small
screens, hanging the pin off the section's bottom edge, and giving the object
enough material contrast to be seen at all. The section is now **exactly one
viewport** at 1024×768, 1440×900 and 1920×1080, with zero collisions in all
three languages.

No copy, translation, data or interaction changed.

## Files changed (3)

| File | Lines | What |
|---|---|---|
| `src/sections/hardware/Hardware.module.css` | +120 / −20 | responsive anchor offset; object capped and outboard on small screens; desktop grid re-flow; object material |
| `src/sections/hardware/Hardware.tsx` | +14 / −1 | pin trigger moved from the section's top edge to its bottom edge |
| `e2e/app.spec.ts` | +127 | two regression tests + two helpers |

`git status`: those three files, `262 insertions(+), 20 deletions(-)`. Nothing
committed, pushed, reset, cleaned or reverted.

## Defects found and fixed

### D1 — the anchor landed behind the fixed bar

The bar is 5rem tall only from 1024px up; below that its link row wraps to two
lines, then three. Where it wraps is content-driven, so it moves with the
language — English is back to one line at 480px while French still needs two.
One `scroll-margin-block-start: 6rem` could not cover that.

| viewport | bar height | before | after |
|---|---|---|---|
| 390×844 | 197.0 | **−101.4px** (behind the bar) | **+10.6px** |
| 768×1024 | 127.7 | **−31.5px** (behind the bar) | **+16.5px** |
| 1024×768 | 80.0 | +16.4px | +16.4px |
| 1440×900 | 80.0 | +15.8px | +15.8px |
| 1920×1080 | 89.3 | +18.0px | +18.0px |

Three values — 13rem / 9rem / 6rem — set at the widest width any of the three
languages still wraps at (540px, 1024px), each clearing the tallest measured
bar by ~1rem.

### D2 — the object crossed the headline

Copy occupied columns 1–5 and the object columns 5–11: they shared column 5 by
design. Measured against the **painted planes**, not the figure's box:

| | before (EN) | before (ES) | after (both) |
|---|---|---|---|
| 1024×768 | 167px² (support) | 535px² (support) | **0** |
| 1440×900 | 4,856px² (headline) | 6,229px² (headline) | **0** |
| 1920×1080 | 0 | 0 | **0** |

Copy now takes columns 1–6, the object 7–12, with a full grid gap between.
Gutter between the headline's longest ink and the object's left edge, after:
79px at 1024, 166px at 1440, 60px at 1920 — in every language.

### D3 — the pin held a section that did not fit

| | before | after |
|---|---|---|
| section height @1024×768 | 1,220–1,315px | **768px** |
| section height @1440×900 | 1,110–1,137px | **900px** |
| section height @1920×1080 | 1,243px | **1,080px** |
| tags visible during the pin | **no**, at all three | **yes**, at all three |
| third beat visible during the pin @1024 | **no** | **yes** |

The height came out of the beats: a vertical stack in the left column was
~390px, the same three beats across the base are 119–146px. Together with
tighter block padding (9rem→7rem top, 6rem→4rem bottom) and a row gap that was
silently inheriting the mobile rule's 4rem, that is the 210–547px.

The trigger also moved from the section's **top** edge to its **bottom** edge.
When the section fits the viewport the two are the same scroll position to the
pixel; they differ only when it does not — a short window, a large zoom. Tested
at 1280×720, 1366×630, 1024×600, 1440×820 and 2560×900: the object, the last
beat and the tags all become fully visible while scrolling, and the pin engages
only afterwards.

### D4 — dead space above, cut-off below

Space between the bar and the first line after an anchor jump: 160.4 → 112.4px
(1024), 159.8 → 111.8px (1440), 179.3 → 125.5px (1920).

### D5 — the primary visual was a void

`--color-bg-surface` on `--color-bg-base` is **1.16:1**, and the old gradient
diluted it with transparency and ran it back to the base colour by 82%: the
largest element in the section carried the least information in it. The lit
face is now a mix of the **text** token into the surface token (~1.6:1), with a
1px inset edge describing the silhouette, a brighter lit top, and a mask that
fades the trailing corner over 18% instead of 32% — the old ramp erased the
corner cut and the edge with it. One rule, and it inverts correctly on the
light theme.

The environmental "04" also became legible as a consequence: it was 8% of the
text token (1.16:1) sitting behind the object *and* below the fold. Its style
is unchanged — 8% matches Closing's numeral. Beat text over it measures 6.5:1
(dark) and 4.88:1 (light), both AA.

### D6 — the object swallowed tablet and mobile landscape

Stretched to its column it was **706×883 at 768×1024** and **776×971 at
844×390** — two and a half viewport heights of a deliberately quiet object.
Capped to `min(100%, 24rem, 48vh)`:

| viewport | object before | object after | section height |
|---|---|---|---|
| 768×1024 | 706×883 | 384×480 | 1,893 → **1,490** |
| 844×390 | 776×971 | 187×234 | 1,990 → **1,254** |
| 390×844 | 350×438 | 350×438 (unchanged) | 1,444 (unchanged) |
| 320×568 | 280×350 | 273×341 | 1,410 (unchanged) |

From 600px up — where 322px of column was left over — the object moves to the
outer edge instead of hugging the copy's left margin, rehearsing the desktop
composition one breakpoint early rather than inventing a third arrangement.

## Verified unchanged

| check | result |
|---|---|
| copy, translations, data | untouched — no i18n or data file in the diff |
| contrast, 8 text roles × 2 themes | identical before and after: dark 7.69–17.8, light 5.16–16.7, all ≥ AA |
| interactions | the section has **0 focusable elements**; tap-target sizing is not applicable |
| entrance reveal | 9 revealed elements, 0 left faded, clipped or shifted (EN/FR, mobile and desktop) |
| depth-separation motion | amplitudes identical (rear −16,−55 @0.92; front +18,+60 @1.06; numeral −14) — and the full separate-**and**-recompose arc now plays inside the pin, where before only the recompose half did |
| reduced motion | nothing hidden, clipped or transformed; section 900px; overflow 0 |
| system theme | resolves in both OS settings; accents match the stored-theme values |
| horizontal overflow | 0 across 42 viewport × language × theme combinations |
| clipped text | 0, in all three languages at all seven viewports |
| sections above | Hardware's own top is unmoved: 5,398.8 @1440 and 7,116.6 @390, before and after |
| section below | Content Universe moves **up 210px** at 1440 — entirely because Hardware is 210px shorter. Both seams still meet at a 0.0px gap |

## Remaining design decisions

1. **2560×900.** The root font-size scales to 21.125px at that width, so the
   section comes to 1,226px and cannot fit a 900px viewport. Nothing is
   stranded — the pin waits — but the object is never framed whole. Outside the
   required matrix; stated rather than special-cased.
2. **After an anchor jump the last ~96px sits below the fold** (the tags line
   at 1440), because a 100vh section landing below a fixed bar cannot show all
   of itself. One scroll later the pin frames it exactly. Inherent, not fixed.
3. **Tablet keeps the stacked order.** A two-column split at 768 would put a
   70px headline in a ~337px column and rewrap every headline in three
   languages; the object moving outboard gets most of the benefit for none of
   that risk.
4. **The object is still a placeholder.** No approved CarterPCs hardware media
   exists, and the brief rules out inventing any. `.mediaLayer` remains the
   single drop-in target; everything here improves how it reads as material,
   not what it depicts.

## Validation

| command | result |
|---|---|
| `npm run typecheck` | pass, 0 errors |
| `npm run lint` | pass, 0 problems |
| `npm run test:run` | **42/42** |
| `npm run build` | pass |
| `npm run test:e2e` | **69/69** (67 existing + 2 new) |
| `git diff --check` | clean |

Four full e2e runs: 69/69, 68/69, 69/69, 69/69. The single failure was
`light theme: the Footer copy meets AA contrast`, which is **not caused by this
change and not in this section**: the footer links transition their colour on
reveal, and the test samples `getComputedStyle` without waiting, catching
`rgb(116,117,118)` (4.22:1) instead of the settled `rgb(95,96,98)` (5.76:1).
Running that exact sequence six times against each build returns the identical
in-flight colour from **both** — the pre-change build fails it 6/6 as well. It
is a latent bug in the Footer's own test, left alone because the Footer is
explicitly out of scope.

New tests:
- *the #hardware anchor lands below the fixed bar at every width, in every
  language* — 4 viewports × 3 languages, asserts positive clearance. Waits for
  the smooth scroll to actually come to rest rather than sleeping a fixed
  interval.
- *Hardware: the object never crosses the copy, and the pin never strands the
  tail* — 3 desktop viewports × 3 languages, asserts 0px² of painted-ink
  overlap and that the section is no taller than the viewport it pins in.

## Screenshot index

Before/after pairs, identical scroll position and settings:

| file | viewport / language / theme |
|---|---|
| 01a / 01b | 1440×900 EN dark |
| 02a / 02b | 1920×1080 EN dark |
| 03a / 03b | 1024×768 ES dark |
| 04a / 04b | 768×1024 FR dark |
| 05a / 05b | 844×390 EN dark — mobile landscape |
| 06a / 06b | 390×844 EN light |
| 07a / 07b | 320×568 FR dark |
| 08a / 08b | 1440×900 FR light |
| 09a / 09b | 1920×1080 ES dark |
| 10 / 11 | system theme, OS dark / OS light, 1440×900 |
