# CarterPCs fix-v4

## Objective

Change the Hero CTA pair from pills to the reference image's rounded rectangles. Confirm the supplied white Apple logo remains in the Featured-In row.

## Implementation

Changed only `.cta` in `src/sections/hero/Hero.module.css` from `border-radius: 999px` to `border-radius: 0.75rem`. This applies consistently to Explore the Universe and Watch Reel while preserving their dimensions, gap, text, and circular arrow badge. The Apple logo added in fix-v3 is present in the first Featured-In slot.

## Results

At 1536x1024, Explore the Universe is 215.1x52px and Watch Reel is 167x51px; both have 12px corners. At 390x844, the same controls remain usable with no overflow. Browser console errors: 0. Horizontal overflow: false.

## Validation

- typecheck: PASS
- lint: PASS
- unit tests: PASS, 11/11
- build: PASS, JS gzip 121.07 kB
- E2E: PASS, 16/16
- diff check: PASS (line-ending warnings only)

## Git

The worktree was already dirty. No commit, push, sync, reset, clean, or unrelated revert was performed.

## Artifacts

`before.png`, `after.png`, `compare.png`, `mobile-1.png`, `frame-1.png`, `frame-2.png`, `video.webm`, `diagnostics.txt`, `report.md`, `fix-v4.pdf`.

## Verdict

READY FOR REVIEW
