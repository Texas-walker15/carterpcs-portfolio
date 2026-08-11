# fix-v15 — Final implementation and QA pass

**Scope.** Content Universe (Section 05), the global dark-theme violet accent,
the Footer/theme-boot contrast defect, cross-site anchors, and the final
cross-site QA matrix. Baseline: `857bb6e` (the committed Hardware pass).

## Executive summary

Four defect groups were found and fixed, all measured before and after:

1. **Content Universe parked its composition under the fixed bar.** The
   pinned field's `3.25rem` top padding cannot clear a `5rem` bar: for the
   entire 1.1-viewport pin, the "Hardware" territory headline ran through the
   bar's own link row and the About Carter button sat on "Tech News" — at
   1024, 1440 and 1920, in all three languages (box overlap 20k–58k px²; the
   bar has no background, so it is ink on ink). The `#content-universe`
   anchor also landed **−100.7px behind the bar** at 390px and −31.3px at
   768px.
2. **The dark violet accent failed AA everywhere it was small text.** Ten
   rendered instances measured 1.55–3.77:1 against their real grounds
   (worst pixel under the glyphs). The requested candidate `#8f5bf6` was
   evaluated and **rejected by measurement**: it misses the two non-base
   grounds those labels really sit on (3.69:1 on the "0" digit's fill,
   3.98:1 on the Hero About chip).
3. **The theme was stamped after first paint.** A stored light theme painted
   one dark frame, then every element with a colour transition animated
   through out-of-palette intermediates for ~150ms — the Footer links passed
   through 4.22:1. This was the real cause of the flaky Footer contrast test.
4. **`#creator` and `#featured` anchors landed behind the bar** below 1024px
   (−100 at phones, −32 at tablet) — the same class of defect fixed for
   Hardware in fix-v14, now fixed for every navigable section.

## Files changed (8)

| File | Change |
|---|---|
| `src/sections/content-universe/ContentUniverse.module.css` | responsive anchor margin; pinned field clears the bar (3.25→6.5rem, height guard rebalanced so grid rows keep identical space); labels occlude the thread |
| `src/styles/tokens.css` | dark `--color-accent-secondary` `#7c4fd6` → `#9d75f0`, with the measured rationale |
| `index.html` | pre-paint theme stamp (mirrors `readStoredTheme` byte-for-byte) |
| `src/app/Preferences.tsx` | theme swap suppresses colour transitions for the swap frame; no-op when the stamp already matches |
| `src/styles/global.css` | the `[data-theme-switching]` suppression rule |
| `src/sections/creator/Creator.module.css` | responsive anchor margin (13/9/6rem) |
| `src/sections/featured/Featured.module.css` | responsive anchor margin (13/9/6rem) |
| `e2e/app.spec.ts` | Footer test rebuilt frame-accurate; new mid-swap test |

`git status`: those eight files, `254 insertions(+), 36 deletions(-)`.
Nothing committed, pushed, reset, cleaned or reverted. No report folder
touched. No copy, translation, data, link or interaction changed anywhere.

## Defects, measured before → after

### D1 — Content Universe pinned under the bar

| Reading | Before | After |
|---|---|---|
| bar-box × entry-text overlap, state A @1024 | 26,710px² | **0** |
| state A @1440 | 37,963px² | **0** |
| state A @1920 (EN/FR/ES) | 56,669–58,447px² | **0** |
| all 36 pinned readings (A/B/C × 4 widths × 3 languages) | 34/36 non-zero | **36/36 zero** |

Mechanics: the field's pinned top padding goes 3.25rem → 6.5rem, and the
height guard goes `100vh − 9rem` → `100vh − 5.75rem` — the same 3.25rem moved
from one term to the other, so `(100vh − 9rem) − 3.25rem` and
`(100vh − 5.75rem) − 6.5rem` give the grid rows the same space at every
height-bound viewport. No entry moved relative to the field; the frozen frame
simply starts below the bar.

### D2 — Content Universe anchor (and Creator, Featured)

| Anchor | 320 before → after | 390 before → after | 768 before → after |
|---|---|---|---|
| `#content-universe` | −100.5 → **+11.3** | −100.7 → **+11.2** | −31.3 → **+16.5** |
| `#creator` | −100.4 → **+11.3** | −100.6 → **+11.2** | −31.8 → **+16.2** |
| `#featured` | −100.7 → **+11.4** | −100.7 → **+11.1** | −31.4 → **+16.3** |

