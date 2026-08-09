# CarterPCs fix-v11 — Footer

## Summary

The site's last row, attached after the Closing section. Nine links: the bar's
six destinations and the three supplied social profiles, nothing else.
Translated through the existing typed dictionary in all three languages,
token-only so dark, light and system follow the palette, and measured across
12 viewports × 3 languages × 2 themes — 72 combinations, all clean.

Nothing above it moved: **all 30 before/after section captures are 0 changed
pixels**, and the Closing section's own 72-combination sweep is unchanged.
Its two source files are untouched in git; the only edit needed to attach the
footer was one line in `App.tsx`.

One thing to decide, flagged below rather than silently resolved: **the
sentence "Independent creative concept." now appears twice**, once in the
Closing statement and again in the footer, because both blocks of copy were
specified that way.

## What was built

| Element      | Content                                                                |
| ------------ | ---------------------------------------------------------------------- |
| Destinations | Work · Systems · Process · Impact · Content · Universe (the bar's six) |
| Platforms    | YouTube · Instagram · TikTok ↗                                         |
| Ownership    | © 2026 CarterPCs Portfolio Concept                                     |
| Disclaimer   | Independent creative concept. / No affiliation or endorsement implied. |

Files added: `src/components/footer/Footer.tsx`,
`src/components/footer/Footer.module.css`,
`src/components/navigation/sections.ts`.

### Composition

One hairline divider — the same motif every section boundary uses — then two
compact rows on the shared 96rem canvas: destinations and platforms on the
first, ownership and disclaimer on the second. Below 640px the four groups
stack in source order, which is already the reading order.

It is quieter than the Closing section by measurement, not by intention:

|              | Footer                 | Closing             |
| ------------ | ---------------------- | ------------------- |
| Height       | 150–274px              | 495–734px           |
| Largest type | 13px                   | up to 98px          |
| Ink          | muted token throughout | display white/black |

### Why the section list moved to its own file

The footer needed the same six hrefs the bar uses, and they were a private
const inside `Nav.tsx`. Copying them would have created two lists that drift
the moment a real Process or Impact section lands. They now live in
`components/navigation/sections.ts`, imported by both — the labels already came
from one place (`nav.sections`, in the same order), so this puts the targets on
the same footing. `Nav.tsx` changes by an import and a rename; its markup and
behaviour are identical.

### Social links

Exactly the three destinations supplied, written as literals so there is no
indirection between the source and what ships:

| Platform  | Destination                                   |
| --------- | --------------------------------------------- |
| YouTube   | `https://www.youtube.com/@actuallycarterpcs`  |
| Instagram | `https://www.instagram.com/carterpcs_/?hl=en` |
| TikTok    | `https://www.tiktok.com/@carterpcs?lang=en`   |

Each carries `target="_blank"` and `rel="noreferrer"` — verified on the
rendered DOM in all 72 combinations, not just asserted in the source.

They are **typographic labels rather than brand marks**. The site bundles no
third-party logo files anywhere — the Hero's Featured-In strip recreates its
wordmarks with type for the same reason — and a text label is its own
accessible name, so this was the option that matched the existing system.

The accessible name appends the new-tab warning **after** the platform name —
`YouTube — opens in a new tab`, translated per language — so the visible label
still starts the accessible name (WCAG 2.5.3 Label in Name) instead of being
replaced by it.

### No animation, on purpose

Every section above carries a one-shot scroll reveal. The footer has none: an
entrance here would be noise rather than choreography, and "no animation" is
also the strongest possible answer to the reduced-motion requirement — there is
nothing to disable, and nothing that can strand an element at `opacity: 0`,
which is precisely how the Closing section's back-to-top control broke in
fix-v10. Measured under `prefers-reduced-motion: reduce`: **0 elements carrying
an inline style** (nothing animated them) and 0 below full opacity.

The only transition is the links' hover colour, which the global reduced-motion
rule already collapses.

## One thing for you to decide

**"Independent creative concept." now appears twice.** The Closing section says
_Independent creative concept. / Not affiliated with CarterPCs._ and the footer
says _Independent creative concept. / No affiliation or endorsement implied._
The two blocks sit about 200px apart at desktop, and the repeated first line is
visible in screenshot `01`.

Both were specified — Closing's in the previous task, the footer's in this one —
so I built exactly what was asked rather than quietly editing one. It is worth
a decision either way. The cheapest fixes, in order of how little they touch:

1. Drop the footer's `disclaimerLineOne` and keep only "No affiliation or
   endorsement implied." — a one-line change per language, and the footer
   already carries the concept framing via the copyright.
2. Drop the Closing section's disclaimer entirely and let the footer carry it.
3. Leave it: the repetition is legible as a deliberate legal restatement.

Say which and it is a few minutes' work. Nothing else in the footer duplicates
copy from elsewhere.

## Verification

12 viewports × 3 languages × 2 themes = 72 combinations, against a production
build.

| Check                                        | Result            |
| -------------------------------------------- | ----------------- |
| Page horizontal overflow                     | 0 in all 72       |
| Ink past the canvas padding box              | 0 in all 72       |
| Link count                                   | 9 in all 72       |
| Pairwise overlap between links               | 0 in all 72       |
| External links missing `_blank`/`noreferrer` | 0 in all 72       |
| Text contrast failures (dark and light)      | 0 of 1080 samples |
| Tap targets under 24×24 (hit-tested)         | 0                 |

**Tap targets**, measured the way a finger meets them by walking
`elementFromPoint` outward from each link's centre:

| Group                | Smallest target | Samples |
| -------------------- | --------------- | ------- |
| internal destination | 32.4 × 34       | 432     |
| external profile     | 54.3 × 35       | 216     |

The labels set a 16px line box; vertical padding takes the target to 32px.
Unlike the bar's links there is no approved geometry to preserve here, so the
target is simply the right size rather than being enlarged by an overlay.

**Contrast**, worst case across 1080 samples — 0 unparsed colours, verified
before reporting (the blind spot corrected in fix-v10):

| Element          | Dark   | Light  | Needs |
| ---------------- | ------ | ------ | ----- |
| links            | 7.69:1 | 5.76:1 | 4.5   |
| external arrow   | 7.69:1 | 5.76:1 | 4.5   |
| copyright        | 7.69:1 | 5.76:1 | 4.5   |
| disclaimer lines | 7.69:1 | 5.76:1 | 4.5   |

**320px through desktop.** No overflow, no overlap, no clipping at any width.
At 320px in French and Spanish the destinations wrap onto two rows and the
platforms take their own — measured, still zero overlap. At 768px in French the
same wrap happens beside the platform row and still fits.

**Semantics.** One `contentinfo` landmark, outside `<main>` and after it in
document order. The footer's own `<nav>` carries a translated label
(`Footer` / `Pied de page` / `Pie de página`) so it is distinguishable from the
primary navigation, and the platform list carries `Social` / `Réseaux sociaux` /
`Redes sociales`. Keyboard focus lands on every link in order with the global
`:focus-visible` ring (screenshot `21`).

**Nothing invented.** Audited on the rendered footer: 9 anchors exactly, 6
internal and 3 external; hosts are exactly `www.youtube.com`,
`www.instagram.com`, `www.tiktok.com`; no `button`/`form`/`input`; no `mailto:`
or `tel:`; and the only digits in visible text are the copyright year.

## Translations

| Key                     | English                                | French                                       | Spanish                            |
| ----------------------- | -------------------------------------- | -------------------------------------------- | ---------------------------------- |
| `copyright`             | CarterPCs Portfolio Concept            | CarterPCs — Concept de portfolio             | CarterPCs — Concepto de portafolio |
| `disclaimerLineOne`     | Independent creative concept.          | Concept créatif indépendant.                 | Concepto creativo independiente.   |
| `disclaimerLineTwo`     | No affiliation or endorsement implied. | Aucune affiliation ni approbation impliquée. | No implica afiliación ni respaldo. |
| `a11y.footerNavigation` | Footer                                 | Pied de page                                 | Pie de página                      |
| `a11y.socialLinks`      | Social                                 | Réseaux sociaux                              | Redes sociales                     |
| `a11y.opensInNewTab`    | opens in a new tab                     | ouvre dans un nouvel onglet                  | se abre en una pestaña nueva       |

Two notes:

- **`copyright` holds only the name.** The "©" and the year are
  language-neutral and are composed in `Footer.tsx` from a single constant, so
  updating the year is one edit rather than three. Each language follows its own
  `meta.title` wording.
- **The platform names are not translated.** They are proper nouns; they appear
  in the component as literals, and only the new-tab suffix is localised.

## Nothing above it moved

Same captures, same pipeline, before and after — 30 section captures across
320×568 fr, 844×390 en, 768×1024 es, 1024×768 en, 1440×900 en light and
390×844 es light:

**30 of 30 are 0 changed pixels. Total changed: 0.**

The Closing section was also re-measured over its own 72 combinations and is
unchanged — no overflow, no ink outside its canvas, no residual clip-path, 0
contrast failures. Its two files do not appear in `git status`. The only change
made to attach the footer was one `<Footer />` line in `App.tsx`.

The fix-v9 site-wide sweep was re-run with the footer in place — 12 viewports ×
3 languages × 6 anchors — and still reports no page overflow, no clipped text,
and no residual clip-path anywhere.

## Files changed

| File                                      | Change                                     |
| ----------------------------------------- | ------------------------------------------ |
| `src/components/footer/Footer.tsx`        | **new** — the footer                       |
| `src/components/footer/Footer.module.css` | **new** — its styles                       |
| `src/components/navigation/sections.ts`   | **new** — the shared six destinations      |
| `src/components/navigation/Nav.tsx`       | imports the shared list instead of its own |
| `src/app/App.tsx`                         | renders `<Footer />` after `</main>`       |
| `src/i18n/en.ts`                          | `footer` block (shape source of truth)     |
| `src/i18n/fr.ts`                          | French `footer` block                      |
| `src/i18n/es.ts`                          | Spanish `footer` block                     |
| `src/app/App.test.tsx`                    | 3 new tests, 4 updated                     |
| `e2e/app.spec.ts`                         | 8 new tests, 6 updated                     |

## Tests

**Unit: 29 → 32.** The footer renders after `main` as a `contentinfo`
landmark whose six destinations match the bar's hrefs label-for-label (read
from the same shared list); exactly the three supplied social destinations with
`target`/`rel` and an accessible name that starts with the visible platform
name; and an "invents nothing" audit — 9 anchors, 6 internal, the three
expected hosts, no form controls, no `mailto:`/`tel:`, and `2026` as the only
figure.

