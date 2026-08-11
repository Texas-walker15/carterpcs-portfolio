# fix-v16 — Production-readiness pass (final)

Date: 2026-08-11 · Baseline: `0e9d785` ("fix(ui): complete accessibility and content layout QA") · Working tree only — nothing committed, pushed, reset, cleaned, or reverted.

## 1. Files changed and why

| File | Why |
| --- | --- |
| `src/components/navigation/Nav.tsx` | Scrolled-state detection: one rAF-throttled scroll listener toggling `data-scrolled` on the nav (threshold 16px, initial read on mount for mid-page reloads). |
| `src/components/navigation/Nav.module.css` | The scrim itself: a `::before` overlay (94% `--color-bg-base` + 14px backdrop blur + theme-aware hairline) fading in behind the bar. Zero layout: opacity-only transition on an absolutely positioned pseudo-element. Header comment updated to describe the new behaviour. |
| `src/sections/hardware/Hardware.module.css` | Ultra-wide height governor on the desktop stage: `max-inline-size: calc((100vh − 12.75rem) * 7 / 5)` + `justify-self: end` + explicit `inline-size: 100%`. Mirrors the section's own mobile 48vh idiom; engages only when the six grid columns outgrow the height budget (~2100px+ windows under ~1000px tall). |
| `e2e/app.spec.ts` | Two new tests: scrim transparent at top / present when scrolled / no layout shift / releases at top (desktop + mobile), and reduced-motion instant state change. Polled assertions, no fixed sleeps. |

## 2. Defects found, with before/after evidence

### 2.1 Navigation readability while scrolling (known item 1)

The fixed bar has no background, so during scroll live content interleaved with its labels.

Measured before (elements intersecting the bar rect mid-scroll):
- 1440×900 (80px bar): body copy directly under the section labels and About pill (both themes) — screenshots 01/03.
- 390×844 FR (197px 3-row bar): **7 live text elements inside the bar at once** — "CarterPCs" colliding with "En savoir plus", the About pill over "Millions, tous réseaux", the Contenu/Univers labels interleaved with "En chiffres 02" — screenshot 05.

Fix: transparent at the page top (approved identity); after 16px of scroll a scrim fades in behind the whole bar — `color-mix(in srgb, var(--color-bg-base) 94%, transparent)` + `backdrop-filter: blur(14px)` + a 7% text-token hairline.

Measured after:
- Scrim strength is measured, not eyeballed: with the worst content that can pass beneath (pure white in dark, near-black ink in light), the 64%-alpha section labels resolve to **7.1:1 dark / 5.2:1 light** — AA with margin *even if backdrop-filter is unsupported* (the blur is pure enhancement).
- Layout shift between states: **0.0px** at 80px (desktop), 197px (390 FR), and 196.5px (320 ES) bar heights.
- At top: opacity 0, no attribute; scrolled: opacity 1; back to top: opacity 0 (screenshots 02/04/06/08/09).
- Correct over both pinned sections (Featured horizontal pin, CU field pin) — screenshots 12/13.
- Reduced motion: state still switches, instantly (transition 1e-05s via the global rule).
- The fade only ever ADDS ground behind the labels, so no transition frame dips below the settled contrast; theme swaps are already covered by the fix-v15 `[data-theme-switching]` suppression.

### 2.2 Hardware at 2560×900 (known item 2)

Before: the stage spans six columns of a full-width grid — width-driven — so at 2560×900 it resolved **1198×856px** and its lower **152px sat below the fold** after an anchor jump (stage bottom 1052.4 vs 900 viewport). Screenshot 10.

Fix: a vh-derived cap, same idea as the section's own mobile `48vh` term: the tallest the object may be is what still fits below the bar at rest (6rem anchor margin + 6rem canvas padding + 0.75rem air), expressed as width at 7:5.

After (anchor jump, EN dark):

