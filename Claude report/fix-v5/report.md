# CarterPCs fix-v5

## Objective

Add the thin divider separating the 03–05 Hero cards from the Featured-In strip, matching the supplied reference.

## Implementation

Desktop-only `.strip` now has a 1px low-contrast top border, 1.5rem below the cards and 1.75rem above the mark row. No card, text, asset, or mobile layout changed.

## Verification

At 1536x1024, tile bottom is y=913, divider begins at y=937, and its width is 1312.5px. No browser console errors or horizontal overflow. Typecheck, lint, and 11/11 unit tests passed.

## Files changed

- `src/sections/hero/Hero.module.css`
- `Claude report/fix-v5/*`

## Git

Existing dirty worktree preserved. No commit or push.

## Verdict

READY FOR REVIEW
