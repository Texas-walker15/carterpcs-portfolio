# fix-v12 — Creator section (`#creator`) desktop composition

**Scope:** the Creator section only. Two files changed, both inside
`src/sections/creator/`. No other section, no navigation, no global design
token, no copy, no translation, and no animation was touched. Nothing was
committed, pushed, reset, cleaned or reverted.

Every figure below is measured in a real Chromium across 12 viewports × 3
languages × 2 themes (72 combinations), not estimated from a screenshot. The
raw sweeps are in `diagnostics.txt`.

---

## 1. What changed

| # | File | Change |
|---|---|---|
| 1 | `Creator.module.css` | `.canvas` moved from `grid-column: 7 / 13` to `6 / 12` — one column left, same six-column measure |
| 2 | `Creator.module.css` | `.canvas` top-anchored (`align-self: start`) with `padding-block-start: min(7.25rem, 14vh)` instead of being centred in the 100vh row |
| 3 | `Creator.module.css` | `.stageNumeral` placed on the section's own left content margin, `calc(12.5% + var(--container-padding-inline))`, and strengthened from 12% to 16% |
| 4 | `Creator.module.css` + `Creator.tsx` | new `.anchor` — a CSS-only drafting grid behind the numeral, desktop/tablet only |
| 5 | `Creator.module.css` | `.body` colour lifted off the muted token; `line-height` 1.5 → 1.7 (desktop only) |
| 6 | `Creator.module.css` | `.creator` gained `scroll-margin-block-start: 6rem` — a defect found while measuring, see §4 |

The headline's wording, font, weight, scale, `max-width: 15ch` and therefore
every one of its line breaks are untouched. So is the body's `52ch` measure.
Moving the block by a whole grid column rather than by an arbitrary offset is
what makes that possible: `6 / 12` spans exactly the same six columns as
`7 / 13`, so the type block's width — and every line break inside it — is
byte-identical, and only its position moves.

---

## 2. The four problems, measured before and after

All rows English unless noted; the full 72-combination sweep is in
`diagnostics.txt` sections A–C.

### 2.1 "The text column sits too far right"

| Viewport | Text column starts | Gap from the numeral's ink to the first character |
|---|---|---|
| 1024×768 | 553 → **467.6** | 263 → **115** |
| 1280×800 | 691.2 → **584.5** | 371 → **185** |
| 1440×900 | 777.6 → **657.6** | 438 → **230** |
| 1536×1024 | 829.4 → **701.4** | 489 → **266** |
| 1920×1080 | 1031.7 → **871.7** | 654 → **381** |

The void between the two halves of the composition is roughly halved at every
width. Part of that is the column moving left, part is the numeral moving
right (§2.2) — they close the gap from both sides.

**One thing I checked and did *not* change.** My first hypothesis was that the
text column overshot the site's shared content frame on the right. It does
not. Measured (`diagnostics.txt` §G), the site has two families of section:
Hero, Closing and Footer are constrained to a 96rem canvas, while Hardware,
Content Universe *and* Creator are full-bleed and run to the padding edge. At
1920 Creator's canvas edge is 1854.5 and Content Universe's is 1854.5 — the
same. So the right edge was already correct and I left it alone; the problem
was the left edge, and only the left edge is what moved.

### 2.2 "The decorative `02` feels partly lost"

It was being amputated by the section's `overflow: clip`. Pixels of glyph lost
off the left edge, before → after:

| Viewport | Glyph lost to the clip |
|---|---|
| 1024×768 | 22.1 px → **0** (41 px inside the edge) |
| 1280×800 | 27.7 px → **0** (51.2 px inside) |
| 1440×900 | 31.1 px → **0** (57.6 px inside) |
| 1536×1024 | 33.2 px → **0** (61.4 px inside) |
| 1920×1080 | 41.5 px → **0** (71.7 px inside) |

That is what made it read as accidental rather than as art direction: the
slice was thin and it *changed with the viewport*, so it never looked like a
decision. It now sits on the same left margin as every other section's copy,
at every width, which is a placement a reader can recognise as deliberate.

The arithmetic is exact rather than eyeballed. The stage begins at `-6%` of
the section and is `48%` of it wide, so its overhang is exactly `6/48 = 12.5%`
of the stage's own width; `calc(12.5% + var(--container-padding-inline))`
therefore lands the glyph box on the page margin at any width. Measured
residual: the glyph's ink sits 0–6.3 px right of the margin, which is the
font's own left side bearing.

Strengthened from 12% to 16% of the text colour — it can afford slightly more
presence now that it is whole rather than half off-screen.

### 2.3 "The body copy is slightly too dim"

| | Dark | Light |
|---|---|---|
| Contrast before | 7.69:1 | 5.76:1 |
| Contrast after | **10.21:1** | **8.22:1** |
| Headline, for comparison | 17.6:1 | — |

`color-mix(in srgb, var(--color-text-primary) 30%, var(--color-text-muted))`.
One rule, no per-theme override and no token change, and the copy still loses
clearly to the headline — which was the constraint.

