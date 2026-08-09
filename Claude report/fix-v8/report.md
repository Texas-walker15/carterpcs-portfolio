# CarterPCs fix-v8 — Mobile QA: preference menus and heading clipping

## Summary

Both reported defects are fixed. One of them turned out not to be what the
ticket described, and the difference matters, so it is spelled out in full
below rather than glossed: the Creator heading **was never failing to wrap**.
It wraps correctly at every width in all three languages. What was actually
broken was a leftover animation `clip-path` cropping glyph ink — a real defect,
but a different one, and its only visible manifestation in the shipped copy is
in French, not English.

## Defect 1 — Preference menus

### What was wrong

Both dropdowns were pure CSS: `.menuWrap:focus-within .menu, .menuWrap:hover
.menu { display: grid }`. Every requirement in the ticket was unreachable from
that construction:

- **Never closed after a selection.** Choosing an option left focus on the
  chosen item, which is inside the wrapper, so `:focus-within` kept matching
  and the panel stayed open indefinitely.
- **Escape did nothing.** CSS has no key handling.
- **Focus-out was the only close path**, and it fired as a side effect rather
  than as a decision — there was no state to close.
- **No `aria-expanded`, no `aria-haspopup`, no `aria-controls`.** Measured on
  the shipped build, the trigger reported `aria-expanded: (absent)`. Assistive
  tech was never told a popup existed at all, let alone whether it was open.
- **On mobile the open panel covered the site's own navigation.** Below 1024px
  the bar wraps onto two rows — identity + utilities, then the six section
  links — and the panel was anchored to its trigger on row one, so it dropped
  straight over row two. Measured: panel at `top: 109 … bottom: 229`,
  `coversNavLinks: true`, hiding Impact, Content and part of Universe.

### What changed

`openMenu` state in `Nav.tsx` now owns open/close — one menu at a time. It
closes on: selecting an option, Escape, focus leaving the wrapper, and a
pointer press outside it. Escape and outside-press listen on the document, so
they still fire when focus has drifted somewhere else entirely instead of
stranding an open panel over the page. Selecting an option and Escape both
return focus to the trigger.

Semantics: triggers carry `aria-haspopup="menu"`, live `aria-expanded`, and
`aria-controls` pointing at the panel they own. Items remain `menuitemradio`
with live `aria-checked`. Persisted theme/language behaviour is untouched —
`Preferences.tsx` was not modified.

Keyboard support is a **superset** of what the CSS version offered: Enter/Space
and Arrow Up/Down open the panel and land on an item, Arrow keys plus Home/End
move within it, Tab still walks through naturally, and Escape returns to the
trigger. The panel carries `tabIndex={-1}` because it holds the arrow-key
handler and an element with an interactive role must be focusable — it is never
a Tab stop.

Mobile placement: the panel is now anchored to the **whole bar** rather than to
its trigger, so it opens below the section links instead of over them. It stays
content-width and right-aligned to the bar's padding edge, so it covers as
little as a dropdown can. Measured after: `top: 201 … bottom: 321`,
`coversNavLinks: false`, occupying 14.2% of the viewport height.

**Desktop is provably unchanged.** The desktop panel still anchors to its
trigger at exactly the same rectangle (`top: 87, bottom: 207, left: 1348,
right: 1484`), and a pixel diff of the desktop menu-open screenshot before vs
after reports **0 changed pixels**.

## Defect 2 — Heading clipping

### What the ticket said, and what is actually true

The ticket reported the English Creator heading being "clipped instead of
wrapping" at narrow widths. Measured across 3 headings × 3 languages × 8 widths
from 300px to 430px (72 combinations, `diagnostics.txt` §2):

- Every heading **wraps correctly** at every width — 2 to 5 lines, never one
  overflowing line. Horizontal ink never exceeds the box (`cutRight` negative
  throughout), and the page never overflows horizontally.
- The **English** Creator heading showed **0 changed pixels** between the
  broken and fixed builds at all eight widths. Nothing about it was being
  clipped.

So the described symptom did not reproduce. What did reproduce is a real and
related defect, found by measuring instead of by eye.

### The actual defect

Each headline reveals with a `clip-path: inset()` wipe. Two problems:

1. `inset()` clips to the **border box**. These headings run `line-height`
   0.95–1.02 — tighter than the font's own line box — so glyph ink can sit
   outside that box. The wipe therefore cropped ink for the whole life of the
   tween.
2. **GSAP leaves the tween's final value on the element as an inline style**,
   so a finished reveal kept a live cropping rectangle for the rest of the
   session. It did not even land cleanly on zero: residual right insets of
   0.17–0.24% were measured on the shipped build.

The visible consequence in current copy is narrow but real: the **French**
Creator headline "Le matériel expliqué, sans le superflu." ends on a line
containing a descender, and the **`p` in "superflu." was being sliced flat**.
That is the one case in the shipped copy where a last line carries a descender,
and it clips at **every width tested, 300px through 430px** (36–78 changed
pixels per width). English and Spanish last lines happen to end without
descenders, which is why nothing showed there.

### What changed

