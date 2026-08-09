import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  gsap,
  ScrollTrigger,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import { getContentCategories } from '../../data/contentUniverse'
import styles from './ContentUniverse.module.css'

/**
 * Content Universe, per ARCHITECTURE.md's Section 6 spec: "an archive/
 * overview of the breadth of CarterPCs' content categories." Where Featured
 * (03) is three curated stories and Hardware (04) is one dominant physical
 * object, this section is six typographic territories coexisting in one
 * shared editorial field. See data/contentUniverse.ts for category sourcing.
 *
 * VISUAL SYSTEM (post-refinement — the first shipped pass failed review for
 * reading as scattered labels around a faint background numeral):
 *
 * 1. The environmental "05" is no longer one distant backdrop glyph behind
 *    the whole section. It's split into two digits that live INSIDE the
 *    pinned field: the "0" anchors the Hardware territory (upper left), the
 *    "5" anchors Mobile Tech (lower right) — so the two dominant categories
 *    each visibly inhabit a digit of the section number, and the diagonal
 *    between the digits IS the composition's main axis. Entries and media
 *    genuinely occlude the digits (real z-order, not transparency tricks),
 *    and both digits move during the pin, so the numeral participates in
 *    every compositional state instead of sitting inert behind them.
 *
 * 2. The connecting thread is one continuous path (single <path>, drawn
 *    progressively) that travels the field in category order — entering at
 *    Tech News, sweeping under Hardware's baseline, down past Scam Tech,
 *    across Community, up through Mobile Tech's headline, exiting through
 *    Emerging Tech. It sits BETWEEN the digits (below) and the entries/
 *    media (above), so media crops visibly interrupt it — the occlusion is
 *    what makes it read as a path traveling through one space rather than
 *    decorative line fragments. Anchor coordinates are tuned against the
 *    real rendered grid (measured, not guessed).
 *
 * 3. Media windows are no longer letterbox rectangles in document flow.
 *    Each tier-1 entry carries one absolutely-positioned crop that OVERLAPS
 *    its own typography and crosses into neighboring grid regions:
 *    Hardware's is a wide crop with a hard diagonal-cut corner extending
 *    right into the field's former dead center (across the "0"); Mobile
 *    Tech's is a vertical 9:16-proportioned crop — the native shape of the
 *    short-form content the site documents — slipping behind the headline
 *    and across the "5". Different silhouettes on purpose: identical
 *    windows read as a grid. Internally each carries one oversized blurred
 *    light source + directional gradient so they read as deliberately
 *    obscured future footage, not empty placeholders. Still dev-only
 *    (data-dev-placeholder) — real approved media drops into
 *    .mediaSurface without structural change.
 *
 * MOTION (three compositional states, one pinned timeline):
 *  - State A (entry): the full field — breadth, hierarchy, thread partially
 *    drawn, both digits framing the diagonal.
 *  - A→B: the composition's center of gravity travels down-right: Hardware
 *    recedes and slides left as its crop narrows, Mobile Tech advances
 *    toward center as its crop opens taller, the "5" slides toward center
 *    while the "0" retreats, tier-2/3 territories re-space around the new
 *    dominant, and the thread draws further. Real x/y/clip recomposition,
 *    not opacity-only emphasis.
 *  - B→C: everything resolves into a third, more evenly-weighted
 *    constellation (not a rewind to A — settled offsets differ from both
 *    prior states), the thread completes end-to-end, and the closing index
 *    line below the field restates the six territories as one list.
 *  All six categories stay mounted and legible throughout — never a
 *  slideshow. Coordinated per-territory groups (one tween per article via
 *  data-cat), one timeline, one ScrollTrigger.
 */
