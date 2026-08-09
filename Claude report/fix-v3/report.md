# CarterPCs fix-v3

## Objective

Match the supplied desktop reference's right-side navigation controls and replace the Featured-In Apple glyph with the supplied Apple logo in white.

## Implementation

- Desktop navigation only: About Carter is now a 143.4x44px rounded rectangle; the theme utility is 42x42px. Their 1536px positions are x=1278.6 and x=1442 respectively, matching the reference layout without changing the compact mobile controls.
- Added `src/assets/hero/apple-logo.svg`, using the original SVG linked by the supplied download page. The supplied download itself was HTML rather than SVG.
- The Hero imports that local asset and renders it as decorative media in the existing aria-hidden Featured-In strip. CSS applies `brightness(0) invert(1)` to display it white.

## Visual results

| Viewport | Result |
| --- | --- |
| 1536x1024 | PASS - reference button geometry and white Apple mark |
| 2048x1015 | PASS - root-rem scaling preserves the control proportions |
| 390x844 | PASS - original compact mobile layout retained |

No browser console errors or horizontal overflow were found in the three captures.

## Files changed by this task

- `src/components/navigation/Nav.module.css` - desktop navigation control geometry.
- `src/sections/hero/Hero.tsx` - local Apple asset import and decorative image markup.
- `src/sections/hero/Hero.module.css` - white rendering for the supplied SVG.
- `src/assets/hero/apple-logo.svg` - supplied Apple logo source.
- `Claude report/fix-v3/*` - artifacts and report.

## Validation

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run test:run`: PASS, 11/11
- `npm run build`: PASS, JS gzip 121.08 kB
- `npm run test:e2e`: PASS, 16/16
- `git diff --check`: PASS (line-ending warnings only)
- `npm run format:check`: blocked only by pre-existing `Claude report/fix-v1/report.md` and `Claude report/fix-v2/report.md`; task source files pass.

## Git state

The repository was already dirty before this task. No commit, push, sync, reset, clean, or unrelated revert was performed.

## Artifact index

`before.png`, `after.png`, `compare.png`, `desktop-1.png`, `mobile-1.png`, `fullpage-1.png`, `frame-1.png`, `frame-2.png`, `video.webm`, `diagnostics.txt`, `report.md`, `fix-v3.pdf`.

## Verdict

READY FOR REVIEW
