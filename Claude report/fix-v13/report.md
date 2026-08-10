# fix-v13 — Section 02 / Creator: final visual treatment

The supplied photograph is now the section's main visual. Two files changed,
both in `src/sections/creator/`, plus the asset itself. Nothing else in the
site was touched. Nothing was committed, pushed, reset, cleaned or reverted,
and no prior report folder was modified.

---

## 1. Files changed

| File | Change |
|---|---|
| `src/assets/creator/creator-workshop-filming-setup.png` | **new** — the supplied image, copied in byte for byte |
| `src/sections/creator/Creator.tsx` | renders the photograph; replaces the placeholder stage internals; environmental numeral moved to its own layer |
| `src/sections/creator/Creator.module.css` | layout around the image; placeholder gradient, framing marks and drafting grid removed |

Net: **123 insertions, 213 deletions** across the two source files — the
treatment is smaller than what it replaced, because a real photograph does not
need the devices that were invented to make an empty box look intentional.

Untouched: Hero, Featured, Hardware, Content Universe, Closing, Footer,
navigation, `tokens.css`, `global.css`, all three dictionaries.

## 2. The asset is the file you selected, unaltered

| | |
|---|---|
| Source | `…\019fe624-…\exec-75f203ea-….png` |
| SHA-256 | `173F6E94963F1CA47E4EA9B75228AD0B21AC348D82BB5F3E2EB2791B67A94505` |
| Size | 1 536 × 1 024, 1 818 691 bytes |
| Copy in `src/assets/creator/` | **same SHA-256, same byte count** |
| Built output `dist/assets/creator-workshop-filming-setup-DrrdQ89B.png` | **same SHA-256, same byte count** |

It is not cropped, resized, re-encoded, retouched or regenerated anywhere. The
hash is identical at all three stages, so the bytes a visitor downloads are the
bytes you selected. Every framing decision is CSS around the file.

There is no text baked into the image, so nothing in the section duplicates
copy that the photograph already carries.

## 3. Layout

The photograph's own composition decided the layout: its subject — open case,
hands, phone rig, camera, tool mat — occupies the **left 80%** of the frame,
and the right 20% is dark negative space. So the image takes the section's left
panel and the type sits beside it, which is the media-left / text-right rhythm
this section already had, now driven by real media instead of a gradient.

**Desktop (≥1024px).** The plate spans the left half, vertically centred, in a
box of ratio 1229:1024. That ratio is not a taste call — with
`object-fit: cover` and `object-position: left`, a 1.20 box fed a 1.50 image
scales to the box height, so the visible slice is exactly 1.20/1.50 = the left
80% of the frame. The whole subject, nothing lost vertically, and the only
thing ever cropped is the empty right-hand margin. The trailing edge dissolves
into the section so it does not butt a hard rectangle against the type.

**Below 1024px.** The box carries the file's native 3:2, so the frame is shown
**whole — 100% of the source, zero crop — at every width from 320px up**, full
bleed, below the copy in the existing text-then-image order.

**The type column** returns to grid columns 7–12. fix-v12 had moved it one
column left to close a 438px void on the left; that void existed because the
stage was an empty gradient, and the photograph now fills it. Same
six-column measure either way, so no line break in the headline or body
changed.

## 4. Verification — 72 combinations (12 viewports × 3 languages × 2 themes)

| Check | Result |
|---|---|
| Image loaded and decoded | **72/72** |
| Subject fully visible, no crop of important content | **72/72** |
| Horizontal page overflow | **0** |
| Plate/type collisions (30 side-by-side layouts) | **0** — minimum gutter 41.2px |
| Plate escaping the section box | **0** |
| Numeral drawn over the photograph | **0** |
| Source visible below 1024px | **100%**, box ratio exactly 1.500 |
| Source visible at ≥1024px | **80%** — precisely the subject region |
| Unparsed colours in the contrast sweep | **0** |

Body copy contrast is unchanged from fix-v12: 10.21:1 dark, 8.22:1 light.

