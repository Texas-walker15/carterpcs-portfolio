# CarterPCs Hero — Wide-Screen Scale Fix

Date: 2026-08-09 · Branch: `main` · Nothing committed or pushed.

## 1. Diagnosed root cause

The shared composition canvas (`.canvas`, and the nav's `.bar`) is hard-capped at `max-width: 96rem` (1536px), and **every** dimension in the Hero resolves against that system — rem values with a fixed 16px root, canvas-relative percentages, and `clamp()` expressions whose caps are in rem. Above 1536px the canvas therefore stops growing and centres: at 2048×1015 it rendered 1536px wide at x-origin 256 (256px of dead black per side); at 2560, 512 per side. The headline stayed exactly 140px at every width. No bug — the Task-9 "canvas rule" was implemented as a hard freeze with no large-screen presentation layer above it.

## 2. Viewport / deviceScaleFactor diagnostics (before)

Recorded in `diagnostics.txt`. At all four probed viewports: `innerWidth`/`clientWidth` matched the Playwright viewport exactly, `devicePixelRatio: 1`, `visualViewport.scale: 1`, root font-size 16px, no screenshot resizing. Canvas: 1536w at x=0 (1536), x=256 (2048), x=192 (1920), x=512 (2560). h1: 140px / 586px wide everywhere.

## 3. CSS zoom / transform scaling

None existed. A source grep found no `zoom` and no ancestor `transform: scale` (the only transform hit is the CTA's `:active` press micro-scale). The walk up from the h1 through every ancestor found `transform: none` and no zoom on all of them.

## 4. Exact 1536×1024 before/after

- `control-1536x1024-before.png` vs approved reference: mean Δ 8.91, >40 at 4.6% — identical to the approved pass's final metrics → geometry frozen per §2.
- `control-1536x1024-after.png` vs `control-1536x1024-before.png`: **mean 0.0000, max per-pixel difference 0 — byte-identical.** The reference frame is untouched.

## 5. Wide-screen strategy implemented

Two CSS changes, no component changes, no transforms, no zoom:

1. **Large-desktop presentation scale** (`src/styles/global.css`): at `min-width: 1537px` the root font-size becomes
   `max(16px, min(calc(16px + (100vw − 1536px) × 0.005), calc(100vh × 0.01818), 21.125px))`.
   Because the whole composition (canvas width, nav bar, all type/card/tile dimensions) is rem-driven with canvas-% positions, scaling the root rem scales the entire system as one coherent unit — real layout boxes, crisp text, correct hit areas. The first term is the width slope (×1.12 @1920, ×1.16 @2048, capped ×1.32 @2560+). The second term is the **height governor**: the compressed art direction can hold at most a scale of viewport-height ÷ 880, so short-wide displays get exactly the scale their height affords. Floored at 16px so nothing ever shrinks below reference.
2. **Short-wide compression bands** (`src/sections/hero/Hero.module.css`): the pre-existing short-desktop compression block gained width-tracked bands — `(1537, ≤1063)`, `(1728, ≤1139)`, `(1990, ≤1209)`, `(2208, ≤1279)`, `(2432, ≤1329)` — each height limit sitting just above the collision requirement (~996 × scale) at its band's widest point, so no width/height combination falls through uncompressed. A wide-band-only override (never touching the pre-approved 1240–1536 band) trades the scaled minimum canvas height for an exact-fold fit (`min-height: max(100vh, 50rem)`), shaves the compressed headline cap to 8.4375rem, and lifts the card rail top to 20.5%.
3. **Carter presence** (≥1537px only): the portrait is height-driven while text/cards are width-driven, so the stage gets a deliberate boost (`inset-block-start: 16.3%; height: 62%`) to hold its rank against the enlarged headline.

## 6. 2048×1015 — the critical case (before → after)

Before: 1536px poster centred in 256px black margins, h1 140px, root 16px.
After: root 18.45px (×1.153, height-governed), canvas 1771px wide (138px margins), h1 155.7px, Carter stage 165→795 (face higher and ~5% larger), cards/tiles/nav all scaled and attached. CTA bottom 661 / stats bottom 662 vs tiles top 676 (14–15px air); strip at 984, disclaimer at 1008 — everything above the 1015 fold. See `2048-before-vs-after.png`.

## 7. 1920×1080

Root 17.92px (×1.12 — within the 10–15% guidance), h1 151px, compressed rhythm engages (its scaled frame needs 1147px of height), 87–96px of air above the tiles, full composition + strip + disclaimer inside 1080.

## 8. 2560×1440

Root 21.12px (×1.32 cap), h1 184.8px, uncompressed reference rhythm — the full-scale premium frame with 93px of air. 2560×1080 gets the height-governed ×1.227 with compression (14–16px air).

## 9. Short-wide behavior

1920×900: height governor caps scale at ×1.023, compression band 1 active, 11–13px air, zero collisions. All five short-wide test viewports (2048×1015, 1920×900, 1920×1080, 2560×1080 + baseline 1280×720) verified collision-free by DOM box measurement, not just visually.

## 10. Changes made

- `src/styles/global.css`: the `@media (min-width: 1537px)` root font-size rule (+ documentation).
- `src/sections/hero/Hero.module.css`: compression media-query band list; wide-band-only override block (canvas height trade, headline cap, cards top); `.stage` wide-screen boost block.
- No TSX/component changes, no content changes, no motion changes, no changes below 1537px width other than none (verified byte-identical).

## 11. Motion implications

None structural. GSAP reads real layout boxes (no transforms/zoom introduced), `ScrollTrigger` has `invalidateOnRefresh: true` and GSAP's built-in resize refresh handles crossing the breakpoint. The 2048×1015 recording shows Intro → entrance → rest → scroll → Creator behaving identically to the approved motion.

## 12. Responsive regressions found and fixed during the task

1. First implementation collided at 1920×1080 and 2560×1080 (width-driven scale outgrew their heights) → added the height governor + finer bands.
2. Two compressed-block tweaks and the 50rem canvas floor initially leaked into the pre-approved 1240–1536 band, drifting 1440×900 by ~4.5px and shrinking the 1280×720 canvas → scoped to wide bands only. Final regression diff vs the approved finals: **1440×900, 1024×768, 390×844, 320×568 all mean 0.000 (byte-identical)**.

## 13. Tests

typecheck ✓ · lint ✓ · format:check ✓ (project files) · **unit 11/11 ✓** · **e2e 16/16 ✓** · CLS **0** and horizontal overflow **0** and console errors **0** at all 12 tested viewports (six small + 1536 + five wide) · `git diff --check` clean.

## 14. Bundle

JS 358.19 kB → **120.75 kB gzip** (unchanged, ≤150 limit). CSS 48.5 kB → 8.9 kB gzip.

## 15. Git status

12 modified + 5 untracked (now including `Claude report/`); **nothing committed, pushed, or synced**.

## 16. Artifacts (all in `Claude report\fix-v1`)

| File | What it is |
|---|---|
| `fix-v1.pdf` | Consolidated review package (32 pages) |
| `report.md` | This report |
| `diagnostics.txt` | Raw viewport + DOM measurements |
| `video.webm` | Recording at 2048×1015 |
| `before.png` / `after.png` | 2048×1015 before and after |
| `compare.png` | 2048×1015 before vs after, stacked |
| `control-before.png` / `control-after.png` | 1536×1024 control (byte-identical) |
| `reference-compare.png` | Approved reference vs current 1536×1024 |
| `overlay.png` / `difference.png` | 1536×1024 50% overlay and amplified diff |
| `zoom-1.png` / `zoom-2.png` | 2048×1015 headline and cards detail |
| `desktop-1.png` … `desktop-8.png` | 1920×1080 before/after, 1920×900, 2560×1080, 2560×1440 before/after, 1440×960, 1440×900 |
| `tablet-1.png` / `tablet-2.png` | 1024×768, 768×1024 |
| `mobile-1.png` / `mobile-2.png` | 390×844, 320×568 |
| `frame-1.png` … `frame-6.png` | Recording key frames (00:00, 00:03, 00:08, 00:12, 00:14, 00:17) |

## Critical notes

- At 1920×900-class heights the scale gain is small (×1.02) by design — the height governor refuses growth the viewport cannot hold; the win there is correctness, not size.
- Band boundaries are discrete: crossing e.g. 1063→1064px of height at 1600px width swaps compressed/uncompressed rhythm during a live resize. Static viewports (the real-world case) are unaffected.
- Beyond 2560px the scale caps at ×1.32, so ultrawide 3440px monitors will again show growing margins; that regime was out of scope and can get its own band later if wanted.