Line-height was the other half of the problem and is easy to miss by eye: the
paragraph was set at **1.5**, the tightest body measure on the site, sitting
directly under its largest headline. Hero's support paragraph is 1.7, Closing's
is 1.6. It is now 1.7, matching Hero. Applied at ≥1024px only, so the approved
mobile block keeps its exact rhythm.

### 2.4 "Too much vertical empty space between the navigation and the label"

Gap from the bottom of the fixed bar to the metadata line's first ink:

| Viewport | EN | FR | ES |
|---|---|---|---|
| 1024×768 | **−29.2 → 28.5** | −14.2 → 28.4 | −14.1 → 28.5 |
| 1280×800 | **−9.7 → 33** | 9.9 → 33 | 23.4 → 33 |
| 1440×900 | 42.4 → 37 | 64.8 → 37 | 64.8 → 37 |
| 1536×1024 | 97.5 → **37** | 121.6 → **37** | 121.6 → **37** |
| 1920×1080 | 61.8 → 41.6 | **138 → 41.6** | 92.4 → 41.6 |

Note the two negative numbers. Before this pass the band was not merely too
large — at 1024×768 and 1280×800 it was *negative*, meaning the metadata line
and the kicker were being drawn inside the navigation bar. See §4.

The cause of the variance was that the block was centred in a 100vh row, so
the band above it was a function of how tall the translated copy happened to
be: French at 1920 produced 138 px, English at 1440 produced 42 px, from the
same design. Anchoring the block to the top of the row makes the band one
value per viewport in all three languages — the column of numbers above is now
constant left to right — and moves the leftover height below the type, where
the stage's glow already occupies it.

The offset is deliberately near-constant (`min(7.25rem, 14vh)`) rather than
proportional: its floor is set by the fixed bar, which is 80 px tall (89 px at
1920, where the root font size grows), so there is nothing to gain by letting
it grow with the viewport.

---

## 3. The left-side anchor

A CSS-only field, no asset, no illustration, no added text: a vertical rule on
the section's own left content margin, a 5.5rem square grid phased from that
same margin, and a radial mask that dissolves all of it well before it reaches
the type column or either seam. Three gradients on one empty `<span>`.

Verified (`diagnostics.txt` §F):

| Property | Result |
|---|---|
| Text content | 0 characters |
| `aria-hidden` | `true` |
| Focusable elements added to the section | 0 |
| `pointer-events` | `none` — a click at its centre passes through |
| `z-index` | 0 — paints under the stage glow and under the numeral |
| Below 1024px | `display: none` |
| Animation / transition | none — nothing to disable under reduced motion |

The vertical radius of the mask is short on purpose. My first attempt let the
margin rule run the full height of the section, and it read as a stray border
rather than as texture; the fix is in the CSS comment.

---

## 4. A defect I found while measuring, and fixed

The bar's **Process** link targets `#creator`. Clicking it scrolled the
section flush to offset 0, under the fixed bar. Measured by clicking the real
link, not by simulating a scroll (`diagnostics.txt` §D):

| | Section lands at | Clearance below the bar | Section copy drawn inside the bar |
|---|---|---|---|
| `Process` → `#creator`, 1024×768 | 0 | −29.2 | **2 elements** |
| `Process` → `#creator`, 1280×800 | 0 | −9.7 | **2 elements** |
| `Process` → `#creator`, 390×844 | 0.4 | −131.6 | **4 elements** |
| `Systems` → `#hardware` (control) | 96 | +161 | 0 |

`#creator` was the only bar target without `scroll-margin-block-start: 6rem`.
Featured, Hardware, Content Universe and Closing all carry it, and Featured's
CSS even states the reason: "scroll-into-view lands the section flush with the
viewport top, behind the fixed bar". Adding the same one line brings Creator
in line with its siblings. After (`§E`): 1024×768 lands at 96 with 124.5 px of
clearance and **0** elements behind the bar; 1280×800 and 1440×900 likewise.

`scroll-margin` changes only where a scroll comes to rest. It changes no
layout, which is why this was safe to fix inside a composition-only pass.

---

## 5. What I did not change, and why

- **The dark-theme kicker contrast.** "THE CREATOR" measures **3.65:1** in the
  dark theme against a 4.5:1 requirement. This is `--color-accent-secondary`
  (`#7c4fd6`), a global token used by the kickers in Hardware and Content
  Universe too. This brief forbids changing global tokens, and overriding it in
  Creator alone would break the system's consistency for a problem that is not
  Creator's. It is **unchanged by this pass** — the worst contrast ratio over
  all 72 combinations is identical before and after (0.811 of requirement) —
  and it was already raised in fix-v9, where the measured recommendation was
  `#8f5bf6` at 4.62:1. It still needs a design decision.
- **The stage's own geometry, glow, mask, guide and corner marks.** Untouched.
- **The right edge of the text column.** See §2.1 — it was not the problem.
- **Mobile layout.** Measured identical: text column left edge, section height
  and body line-height are the same before and after at 320×568, 360×800,
  390×844, 414×896, 844×390, 768×1024 and 820×1180, in all three languages
  (`diagnostics.txt` §C). The only mobile pixel difference is the body copy's
  colour, which is the defect §2.3 asked to fix and is layout-neutral.

