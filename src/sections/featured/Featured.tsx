import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { featuredStories } from '../../data/featured'
import styles from './Featured.module.css'

/**
 * Featured Content, per ARCHITECTURE.md's Section 4 spec: "showcase a small
 * set of standout content pieces as large editorial stories, not a video
 * grid." Narrative pacing steps up here on purpose — Hero (dramatic) →
 * Creator (calm editorial pause) → Featured (dynamic showcase) — expressed
 * through punchier multi-line headlines, richer color balance per panel, and
 * (desktop only) the site's first horizontal-motion sequence, not through a
 * "transition effect" bolted on for spectacle.
 *
 * Layout is CSS-first, JS-enhanced: the ≥1024px breakpoint alone switches
 * each panel from a stacked block into a full-bleed, 100vw panel inside a
 * natively horizontally-scrollable (scroll-snapped) track — a working,
 * readable sequence even if GSAP fails to load, per TECH_STACK.md §18's
 * progressive-enhancement requirement. GSAP then *enhances* that same
 * markup, on top of the CSS layout, into a pinned/scrubbed sequence — it
 * never gates visibility or structure. Reduced motion and <1024px never run
 * the pin at all, so the CSS fallback is what most of those visitors see by
 * design, not as a degraded second-class path.
 *
 * Content status: `data/featured.ts` documents in full why every headline
 * below is original editorial-development copy grounded in RESEARCH.md §3's
 * category descriptions, not a reproduced (verified or unverified) Carter
 * video title — see that file's top comment before editing panel copy.
 *
 * No approved CarterPCs media exists yet — each panel's `.panelStageSurface`
 * is the drop-in target, same contract as Hero/Creator's stage.
 *
 * Each panel's readable text (`[data-panel-content]`) fades/lifts against
 * its own measured content box, computed arithmetically each frame (no
 * second trigger, no getBoundingClientRect() calls during scroll — see the
 * comment above `contentMetrics`) — a visual-review fix for text that was
 * otherwise still legibly opaque while being clipped by the viewport edge
 * mid-translate, which read as an accidental crop rather than cinematic
 * motion.
 *
 * Two earlier versions got the *position* math wrong in different ways
 * (panel-index distance as an edge proxy, then raw offsetLeft instead of
 * the padding-adjusted glyph box). A third bug — subtler — was in *when*
 * that position math ran: it read `self.progress` from the ScrollTrigger's
 * own onUpdate, which is the raw, scroll-input-driven target progress, not
 * the eased value the scrub (see `scrub: 1` below) is still catching up to
 * on the actual rendered `rail` transform. Scrubbing intentionally makes
 * the rendered position lag the target during fast scroll input, so math
 * built on the target progress could conclude text was already safely
 * inside the viewport while the pixels on screen still showed it clipped.
 * This version instead reads the rail's actual current rendered `x` (via
 * `gsap.getProperty`) from inside the horizontal tween's own `onUpdate` —
 * which only fires when GSAP has just written that frame's real transform
 * — so the visibility math can never be ahead of what's on screen.
 *
 * Visibility is two independent, direction-specific terms (see
 * `updateCopyVisibility`), not one shared "inset from both edges" rule: a
 * panel's copy is only ever at risk from ONE edge at a time — the right
 * edge while entering, the left edge while later exiting as the next panel
 * enters — and those two edges have very different amounts of real travel
 * room given this design's own (left-anchored) content padding. Gating
 * both edges identically made the settled state itself fail the left-edge
 * check, snapping fully-arrived copy back to opacity 0. The media
 * stage/numeral are intentionally left out of this fade — they're
 * abstract background texture, not text that can look "broken," so they
 * stay visible for continuous motion.
 */