**E2E: 46 → 54.** Per language: the footer follows `#closing`, sits outside
`main`, renders six labelled destinations and the three profiles with correct
`href`/`target`/`rel`/accessible name, and shows the copyright and both
disclaimer lines in that language. Plus a whole-footer link audit; a mobile
test at 320px and 390px in all three languages asserting no copy outside the
canvas, no overlapping links, a 24px minimum target and no overflow; light-theme
AA contrast; and the reduced-motion state.

**Ten existing tests were updated rather than worked around.** The six section
labels now appear twice on the page, so queries like
`getByRole('link', { name: /^work$/i })` became ambiguous. They are now scoped
to the primary navigation landmark, which is a stronger assertion than the bare
name was. Two DOM selectors (`nav ul a`) that would have silently swept in the
footer's row now exclude it explicitly, and the Creator section's platform-line
assertions are scoped to `#creator` because "TikTok" is now also a footer
destination. One Closing assertion is scoped to `#closing` for the duplicated
disclaimer sentence discussed above.

## Validation

| Check                  | Result                                 |
| ---------------------- | -------------------------------------- |
| `npm run typecheck`    | PASS                                   |
| `npm run lint`         | PASS                                   |
| `npm run test:run`     | PASS — 32/32 (was 29)                  |
| `npm run build`        | PASS                                   |
| `npm run test:e2e`     | PASS — 54/54 (was 46)                  |
| `git diff --check`     | PASS (exit 0; CRLF advisories only)    |
| `npm run format:check` | FAIL — 3 pre-existing files, see below |