**Reduced motion:** 0 inline styles, 0 residual `clip-path`, the photograph
painted at full opacity, no animation or transition of its own.
**Navigation anchor:** clicking "Process" still lands `#creator` at 96px with
**0** pieces of copy behind the fixed bar on desktop.
**Accessibility:** one image, `alt=""`, intrinsic 1536×1024 declared, 0
focusable elements added, `h2` and the metadata line unchanged, EN/FR/ES all
render their own copy against the plate.

**Validation:** `typecheck` PASS · `lint` PASS · `test:run` **32/32** ·
`build` PASS · `test:e2e` **54/54**. `git diff --check` exit 0.

### An instrument that lied, recorded here so the screenshots can be trusted

Element-level screenshots of the section came back with a **blank band where
the plate is** at 320px. It is not a site defect. A section taller than the
viewport is captured through `captureBeyondViewport`, which re-rasterises the
page and dropped the freshly decoded 1.8 MB PNG. The DOM disagreed with the
picture — `complete: true`, `naturalWidth: 1536`, `opacity: 1`, box
320×213 — so the plate was sampled through a canvas instead: luminance range
0–244, 287 orange pixels from the phone, 92 teal from the rig, identical at
every width. It paints. The report's screenshots are therefore plain viewport
captures only, and mobile is shown as two frames (type, then plate).

## 5. Decisions I made that you may want to reverse

**1. The oversized "02" moved instead of staying on the photograph.** It used
to live inside the stage, scaled up to fill it. Over an empty gradient that
worked; over the photograph it was a grey smudge across the case and the phone
rig (visible in the first render I took). It now uses the same layer model as
Hardware's "04", Content Universe's "05" and Closing's "06" — its own layer
behind the type, bottom-right, at the same 8% token opacity — so the four
numbered sections finally share one treatment. It is desktop/tablet only,
because below 1024px the stack has no spare ground and bottom-right *is* the
photograph. The metadata line still reads "02 / Creator" at every width.

**2. The drafting-grid anchor from fix-v12 is gone.** You asked for it last
task to give the empty left half structure. The photograph now occupies that
half, and the grid only surfaced as faint stray lines in the margins above and
below the plate. Say the word and I will bring it back, confined to those
margins.

**3. The gradient glow, guide line and corner marks are gone.** Those were the
placeholder's framing detail. I can reinstate the corner marks as a frame over
the photograph if you want the technical accent kept.

**4. `alt=""`, following Hero's documented convention** for editorial media
whose subject the adjacent copy already names — the body paragraph describes
builds "filmed fast, tested by hand". If you would rather it be described for
screen readers, that is a translated string in all three dictionaries and I
will add it.

**5. Weight — the one I would most like a decision on.** The page now ships a
**1.8 MB PNG**, which is larger than the entire JS bundle (382 kB) and it is
section 02, on the first scroll path, so I did not lazy-load it. You told me
not to alter the image, so I have shipped the file exactly as given and done
nothing about size. The project already has a precedent for the alternative:
Hero keeps `carter-hero-portrait.png` as the untouched source and serves a WebP
derivative. If you want that here — original preserved in the repo untouched,
a derived WebP/AVIF served — it is a small change and would cut roughly 90% of
the transfer. **I have not done it, because it would mean the visitor sees a
re-encoded file rather than the one you selected.**

## 6. One thing I noticed but did not touch

`src/assets/` has four unused, untracked PNGs from before this task —
`creator-section-composite-iphone17-pro-max-*.png`, about 6 MB together, not
imported anywhere. They predate this work, so I left them alone. They can be
deleted whenever you want.

## 7. Screenshots

Desktop frames are the section scrolled flush to the top of the viewport with
the navigation in shot. Mobile is two frames per combination: `-type` at the
top of the section, `-plate` centred on the photograph.

| Files | Covers |
|---|---|
| 01–06 | 1440×900 — EN, FR, ES × dark and light |
| 07 | 1920×1080 EN dark |
| 08 | 1024×768 EN dark |
| 09–14 | 390×844 — EN, FR, ES × dark and light |
| 15 | 320×568 EN dark |
