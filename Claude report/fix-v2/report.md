# CarterPCs final QA - fix-v2

## Executive summary

The By The Numbers labels were visually too close at desktop widths because the fixed three-column grid combined single-line labels with an 0.875rem gutter. The frozen values and labels are unchanged. The desktop-only correction uses a 1rem column gutter and reduces labels from 0.6875rem to 0.625rem with neutral tracking. At the 1536x1024 control frame, the only changed geometry is the label row.

## Root-rem audit verdict

KEEP the existing root-rem architecture. The rule remains inactive through 1536px, retains the approved control frame, and intentionally raises the root size from 16px to 17.92px at 1920x1080, 18.45px at 2048x1015, 19.63px at 2560x1080, and 21.12px at 2560x1440. The Hero-specific short-wide compression bands remain active where required. Full-page and motion checks found no horizontal overflow, clipping, console errors, or failed section transitions. No global-scaling change was warranted.

## Files changed by this task

- `src/sections/hero/Hero.module.css`: desktop stat-list gutter and label typography only.
- `Claude report/fix-v2/*`: QA artifacts and this report.

## CSS change

Before:

```css
.statLabel {
  white-space: nowrap;
}
```

After:

```css
.statsList { column-gap: 1rem; }
.statLabel {
  font-size: 0.625rem;
  letter-spacing: 0;
  white-space: nowrap;
}
```

## Visual and responsive audit

| Area | Result |
| --- | --- |
| 1536x1024 control Hero | PASS - composition preserved; stat labels separated |
| 1920x1080, 2048x1015, 2560x1080, 2560x1440 Hero | PASS - scaled composition remains contained |
| Creator | PASS - section starts after Hero; no overflow or console error |
| Featured | PASS - horizontal sequence traversed in E2E |
| Hardware | PASS - choreography and resumed normal scroll verified in E2E |
| Content Universe | PASS - all six categories remain reachable in E2E |
| 1440x900, 1024x768, 768x1024 | PASS - no horizontal overflow |
| 390x844, 320x568 | PASS - no horizontal overflow; narrow label wrapping remains readable |
| GSAP / ScrollTrigger | PASS - Intro to Hero, Hero to Creator, and later section flows verified by E2E and recorded scroll |

## Test and bundle results

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run format:check`: FAIL - pre-existing `Claude report/fix-v1/report.md` is not Prettier-formatted; not changed by this task.
- `npm run test:run`: PASS, 11/11 tests.
- `npm run build`: PASS; JS gzip 120.75 kB (<150 kB).
- `npm run test:e2e`: PASS, 16/16 tests.
- `git diff --check`: PASS (only line-ending warnings).
- Browser audit: 0 console errors and 0 horizontal-overflow findings at all audited viewports.

## Git state

The working tree was already modified and contained untracked assets/report material before this task. No commit, push, sync, reset, clean, or unrelated file revert was performed. The status remains dirty, including pre-existing edits in app, navigation, hardware, Hero, global styles, assets, and `Claude report`.

## Remaining weakness

The repository-wide format check remains blocked by the pre-existing `fix-v1/report.md` formatting violation. This task intentionally leaves that prior artifact untouched.

## Artifacts

`before.png`, `after.png`, `compare.png`, `desktop-1.png`, `desktop-2.png`, `desktop-3.png`, `fullpage-1.png`, `fullpage-2.png`, `fullpage-3.png`, `mobile-1.png`, `mobile-2.png`, `tablet-1.png`, `tablet-2.png`, `frame-1.png`, `frame-2.png`, `video.webm`, `diagnostics.txt`, `report.md`, and `fix-v2.pdf`.

NOT READY - REGRESSION REMAINS
