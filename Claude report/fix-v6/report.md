# CarterPCs fix-v6

## Objective

Add persistent Dark, Light, and System theme controls and a language menu with English, French, and Spanish choices and flags.

## Implementation

- `PreferencesProvider` persists language/theme preferences in local storage, updates `html[lang]`, and follows OS preference in System mode.
- The navigation has keyboard-accessible theme and language menus.
- Shared interface copy includes French and Spanish translations; the page language and navigation labels update immediately.
- Light-mode token and Hero environment overrides preserve contrast without disturbing the desktop geometry.

## Validation

- typecheck: PASS
- lint: PASS
- unit tests: PASS, 11/11
- git diff --check: PASS (line-ending warnings only)

## Git

No commit, push, sync, reset, clean, or unrelated revert. Pre-existing dirty worktree preserved.

## Remaining work

The language framework and primary visible interface are translated. Remaining long-form editorial copy that has no matching dictionary entry remains English and needs a dedicated localization pass before the whole site can be considered fully translated.

## Verdict

NOT READY - full-site translation remains incomplete.