`HEADLINE_WIPE_FROM` / `HEADLINE_WIPE_TO` in `src/animations/gsap.ts` give the
wipe a negative vertical bleed (`inset(-20% … -20% …)`) so it expands past the
border box and only ever clips horizontally, and each of the four sections now
clears the property in the tween's own `onComplete` so nothing survives at
rest. Both halves are needed: the bleed fixes the animation, the clear fixes
the resting state.

This is a purely visual-integrity fix — no layout, geometry, font size,
line-height or `max-width` was touched, so the approved desktop layout is
untouched by construction, and the pixel diffs confirm it (0 changed pixels on
every desktop heading crop).

It also protects future copy: any headline whose last line ends in a p, g, q, y
or j would have hit the same slice.

## Files changed

| File                                                | Change                                                        |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `src/components/navigation/Nav.tsx`                 | State-driven disclosure, ARIA, keyboard support               |
| `src/components/navigation/Nav.module.css`          | `.menuOpen`, mobile bar-anchored placement, desktop unchanged |
| `src/animations/gsap.ts`                            | Shared wipe constants + the reasoning behind them             |
| `src/sections/creator/Creator.tsx`                  | Wipe constants + `clearProps` on complete                     |
| `src/sections/featured/Featured.tsx`                | Same                                                          |
| `src/sections/hardware/Hardware.tsx`                | Same                                                          |
| `src/sections/content-universe/ContentUniverse.tsx` | Same                                                          |
| `src/app/App.test.tsx`                              | Menus opened before querying; 7 new menu-behaviour tests      |
| `e2e/app.spec.ts`                                   | Trigger is clicked not hovered; 9 new tests                   |

## Tests added

- **Unit (+7, 20 → 27).** `aria-expanded`/`aria-haspopup`/`aria-controls`;
  closes on selection with focus returned to the trigger; checked state
  survives reopening; Escape closes and restores focus without applying
  anything; focus moving outside closes; opening one menu closes the other;
  keyboard open plus Arrow/Home/End navigation and Enter to select.
- **E2E (+9, 23 → 32).** The close-on-selection / Escape / focus-loss /
  outside-press cycle run at both desktop and mobile; a mobile test asserting
  the open panel does not intersect any nav link and stays under 25% of the
  viewport; and heading tests at 320px and 390px in all three languages
  asserting no `clip-path` survives the reveal, that each heading wraps to more
  than one line, and that nothing overflows its box.

## Validation

| Check                  | Result                                         |
| ---------------------- | ---------------------------------------------- |
| `npm run typecheck`    | PASS                                           |
| `npm run lint`         | PASS                                           |
| `npm run format:check` | **FAIL — pre-existing, unrelated** (see below) |
| `npm run test:run`     | PASS — 27/27 (was 20)                          |
| `npm run build`        | PASS                                           |
| `npm run test:e2e`     | PASS — 32/32 (was 23)                          |
| `git diff --check`     | PASS (line-ending warnings only)               |

Matrix coverage, all measured in a real browser (`diagnostics.txt` §3): English,
French and Spanish × dark, light and system × 1536×1024 and 390×844 — 18
combinations, each checked at five scroll anchors. **No horizontal overflow and
no surviving clip artifact in any of them.** The system theme was exercised
with the OS preference set to light, so it resolves to something other than
dark and is genuinely tested rather than a duplicate of the dark run.

`format:check` reports three files: `Claude report/fix-v1/report.md`,
`fix-v2/report.md` and `fix-v3/report.md`. All three belong to prior fix
folders, which this task forbids overwriting. Every file this pass created or
edited is prettier-clean.

**One disclosure:** `src/styles/global.css` was previously failing
`format:check` and no longer does. A `prettier --write src` run during this work
reformatted it. The change is formatting only — the file's 63 lines of
pre-existing uncommitted content are all still present and unmodified in
substance — but it is a file this task did not otherwise need to touch, so it is
flagged rather than buried.

## Git

No commit, push, reset, clean, or revert. `HEAD` is still `275d9d9`. No prior
`Claude report/fix-v*` folder was modified. All pre-existing uncommitted work is
intact.

## Screenshots

`screenshots/` holds 84 captures.

- `before-mobile-menu-open.png` / `after-mobile-menu-open.png` — the headline
  pair: the panel moving off the section links.
- `before-desktop-menu-open.png` / `after-desktop-menu-open.png` — identical by
  pixel diff, evidencing the untouched desktop layout.
- `before-*-creator-padded.png` / `after-*-creator-padded.png` and
  `*-headcrop.png` — heading crops padded beyond the clip box so cut ink is
  visible. The French pairs are the ones that differ; the English and desktop
  pairs are identical, which is itself the finding.
- `after-{lang}-{theme}-{viewport}-{hero,creator}.png` — the full 18-combination
  language × theme × viewport matrix.

Both "before" builds are genuine builds of the pre-fix source, not simulations:
the menu comparison was built with `Nav.tsx`/`Nav.module.css` reverted, and the
heading comparison with the four section files reverted, so each pair isolates
exactly one change.

## Verdict

READY FOR REVIEW — with the note that the Creator-heading symptom as described
(clipped instead of wrapping, in English) did not reproduce. The heading wraps
correctly in every language at every width tested. A real clipping defect in the
same component was found and fixed; in current copy it is visible in French.