function Featured() {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top 70%',
            once: true,
          },
        })
        .fromTo(
          '[data-intro-line]',
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.8 },
        )
        .from(
          '[data-intro-reveal]',
          { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 },
          '-=0.5',
        )

      ScrollTrigger.matchMedia({
        '(min-width: 1024px)': () => {
          const track = trackRef.current
          const rail = railRef.current
          if (!track || !rail) {
            return
          }

          track.style.overflowX = 'hidden'

          const getDistance = () =>
            Math.max(rail.scrollWidth - window.innerWidth, 0)

          const contents = gsap.utils.toArray<HTMLElement>(
            '[data-panel-content]',
            rail,
          )
          const panelCount = featuredStories.length
          // A panel's copy only ever risks being clipped by ONE edge at a
          // time, and it's a different edge depending on direction — never
          // both at once, and never the edge you'd naively guess from a
          // single shared "inset from both edges" rule:
          //  - Entering (from the right): the block's *trailing* (right)
          //    edge is the last part still off-screen, so copyRight vs. the
          //    right edge is the only real constraint. Its own left inset
          //    is nowhere near the left edge this whole time (content is
          //    left-anchored inside a full-viewport panel, so copyLeft
          //    starts and stays large until long after this panel has
          //    already settled).
          //  - Exiting (to the left, as the NEXT panel enters): the
          //    block's copyLeft is what approaches the left edge.
          // A first version of this fix used one shared, symmetric
          // "inside a safe zone inset from both edges" rule for both
          // directions — which broke the *settled* state: a panel's own
          // natural left inset (its content padding, ~80px at this
          // section's desktop breakpoints — see restInsetLeft below) is
          // narrower than a viewport-ratio-based safe inset would need it
          // to be, so the shared rule stayed permanently unsatisfiable on
          // the left, snapping settled copy back to opacity 0 the instant
          // it finished entering (caught by scanning real rendered opacity
          // across the full scroll range, not just the reported bug's two
          // transitions). Splitting entry and exit into their own terms
          // fixes that without touching the already-approved exit fade's
          // actual visual behavior (still a smooth, ungated fade as this
          // panel's own copy is pushed left off-screen by the next one).
          const SAFE_INSET_RATIO = 0.06
          // Entry ramp: once safely inside from the right, opacity climbs
          // to 1 over this many px — comfortably short of a "pop," and
          // there's plenty of real travel room on this side (see
          // FIRST_VISIBLE_FRAME logs during validation: several hundred px
          // between "just became safe" and "fully settled").
          const ENTRY_FADE_TRAVEL_PX = 96
          const contentMetrics = contents.map((content) => {
            const style = window.getComputedStyle(content)
            return {
              // offsetLeft/offsetWidth describe the padded BORDER box; the
              // actual readable glyphs sit inset from that box by its own
              // padding (content is a flex child that stretches full-width
              // with no margin, so offsetLeft alone is ~0 — the real inset
              // comes entirely from padding). An earlier version used
              // offsetLeft/offsetWidth directly, which measured the
              // transparent padding as if it were "safe," so the fade only
              // fully engaged once the *box* neared the edge — by then the
              // text inside it, inset ~80px further in, had already been
              // clipped for a while. Measured once up front (a layout
              // read, but layout doesn't change during scroll — only
              // transforms do) so the per-frame math below needs no
              // getBoundingClientRect() calls, which would otherwise
              // interleave layout reads with the gsap.set writes below and
              // thrash layout every scroll frame.
              textLeft: content.offsetLeft + parseFloat(style.paddingLeft),
              textRight:
                content.offsetLeft +
                content.offsetWidth -
                parseFloat(style.paddingRight),
            }
          })
          // Exit ramp: sized as a fraction of the panel's own measured
          // rest-state left inset (rather than a fixed px constant) so it
          // always finishes comfortably before copyLeft reaches that rest
          // value — guaranteeing settled copy reaches exactly opacity 1 —
          // while still fading smoothly, well before the true left edge,
          // as this panel is pushed off-screen by the next one entering.
          const restInsetLeft = Math.min(
            ...contentMetrics.map((m) => m.textLeft),
          )
          const EXIT_FADE_TRAVEL_PX = restInsetLeft * 0.6

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: track,
              start: 'top top',
              end: () => `+=${getDistance() * 0.82}`,
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const idx = Math.round(self.progress * (panelCount - 1))
                setActiveIndex((prev) => (prev === idx ? prev : idx))
              },
            },
          })

          // Fade + lift each panel's readable text against the rail's
          // ACTUAL rendered position, not the ScrollTrigger's raw target
          // progress — this callback lives on the horizontal tween itself,
          // so it only runs once GSAP has written that frame's real `x`
          // (see the top-of-file comment for why that distinction matters
          // once scrub smoothing is in play).
          const updateCopyVisibility = () => {
            const railX = (gsap.getProperty(rail, 'x') as number) || 0
            const viewportWidth = window.innerWidth
            const safeRight = viewportWidth * (1 - SAFE_INSET_RATIO)

            contents.forEach((content, i) => {
              const { textLeft, textRight } = contentMetrics[i]
              const panelOffset = i * viewportWidth + railX
              const copyLeft = panelOffset + textLeft
              const copyRight = panelOffset + textRight

              // Entry: hard 0 until the block's trailing (right) edge is
              // inside the conservative safe zone — never a partial value
              // while still outside it, so a still-entering block can
              // never read as "already fading in." Then a short ramp to 1.
              const rightMargin = safeRight - copyRight
              const entryFocus =
                rightMargin < 0
                  ? 0
                  : gsap.utils.clamp(0, 1, rightMargin / ENTRY_FADE_TRAVEL_PX)

              // Exit: smooth (ungated) fade as copyLeft approaches the true
              // left edge — the already-approved "may fade before fully
              // leaving the viewport" behavior, just sized so it's still 1
              // at this panel's own settled position.
              const exitFocus = gsap.utils.clamp(
                0,
                1,
                copyLeft / EXIT_FADE_TRAVEL_PX,
              )

              const focus = Math.min(entryFocus, exitFocus)

              gsap.set(content, {
                opacity: focus,
                y: (1 - focus) * 20,
              })
            })
          }

          tl.to(
            rail,
            {
              x: () => -getDistance(),
              ease: 'none',
              onUpdate: updateCopyVisibility,
            },
            0,
          )

          return () => {
            track.style.overflowX = ''
            gsap.set(contents, { clearProps: 'opacity,transform' })
          }
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="featured" className={styles.featured} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.intro}>
        <p className={styles.meta} data-intro-reveal>
          <span>03 / Featured</span>
          <span className={styles.metaRule} aria-hidden="true" />
          <span>Selected editorial stories</span>
        </p>
        <h2 className={styles.title} data-intro-line>
          Selected Stories
        </h2>
      </div>

      <div className={styles.track} ref={trackRef}>
        <div className={styles.rail} ref={railRef}>
          {featuredStories.map((story) => (
            <article
              key={story.index}
              className={styles.panel}
              data-panel
              data-variant={story.variant}
            >
              <div
                className={styles.panelStage}
                aria-hidden="true"
                data-dev-placeholder="true"
              >
                <div className={styles.panelStageSurface}>
                  <span className={styles.panelGuide} aria-hidden="true" />
                  <span className={styles.panelCorner} aria-hidden="true" />
                  <span className={styles.panelCornerEnd} aria-hidden="true" />
                </div>
                <span className={styles.panelNumeral} aria-hidden="true">
                  {story.index}
                </span>
              </div>

              <div className={styles.panelContent} data-panel-content>
                <p className={styles.panelIndex}>
                  {story.index} — {story.category}
                </p>
                <h3 className={styles.panelHeadline}>
                  {story.headlineLines.map((line) => (
                    <span key={line} className={styles.panelLine}>
                      {line}
                    </span>
                  ))}
                </h3>
                <p className={styles.panelSupport}>{story.support}</p>
                <p className={styles.panelTags}>{story.tags.join(' — ')}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.progress} aria-hidden="true">
          {featuredStories.map((story, i) => (
            <span
              key={story.index}
              className={
                i === activeIndex
                  ? `${styles.tick} ${styles.tickActive}`
                  : styles.tick
              }
            />
          ))}
        </div>
      </div>

      {/* Featured → Hardware transition: same minimal hairline-seam motif
          used at every prior section boundary, picked up by Hardware's
          matching top seam (see Hardware.module.css's .seam). Purely
          additive — nothing else in the approved Featured composition
          changes. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default Featured
