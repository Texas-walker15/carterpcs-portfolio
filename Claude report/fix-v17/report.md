# fix-v17 — Navigation UX: honest destinations + compact mobile header

Date: 2026-08-11 · Baseline: `1c5cb92` ("fix(nav): add scrolled-state scrim and frame Hardware on ultra-wide viewports" — fix-v16, committed by the owner mid-pass) · Working tree only — nothing committed, pushed, reset, cleaned, or reverted by this pass.

## 1. Files changed

| File | Why |
| --- | --- |
| `src/components/navigation/sections.ts` | 6 hrefs → 4 unique hrefs; the rationale comment. |
| `src/i18n/en.ts`, `fr.ts`, `es.ts` | `nav.sections` 6 → 4 labels; new a11y strings `chooseSections` / `sectionsMenu` in all three languages. |
| `src/components/navigation/Nav.tsx` | The sections disclosure: third `MenuId`, trigger + `role="menu"` panel of `role="menuitem"` links, shared `items()` matches both item roles; link activation closes without stealing focus from the browser's fragment navigation. |
| `src/components/navigation/Nav.module.css` | Centre row hidden < 1024 (desktop unchanged); trigger + panel styles (~43px items); narrow-phone utils fit (< 540px: 0.5rem gaps, compact pill, decorative arrow hidden). |
| `src/sections/creator/Creator.module.css`, `featured/Featured.module.css`, `hardware/Hardware.module.css`, `content-universe/ContentUniverse.module.css` | Anchor margins retuned to the compact header: 9rem base / 6.5rem ≥ 600px / 6rem ≥ 1024px (was 13/9/6 at 540/1024), with the measured derivation in Hardware's comment. |
| `src/app/App.test.tsx` | Destination assertions now go through the disclosure (jsdom applies the injected CSS, so the hidden desktop row is hidden there too); new Issue-1 regression test mapping every label to its own distinct anchor; footer parity 6 → 4. |
| `e2e/app.spec.ts` | "Content" link test → "Universe"; mobile menu-overlap test re-targeted at the bar's controls; 24px target test re-targeted at the menu items (43px) + trigger; two new tests: full menu cycle (open/arrows/Escape-focus-return/outside-click/real navigation/never-stranded focus) and reduced-motion visibility; barGeometry ignores hidden controls; footer counts 9/6 → 7/4. |

## 2. Issue 1 — misleading duplicate destinations

Before: six labels, four destinations — "Work" **and** "Impact" → `#featured`; "Content" **and** "Universe" → `#content-universe`.

Fix: the two labels whose targets were duplicates are **removed, not renamed** — every remaining label keeps exactly the destination it already had, one label per section. No fake sections, no new names.

### Final primary-navigation labels and destinations

| EN | FR | ES | Destination |
| --- | --- | --- | --- |
| Work | Projets | Proyectos | `#featured` |
| Systems | Systèmes | Sistemas | `#hardware` |
| Process | Processus | Proceso | `#creator` |
| Universe | Univers | Universo | `#content-universe` |

Plus the identity/utility controls: wordmark → `#hero`, "About Carter" pill → `#creator`. All five required destinations remain navigable. The Footer renders the same four labels/targets from the same shared `SECTION_HREFS` list (it cannot drift). A regression test asserts the exact label→href map and that no two section links share an anchor.

## 3. Issue 2 — oversized mobile navigation

Before → after fixed-bar height (EN/FR/ES identical unless noted):

| Viewport | Before | After |
| --- | --- | --- |
| 320×568 | **196.5px** (3 rows) | **124.5px** (2 rows: identity / utilities) |
| 390×844 | **197px** (3 rows) | **124.5px** |
| 430px | 197px | 86px EN/ES · 124.5px FR (single row from 470) |
| 768×1024 | 128px (2 rows) | **86px** (1 row) |
| 844×390 landscape | 128px | **86px** — 22% of the viewport instead of 33% |
| ≥ 1024 (desktop) | 80px | 80px — **unchanged**, full centre row |

The compact header keeps identity + About Carter + theme + language + the sections trigger visible; the four section links live behind the trigger. The menu reuses the theme/language disclosure system verbatim — one open-menu owner, Escape-with-focus-return, outside-press close, Arrow/Home/End movement, `aria-haspopup`/`aria-expanded`/`aria-controls`, translated accessible names.

Measured behaviors (probe + e2e):
- Menu cycle passes in EN (e2e) and FR/ES (probe): translated items, Escape returns focus to the trigger, outside click closes, zero console errors.
- Items are **43px** tall (min required 24, preferred 44); the trigger is a 38px square, consistent with the approved theme/language squares.
- Link activation navigates, closes the panel, and leaves focus with the browser's fragment navigation — never stranded in the hidden panel (asserted).
- Reduced motion: menus are display-toggled (no transition to strand them); asserted visible with opacity 1 per item.
- Contrast (srgb-aware measurement): trigger icon **9.37:1 dark / 6.96:1 light** (needs 3), item text **16.07:1 dark / 14.94:1 light** (needs 4.5).
- Scrim compatibility: transparent at top, scrim when scrolled, unchanged — the trigger and panels operate over the scrim (e2e keeps the fix-v16 tests green).

### Defect found during this pass's own QA
At 320px the non-wrapping utils row (French pill ~160px + three 38px squares + 1.25rem gaps ≈ 334px) exceeded the 280px content width — the sections trigger sat off-screen. Fixed below 540px: 0.5rem gaps, compact pill (0.8125rem, 0.625rem padding), decorative arrow hidden (aria-hidden span, not copy). Widest (FR) row now ~272px; verified `ok` at 320–844 in all three languages, every control inside the bar's padding edge.

### Anchors after the margin retune
All four sections × three languages × 320/390/599/600/768/844×390/1024/1440: land **15.6–19.9px** below the bar (58px in the 470–599 EN/ES band where the bar is single-row early — air, not overlap; boundary sits at 600 because French holds two rows through 599).

## 4. Validation and git status

See `diagnostics.txt`. typecheck 0 · lint 0 · unit **43/43** (42 + new map test) · build pass · e2e **74/74 × 3 consecutive runs** (72 + 2 new; 2 rewritten) · `git diff --check` clean.

`git status` (working tree, nothing staged — the diff is pure fix-v17 over `1c5cb92`):
```
 M e2e/app.spec.ts
 M src/app/App.test.tsx
 M src/components/navigation/Nav.module.css
 M src/components/navigation/Nav.tsx
 M src/components/navigation/sections.ts
 M src/i18n/en.ts
 M src/i18n/es.ts
 M src/i18n/fr.ts
 M src/sections/content-universe/ContentUniverse.module.css
 M src/sections/creator/Creator.module.css
 M src/sections/featured/Featured.module.css
 M src/sections/hardware/Hardware.module.css
?? Claude report/fix-v17/
```