All 24 width × language combinations measured for all four navigable
sections: every landing clears the bar by 10.5–18.7px. (`#hero` is the page
top; the bar overlays the Hero's environment by design.)

### D3 — the dark violet accent

Every rendered instance, dark theme, measured against the worst pixel under
its own glyphs with the text hidden:

| Instance | Ground | Before | After |
|---|---|---|---|
| Hero card index "01" (About chip) | violet chip rgb(38,32,53) | 3.14 | **4.65** |
| Hero card index "02" | card rgb(15,15,16) | 3.60 | **5.69** |
| Hero tile indexes "03/04/05" | tiles rgb(7–12,…) | 3.68–3.77 | **5.79–5.95** |
| Creator kicker "The Creator" | base #0d0d0d | 3.65 | **5.77** |
| CU "Custom Builds" | the "0" digit fill #242424 | 2.92 | **5.65** |
| CU "Smartphones", "Controversies" | base | 3.65 | **5.77** |
| CU "Budget Gear" | the thread's cyan hairline | 1.55 | **5.77** (thread occluded) |
| Featured liked-heart (graphic, needs 3:1) | frame ground | 3.65 | **5.77** |

The token: `#7c4fd6` → **`#9d75f0`** — the same 260° hue, the darkest value
that clears 4.5:1 on every measured ground (5.77 base, 4.61 digit fill, 4.97
chip). `#8f5bf6` was measured first and misses two grounds (3.69, 3.98).
Light theme (`#5f3ca7`, 7.14:1) untouched; the system theme resolves to one
of the two.

"Budget Gear" needed more than a token: the section's connecting thread — a
cyan hairline — crossed the 12px label's glyph line at every desktop width
(probed at 600 points per state; in some state/width/language it crosses
nearly every small label). No violet beats a cyan line (1.03:1 against the
new token). The labels now carry a base-token plate the width of their own
words, so they **occlude the thread exactly as the media crops do** — the
section's own idiom. On the plain ground the plate is invisible (it *is* the
base token); at the crossing, 16 of 17 path points inside the label's box are
occluded (the 17th is the rotated bounding-box corner, outside the glyphs).

### D4 — theme stamped after first paint (the Footer defect)

| Reading | Before | After |
|---|---|---|
| footer link colour on early frames, stored light | rgb(116,117,118) = **4.22:1**, settling to 5.76:1 over ~150ms | rgb(95,96,98) = **5.76:1 from frame 0** |
| the old e2e test across 10 isolated runs | failed 5/5 when sampled early | new frame-accurate test: 12/12 runs pass |
| distinct colours rendered during a menu theme swap | dark ink → **intermediates** → light ink | **exactly two** — dark's ink and light's ink, no third on any frame |

Fix: `index.html` stamps `data-theme` before first paint (same key, values
and fallback as `readStoredTheme`); `Preferences.tsx` still owns mid-session
changes and the system listener, but now applies a palette swap with colour
transitions suppressed for that frame (`[data-theme-switching]` +
`transition-duration: 0s`), so no element can render a colour that belongs to
neither palette. Hover transitions are untouched. The Footer itself needed
no change — its resting colours were always compliant; the boot sequence was
not.

Regression tests, no arbitrary timing:
- *light theme: the Footer copy meets AA contrast on every frame from first
  paint* — samples 20 consecutive animation frames from as early as the
  runner can ask; every sample of every footer link/paragraph must be ≥4.5:1.
- *switching theme through the menu never renders the Footer mid-swap* —
  records the footer link colour on **every frame** from before the real
  menu click until after the swap; asserts the set of observed colours is
  exactly the two palettes' inks.

## Final cross-site QA matrix

| Check | Result |
|---|---|
| 8 viewports × EN/FR/ES × dark/light (48 walks, 14 scroll steps each) | horizontal overflow **0**, clipped text **0**, residual clip-paths **0**, bottom reached and footer visible in **all 48** |
| 200% zoom (640×360, 960×540) × EN/FR/ES | overflow 0, clipped 0, bottom reached |
| reduced motion @390 and @1440 | overflow 0, hidden reveals 0, transformed 0 |
| system theme, OS-dark / OS-light | stamped correctly pre-paint, correct palette, accent `#9d75f0` / `#5f3ca7` |
| every navigation anchor × 8 widths × 3 languages | all land 10.5–18.7px below the bar |
| tap targets | all flagged rows are the bar links / Hero "Learn more", whose documented `::after` overlays give 25–25.5px real hit areas (verified from the pseudo-element geometry); everything else ≥24px |
| CU pin | reaches its end, releases, document height stable, Hardware→CU and CU→Closing seams at 0.0px gap |
| Featured interactions | covered by the e2e suite (click-to-play, one-player, Like, Comments, Share, Watch, Escape, focus return) — all pass |

## Still requires a design decision

1. **The bar has no background at any width**, so while *scrolling* (not at
   any settled or pinned state) section text passes beneath the bar's labels
   and the two ink layers cross. This is the approved design across every
   approved section; on phones the bar is 197px of a 568–844px viewport, so
   the crossing zone is proportionally large. If it should ever change
   (scrim, blur, or a compact scrolled state), that is an identity decision,
   not a defect fix — flagged, not touched.
2. **2560×900** still cannot hold Hardware's full frame (fix-v14's stated
   residual, unchanged): nothing is stranded, but the object is never framed
   whole at that aspect ratio.
3. **Content Universe media windows and the Hardware object remain approved
   placeholders** until real assets are supplied — unchanged by instruction.

## Validation

| Command | Result |
|---|---|
| `npm run typecheck` | pass, 0 errors |
| `npm run lint` | pass, 0 problems |
| `npm run test:run` | **42/42** |
| `npm run build` | pass |
| `npm run test:e2e` | **70/70** (69 existing − 1 rebuilt + 2 new) |
| `git diff --check` | clean |

The one previously-flaky test (Footer contrast) was proven pre-existing in
fix-v14 by running its exact sequence against baseline and changed builds
(6/6 failures on both); this pass **fixes the defect it was detecting**
rather than the test's timing, then makes the test frame-accurate.