`format:check` reports `Claude report/fix-v1/report.md`, `fix-v2/report.md` and
`fix-v3/report.md` — prior fix folders this task does not touch. Every file
created or edited this pass is prettier-clean.

One disclosure on the e2e run: the first full pass showed two failures. One was
real — a tap-target test that swept in the footer's links — and is fixed. The
other, a Hardware scroll test, timed out under parallel load and passed on its
own and on every rerun; it is a flake, not a regression, and I would rather name
it than quietly rerun until green.

## Git

No commit, push, reset, clean, or revert. `HEAD` is still `685f7b9`. No prior
`Claude report/fix-v*` folder was modified, and all pre-existing uncommitted
work is intact.

## Screenshots

`screenshots/` holds 12 captures.

- `01` — the Closing → Footer boundary at 1440×900, showing the hierarchy: loud
  statement, hairline, quiet row. Also where the duplicated disclaimer sentence
  is visible.
- `10`–`18` — the footer at 1536×1024 dark, 1440×900 light, 1024×768 fr,
  768×1024 fr (destinations wrapping), 844×390 es, 390×844 fr dark and es light,
  and 320×568 es dark and fr light.
- `20` — the reduced-motion resting state.
- `21` — the focus ring on a social link.

## Verdict

READY FOR REVIEW, with one content decision outstanding: whether the repeated
"Independent creative concept." line should stay in both places. Everything else
is complete in three languages, both themes, and from 320px up, with nothing
above the footer changed by a single pixel.