---

## 6. Consequence I want to flag

At **1024×768** — and at 1280×800 in English only — the section is now taller
than the viewport: 768 → 836.3 px (English), 768 → 809.6 px (French/Spanish),
and 800 → 830.5 px at 1280×800 English. Every other viewport is unchanged.

This is unavoidable arithmetic rather than an oversight. At 1024×768 the copy
block is ~697 px tall, the fixed bar occupies the top 80 px, and the canvas
needs its bottom padding — that does not fit in 768 px. Previously it "fit"
only because the top of the copy was hidden behind the navigation. The trade
is that the final platforms line now sits just below the fold at that size and
is reached by scrolling a few pixels, instead of the metadata line being
printed on top of the navigation. Screenshot `04b` shows it.

**Residual, and a recommendation rather than a change:** on mobile the bar is
197 px tall but every section on the site uses the same 6rem (96 px) of
scroll-margin, so an anchor jump still leaves copy under the bar. Creator
improved from −131.6 to −35.6 px of clearance, and Hardware — the best case on
the site — sits at +4.5 px. This is a site-wide characteristic, not a Creator
one; fixing it in Creator alone would make Creator inconsistent with its five
siblings. It should be raised to roughly 12rem for every section at once.

---

## 7. Regression evidence

**The obvious instrument does not work here, and I want to say so plainly.**
Screenshot pixel diffing of the other sections reported changes of up to 31.5%
— but so did diffing the **same build against itself**: Featured 31.54%, Hero
19.42% at 320px, Hero 7.11% at 1920. These sections are scroll-driven and
pinned, so `scrollIntoViewIfNeeded` lands at a different animation progress on
every run. The noise floor swamps the signal. Both runs are kept in
`diagnostics.txt` §H and §I so the rejection can be checked.

So the regression proof is layout, not pixels. For every section other than
Creator, under `prefers-reduced-motion: reduce` — which disables Lenis and
makes every GSAP timeline skip, so the page is static — every element's box is
recorded **relative to its own section's origin**, together with colour,
background, font size, line height, opacity, display and transform.
Section-relative on purpose: Creator's height legitimately changes at two
viewports, which shifts later sections down the page, and that must not read
as a regression in their own composition.

- **Control (same build, twice): 42/42 combinations identical, 0 differing elements.** The instrument is deterministic.
- **Before vs after: 42/42 combinations identical for every element that occupies space, 0 differing elements.**

7 viewports × 3 languages × 2 themes, over `#hero`, `#featured`, `#hardware`,
`#content-universe`, `#closing` and `footer`.

The unfiltered run flags 104 zero-area elements (SVG `<defs>`/`<stop>`,
`display: contents` wrappers, `display: none` templates) at the eight
combinations where Creator's height changed. Those elements have no laid-out
box, so `getBoundingClientRect()` returns the viewport origin instead of a
position, and section-relative normalising turns "the section rests at a
different scroll offset" into a false delta. Both the unfiltered and the
filtered runs are in `diagnostics.txt` §J and §K.

**Other invariants, all 72 combinations:** horizontal page overflow is 0 before
and after. No clipped text. 0 unparsed colours across the contrast sweep.
Under reduced motion the Creator section shows 0 inline styles and 0 residual
`clip-path`. At 200% zoom (720×450 CSS px) page overflow is 0 and the anchor
correctly drops out with the rest of the desktop layout.

---

## 8. Validation

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:run` | PASS — 32/32 |
| `npm run build` | PASS |
| `npm run test:e2e` | PASS — 54/54 |
| `git diff --check` | PASS (exit 0) |

`git status` after this pass lists exactly two modified files,
`src/sections/creator/Creator.module.css` and
`src/sections/creator/Creator.tsx`. All eleven prior `Claude report/fix-v*`
folders are intact.

To produce the before/after comparison I built the pre-change version to a
scratch directory. The two Creator files were copied out first and restored
byte-for-byte afterwards (12 711 and 7 502 bytes, verified); no git command
that alters the worktree or history was used at any point.

---

## 9. Screenshots

Every pair is the same viewport, language and theme, with the section scrolled
flush to the top of the viewport so the navigation is in shot and the band
below it is directly comparable. `a` is before, `b` is after.

| Pair | Viewport | Shows |
|---|---|---|
| 01 | 1440×900 EN dark | the primary desktop case |
| 02 | 1536×1024 EN dark | the worst "empty band above the label" case |
| 03 | 1920×1080 EN dark | widest desktop |
| 04 | 1024×768 EN dark | the nav collision fixed, and the §6 consequence |
| 05 | 1440×900 FR dark | French — the language that drifted most |
| 06 | 1440×900 EN light | light theme |
| 07 | 1280×800 ES dark | Spanish, second collision case |
| 08 | 768×1024 EN dark | tablet — desktop rules do not apply, unchanged |
| 09–11 | 390×844 and 320×568 | mobile — layout unchanged, body colour only |