function ContentUniverse() {
  const reducedMotion = useReducedMotion()
  const { t, language } = usePreferences()
  const rootRef = useRef<HTMLElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)

  // Only the copy changes with language — `id` (the pin's `[data-cat]`
  // selector) and `tier` (which row an entry lands in) are language-
  // independent, so the choreography below addresses the same six elements
  // in the same three rows in every language.
  const categories = useMemo(() => getContentCategories(language), [language])
  const dominant = categories.filter((c) => c.tier === 1)
  const secondary = categories.filter((c) => c.tier === 2)
  const tertiary = categories.filter((c) => c.tier === 3)

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      // getTotalLength() isn't implemented in every SVG environment (jsdom's
      // test DOM, most notably) — guarded so the draw-on-scroll effect is
      // simply skipped rather than throwing and aborting the whole
      // timeline/context setup below.
      const threadEl =
        rootRef.current?.querySelector<SVGPathElement>('[data-thread-path]') ??
        null
      const threadPath =
        threadEl && typeof threadEl.getTotalLength === 'function'
          ? threadEl
          : null
      const threadLength = threadPath ? threadPath.getTotalLength() : 0
      if (threadPath) {
        gsap.set(threadPath, {
          strokeDasharray: threadLength,
          strokeDashoffset: threadLength,
        })
      }

      // Resolved once, inside the context, so the onComplete below acts on
      // the same scoped elements (see Creator.tsx for the same note).
      const headlineLines = gsap.utils.toArray<HTMLElement>(
        '[data-headline-line]',
      )

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 75%',
            once: true,
          },
        })
        .fromTo(
          headlineLines,
          { clipPath: HEADLINE_WIPE_FROM },
          {
            clipPath: HEADLINE_WIPE_TO,
            duration: 0.9,
            // See HEADLINE_WIPE_* — no live cropping rectangle at rest.
            onComplete: () =>
              gsap.set(headlineLines, { clearProps: 'clipPath' }),
          },
        )
        .from(
          '[data-reveal]',
          { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 },
          '-=0.6',
        )
        // Opacity ONLY — the pin below owns x/y/scale on these same
        // elements, and the entrance is realtime while the pin is
        // scroll-scrubbed. Sharing a property between the two means an
        // anchor jump to #content-universe lets whichever writes last win
        // (the entrance finishing ~2s after the jump was silently undoing
        // the pin's y/opacity mid-choreography). Disjoint property sets
        // make the race structurally impossible.
        .from(
          '[data-field-reveal]',
          { opacity: 0, duration: 0.8, stagger: 0.09 },
          '-=0.55',
        )

      // Recomposition pin — desktop only, triggered on the field itself so
      // its frozen crop holds all six territories and both digits at once
      // (see the earlier session's measured fix for why the trigger is the
      // field, not the section). Two phases = three compositional states.
      ScrollTrigger.matchMedia({
        '(min-width: 1024px)': () => {
          // The thread draw has exactly ONE writer: a single scrubbed tween
          // whose scroll range spans the field's approach AND the entire
          // pin (0.95vh approach + 1.1vh pin). Splitting it into an
          // approach tween + pin-timeline tweens left two scrub tweens
          // whose ~1s smoothing windows overlap on fast jumps — they raced
          // on strokeDashoffset and the loser's value stuck (found by
          // probing computed dash values, which showed State A's offset
          // persisting deep into the pin). One tween, one property owner,
          // no race in either scroll direction.
          if (threadPath) {
            gsap.fromTo(
              threadPath,
              { strokeDashoffset: threadLength },
              {
                strokeDashoffset: 0,
                ease: 'none',
                scrollTrigger: {
                  trigger: fieldRef.current,
                  start: 'top 95%',
                  end: () => `+=${Math.round(window.innerHeight * 2.05)}`,
                  scrub: 1,
                  invalidateOnRefresh: true,
                },
              },
            )
          }

          const pin = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: fieldRef.current,
              start: 'top top',
              end: () => `+=${Math.round(window.innerHeight * 1.1)}`,
              scrub: 1,
              pin: true,
              // The field's parent (.canvas) is a flex container, and
              // ScrollTrigger defaults pinSpacing OFF for flex parents —
              // which silently removed the pin's scroll distance from the
              // document (max scroll landed at the pin's start, so the
              // choreography could never play past ~6%). Found by probing
              // window.scrollY clamping, not by eyeballing frames.
              pinSpacing: true,
              invalidateOnRefresh: true,
            },
          })

          // ---- Phase 1 (0 → 0.45): State A → State B ----
          // Center of gravity travels down-right toward Mobile Tech.
          // Purely spatial (x/y/scale/clip) — never opacity, which the
          // entrance owns; see the entrance timeline's comment.
          pin
            .to(
              '[data-cat="hardware"]',
              { x: -48, y: -14, scale: 0.88, duration: 0.45 },
              0,
            )
            .to(
              '[data-media="hardware"]',
              {
                clipPath:
                  'polygon(0% 0%, 58% 0%, 72% 28%, 72% 100%, 12% 100%, 0% 80%)',
                duration: 0.45,
              },
              0,
            )
            .to(
              '[data-cat="mobile"]',
              { x: -110, y: -54, scale: 1.1, duration: 0.45 },
              0,
            )
            // Crop "opens" via clip only — no media-own scale on top of the
            // entry scale; the compound made the crop swallow the thread
            // and the "5" at State B.
            .to(
              '[data-media="mobile"]',
              {
                clipPath: 'polygon(6% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 6%)',
                duration: 0.45,
              },
              0,
            )
            .to('[data-cat="tech-news"]', { x: -34, y: 38, duration: 0.45 }, 0)
            .to('[data-cat="scam-tech"]', { x: 56, y: -10, duration: 0.45 }, 0)
            .to(
              '[data-cat="emerging-tech"]',
              { x: -52, scale: 1.16, duration: 0.45 },
              0,
            )
            .to(
              '[data-cat="community"]',
              { x: 38, y: -16, scale: 1.12, duration: 0.45 },
              0,
            )
            .to('[data-digit="0"]', { x: -70, y: -46, duration: 0.45 }, 0)
            .to(
              '[data-digit="5"]',
              { x: -150, y: -40, scale: 1.05, duration: 0.45 },
              0,
            )

          // ---- Phase 2 (0.55 → 1): State B → State C ----
          // Settle into a third, more even constellation — offsets are
          // deliberately NOT a rewind to State A.
          pin
            .to(
              '[data-cat="hardware"]',
              { x: -12, y: 0, scale: 0.97, duration: 0.45 },
              0.55,
            )
            .to(
              '[data-media="hardware"]',
              {
                clipPath:
                  'polygon(0% 0%, 76% 0%, 94% 28%, 94% 100%, 4% 100%, 0% 88%)',
                duration: 0.45,
              },
              0.55,
            )
            .to(
              '[data-cat="mobile"]',
              { x: -28, y: -12, scale: 1.02, duration: 0.45 },
              0.55,
            )
            .to(
              '[data-media="mobile"]',
              {
                clipPath:
                  'polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 12%)',
                duration: 0.45,
              },
              0.55,
            )
            .to('[data-cat="tech-news"]', { x: 0, y: 12, duration: 0.45 }, 0.55)
            .to('[data-cat="scam-tech"]', { x: 16, y: 0, duration: 0.45 }, 0.55)
            .to(
              '[data-cat="emerging-tech"]',
              { x: -16, scale: 1.06, duration: 0.45 },
              0.55,
            )
            .to(
              '[data-cat="community"]',
              { x: 10, y: 0, scale: 1.04, duration: 0.45 },
              0.55,
            )
            .to('[data-digit="0"]', { x: -28, y: -18, duration: 0.45 }, 0.55)
            .to(
              '[data-digit="5"]',
              { x: -60, y: -14, scale: 1.02, duration: 0.45 },
              0.55,
            )
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      id="content-universe"
      className={styles.contentUniverse}
      ref={rootRef}
    >
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.canvas}>
        <div className={styles.intro}>
          <p className={styles.meta} data-reveal>
            <span>{t.contentUniverse.metaLabel}</span>
            <span className={styles.metaRule} aria-hidden="true" />
            <span>{t.contentUniverse.metaNote}</span>
          </p>
          <p className={styles.kicker} data-reveal>
            {t.contentUniverse.kicker}
          </p>
          <h2 className={styles.headline} data-headline-line>
            {t.contentUniverse.headline}
          </h2>
          <p className={styles.support} data-reveal>
            {t.contentUniverse.support}
          </p>
        </div>

        <div className={styles.field} ref={fieldRef}>
          {/* Environmental "05", split into two digits anchoring the two
              dominant territories — the composition's main diagonal runs
              digit to digit. Both move during the pin. Decorative. */}
          <span className={styles.digitZero} aria-hidden="true" data-digit="0">
            0
          </span>
          <span className={styles.digitFive} aria-hidden="true" data-digit="5">
            5
          </span>

          {/* Always-on connective tissue below desktop, where the field is
              a vertical stack — the desktop thread takes over at 1024px. */}
          <span className={styles.spine} aria-hidden="true" />

          {/* Connecting thread — ONE continuous path traveling the field in
              category order (Tech News → Hardware → Scam Tech → Community →
              Mobile Tech → Emerging Tech), layered between the digits and
              the entries so media crops genuinely occlude it. Coordinates
              are tuned against the real rendered 1440×900 grid. Reduced
              motion: the JS above never runs, so it renders fully drawn. */}
          <svg
            className={styles.thread}
            aria-hidden="true"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="content-universe-thread-gradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="var(--color-accent-primary)" />
                <stop offset="55%" stopColor="var(--color-accent-primary)" />
                <stop offset="100%" stopColor="var(--color-accent-secondary)" />
              </linearGradient>
            </defs>
            <path
              data-thread-path
              className={styles.threadPath}
              d="M 985,160
                 C 900,190 700,175 560,185
                 C 380,197 150,205 70,260
                 C 20,310 15,390 25,470
                 C 35,580 60,760 140,880
                 C 200,955 260,985 340,990
                 C 480,998 560,900 640,820
                 C 700,760 720,700 760,640
                 C 820,555 900,420 945,300"
            />
          </svg>

          <div className={styles.tierRow} data-row="dominant">
            {dominant.map((category) => (
              <article
                key={category.id}
                className={styles.entry}
                data-tier="1"
                data-cat={category.id}
                data-field-reveal
              >
                {category.media && (
                  <div
                    className={styles.entryMedia}
                    aria-hidden="true"
                    data-dev-placeholder="true"
                    data-media={category.id}
                  >
                    <span className={styles.mediaSurface} />
                    <span className={styles.mediaGlow} />
                  </div>
                )}
                <h3 className={styles.entryName} aria-label={category.fullName}>
                  {category.primary.map((line, lineIndex) => (
                    <span
                      key={`${category.id}-${lineIndex}`}
                      className={styles.entryLine}
                      aria-hidden="true"
                    >
                      {line}
                    </span>
                  ))}
                </h3>
                <p className={styles.entrySecondary}>{category.secondary}</p>
                <p className={styles.entryDescription}>
                  {category.description}
                </p>
              </article>
            ))}
          </div>

          <div className={styles.tierRow} data-row="secondary">
            {secondary.map((category) => (
              <article
                key={category.id}
                className={styles.entry}
                data-tier="2"
                data-cat={category.id}
                data-field-reveal
              >
                <h3 className={styles.entryName} aria-label={category.fullName}>
                  {category.primary.map((line, lineIndex) => (
                    <span
                      key={`${category.id}-${lineIndex}`}
                      className={styles.entryLine}
                      aria-hidden="true"
                    >
                      {line}
                    </span>
                  ))}
                </h3>
                <p className={styles.entrySecondary}>{category.secondary}</p>
              </article>
            ))}
          </div>

          <div className={styles.tierRow} data-row="tertiary">
            {tertiary.map((category) => (
              <article
                key={category.id}
                className={styles.entry}
                data-tier="3"
                data-cat={category.id}
                data-field-reveal
              >
                <h3 className={styles.entryName} aria-label={category.fullName}>
                  {category.primary.map((line, lineIndex) => (
                    <span
                      key={`${category.id}-${lineIndex}`}
                      className={styles.entryLine}
                      aria-hidden="true"
                    >
                      {line}
                    </span>
                  ))}
                </h3>
                <p className={styles.entrySecondary}>{category.secondary}</p>
              </article>
            ))}
          </div>
        </div>

        <p className={styles.index} data-reveal>
          {categories.map((c) => c.primary.join(' ')).join(' — ')}
        </p>
      </div>

      {/* Hardware → Content Universe transition: same hairline motif used
          at every prior section boundary, picked up by Hardware's matching
          bottom seam. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default ContentUniverse