| Viewport | Stage (w×h) | Stage bottom | Framed? |
| --- | --- | --- | --- |
| 2560×900 | 968×691 (was 1198×856) | **887.9 < 900** (was 1052.4) | **yes** |
| 1440×900 | 646×462 — unchanged | 653.5 | yes |
| 1920×1080 | 870×622 — unchanged | 836.5 | yes |
| 1024×768 | 455×325 — unchanged | 517.4 | yes |
| 1280×720 | 573×409 — unchanged | 601.6 | yes |
| 1536×1024 | 691×493 — unchanged | 685.0 | yes |

The cap never engages at approved sizes — those stage boxes are pixel-identical.

Documented residual (not code-solvable): the *full* section (object + beats band + tags) needs ~1060px of height at 2560×900 against an ~800px content window below the anchor line. Physically impossible under a fixed bar in one viewport without shrinking the approved composition; the existing `bottom bottom` pin delivers the beats band as you scroll. Documented per the task's instruction instead of a per-viewport hack.

### 2.3 Full-site audit (item 4) — no further defects

- **54 full-document walks** (320×568, 390×844, 768×1024, **844×390 (new)**, 1024×768, 1280×720, 1440×900, 1920×1080, 2560×900 × EN/FR/ES × dark/light): horizontal overflow 0, clipped text 0, residual animation state 0, bottom + footer reached, **zero console errors / page errors / failed requests** in every walk.
- **Anchors at 844×390** (new viewport): all 4 navigable sections × 3 languages land **15.6–16.3px** below the bar.
- **200% zoom** (640×360, 960×540 × 3 languages): clean.
- **Reduced motion** (390×844, 844×390, 1440×900): 0 hidden reveals; the 2 transforms are the authored static rotations (fix-v15 documented); scrim switches instantly.
- **System theme**: OS-dark → `dark` stamped, `rgb(13,13,13)` ground; OS-light → `light` stamped, `rgb(245,245,241)` ground.
- **Structure**: skip link first tab stop → `#main-content` (exists); both navs labelled ("Primary navigation" / footer navigation); 1 main, 1 footer; heading order H1 → per-section H2 → H3, no skips; visible 2px cyan focus outline on all first 12 tab stops; all 9 external links `target="_blank" rel="noreferrer"`; all images load, correct eager/lazy split (hero portrait + Creator visual eager by design, everything else lazy).
- **Tap-target flags** in the sweep are the fix-v15-proven false positives, re-verified against this build: `::after` overlays give bar links **25px**, wordmark **37.5px**, Learn-more **25.5px**; footer links 35.5px boxes; About pill 44px.

### 2.4 Placeholder media (item 3)

Both placeholders are intentional, decorative (`aria-hidden="true"` + `data-dev-placeholder="true"`), responsive at every audited viewport, and carry no contrast/clipping/empty-space defects. Image pipeline: browsers fetch the 109 KB WebP of the Creator visual (the 1,776 KB PNG is a no-WebP fallback only and is never requested by any modern browser).

## 3. Issues intentionally not fixed

1. **Hardware full-section fit at 2560×900** — see 2.2's residual. Documented, not hacked.
2. **`<header>` landmark absent** — the labelled `<nav>` landmark is complete and valid on its own; wrapping the fixed bar in a `<header>` would change approved DOM/styling for no assistive-tech gain.
3. **Hero portrait `alt=""`** — approved art-direction decision: the portrait is decorative treatment; the identity is carried in text.
4. **Bar transparency at the exact page top** — approved identity, and at rest at the top nothing can sit under the bar; the scrim covers every scrolled state.

## 4. Exact assets still required from the owner

1. **Hardware stage (`.mediaLayer`)** — one approved hardware photograph or video poster of a real CarterPCs build (interior/component macro). Landscape, **≥1400×1000px** (renders up to 968×691), subject in the left/centre two-thirds (the trailing corner dissolves via mask; top-right corner is clipped by the silhouette cut). Dark-set photography preferred.
2. **Content Universe — Hardware crop (`data-media="hardware"` → `.mediaSurface`)** — one wide landscape crop, **≥1000px wide, ≈2:1 usable area**; the pin re-crops it between three clip states, so the subject must survive ±25% edge cropping.
3. **Content Universe — Mobile crop (`data-media="mobile"` → `.mediaSurface`)** — one vertical **9:16** frame (native Shorts still), **≥600×1067px**; slips behind the headline, edges clipped ±12% during the pin.

No other sections use placeholders: Hero, Creator and Featured already run approved/real assets.

## 4b. Independent verification pass (re-verified, not trusted from the earlier pass)

Every interaction surface was exercised directly rather than assumed from geometry. Full log in `diagnostics.txt` §7.

- **Featured Shorts:** poster state (no iframe before interaction) · click-to-play mounts exactly one `youtube-nocookie` embed · opening a second story leaves exactly one player mounted and it is the new one · Like toggles `aria-pressed` and back, fetching nothing · 6/6 external links `target="_blank" rel="noreferrer"`, all `youtube.com/shorts` · Escape closes the player · Escape restores focus to the originating play control.
- **Menus:** open on click with `aria-expanded` · Arrow/Home/End move focus inside · Escape closes and returns focus to the trigger · outside click closes · French applies live and persists across reload · theme selection persists and is stamped pre-paint (verified with `#root` still empty).
- **Nav under the scrim:** at 1440×900 and 390×844, the bar link still navigates (1400→5303, 1400→6909) and the theme menu still opens while the scrim is up.
- **Pinned sections:** page end reached, footer visible, at all three of 1440×900, 1024×768, 2560×900.

**Four probe faults were found and corrected** (none were application defects): a case-insensitive `play` selector that matched "Close player"; a seeding `addInitScript` that re-wrote `localStorage` on every reload, invalidating the persistence test; an assertion that `a[href="#creator"]` is the first bar slot when it is the third ("Process"/"Processus"); and unscoped nav locators matching the footer's repeated hrefs.

**Residue investigation.** A no-settle snapshot at the page bottom showed 2 inline clip-paths and 4–5 faded elements. After a 2.5s settle the clip-paths are gone — they were the Closing headline's entrance wipe in flight. Exactly two faded elements remain at every viewport: Hardware's `.tags` and Content Universe's `.index`, both **authored `opacity: 0.85` in CSS**, not animation residue. Measured on the composited effective ink: **12.86:1 dark, 10.95:1 light** — the same method that caught fix-v15's real tier-3 defect at 3.44/2.54:1. Not a defect.

## 5. Validation results and git status

See `diagnostics.txt` for the full logs.

- typecheck: 0 errors · lint: 0 errors · unit: **42/42**
- build: pass
- e2e: `--list` reports **72 tests**; **72/72 passed on seven consecutive full runs** (70 existing + 2 new scrim tests), 0 failed / 0 skipped / 0 flaky.
- **Flake investigation:** the suite's slowest test (`the #hardware anchor lands below the fixed bar…`, 12 language×viewport combinations each polled to rest) ran in isolation **6× against the working tree and 6× against a rebuilt `0e9d785` baseline — 12/12 passed**, 24.6–28.1s. Slow, not flaky.
- **Disclosed anomaly:** one early background batch piped the default reporter through `tail -2` and printed "71 passed" on two of its three runs, with zero failures. Not reproducible across seven later runs; most consistent with a worker not completing under concurrent load in a shell that was simultaneously running vitest and a build. Recorded rather than omitted.
- `git diff --check`: clean
- `git status`: modified `e2e/app.spec.ts`, `src/components/navigation/Nav.module.css`, `src/components/navigation/Nav.tsx`, `src/sections/hardware/Hardware.module.css`; untracked `Claude report/fix-v16/`. Protected old report folders untouched.
