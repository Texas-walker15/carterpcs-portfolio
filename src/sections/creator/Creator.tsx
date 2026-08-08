import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './Creator.module.css'

/**
 * Creator Introduction — a short editorial bridge from Hero's visual
 * statement to the site's later content sections, per ARCHITECTURE.md's
 * Section 3 spec: "editorial text block + imagery, restrained motion...
 * this section should feel like a pause, not a spectacle."
 *
 * Visual rhythm deliberately mirrors Hero rather than repeating it: Hero's
 * media stage bleeds off the right edge, this one bleeds off the left —
 * a call-and-response across the Hero→Creator scroll, not a copy-paste
 * layout. See Hero.tsx's top-of-file comment for the shared stage language
 * (near-black surface, restrained glow fields, dissolve mask, thin framing
 * lines) this section reuses on purpose for continuity.
 *
 * Copy sourcing (kept internally distinct per the task brief, even though
 * the page doesn't visually label OBSERVATION vs INTERPRETATION):
 *   OBSERVATION   — content pillars, platforms, and format description
 *                   (RESEARCH.md §3 Content Categories, §8 Observable Facts,
 *                   §1 Executive Summary platform list — names/format only,
 *                   no follower/subscriber/view counts).
 *   INTERPRETATION — tone/positioning language (RESEARCH.md §9 Brand/Creator
 *                   Identity Themes: Accessible Tech Demystifier, Honest
 *                   Consumer Advocate, Digital-Native Personality). "Built
 *                   for viewers who want the point without losing the
 *                   context" is this kind of interpretation — a paraphrase
 *                   of §2's "punchy 30-to-60 second vertical clips" /
 *                   ultra-short cadence, not a Carter quote. It replaces an
 *                   earlier draft's "not a 20-minute review" line, which a
 *                   visual/content review flagged as an unnecessary
 *                   put-down of another format; the new phrasing states
 *                   what the content is without comparing it to what it
 *                   isn't.
 * No name, age, birthplace, relocation, dates, milestones, partnerships, or
 * direct quotes are used anywhere — all excluded per the task's factual
 * safety requirement regardless of RESEARCH.md support, since none of it is
 * timeless creator-positioning content.
 *
 * No approved CarterPCs media exists yet — `.stageSurface` is the drop-in
 * target for a future portrait/studio image or video, same contract as
 * Hero's stage: dropping in real media only requires changing
 * `.stageSurface`'s background, not the surrounding structure. The oversized
 * "02" is decorative environmental texture (echoing the "02 / Creator"
 * metadata below), not a placeholder label — placeholder status is instead
 * carried only by this comment and `data-dev-placeholder`. An earlier draft
 * also had a small visible "development build" caption on the stage; it was
 * removed because it read as an unfinished box rather than intentional art
 * direction, and the numeral + framing detail now make the fallback state
 * legible as a deliberate composition on its own.
 */
function Creator() {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top 75%',
          once: true,
        },
      })

      tl.fromTo(
        '[data-headline-line]',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.9 },
      )
        .from(
          '[data-reveal-stage]',
          { opacity: 0, xPercent: -5, duration: 1.2 },
          '-=0.8',
        )
        .from(
          '[data-reveal]',
          { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 },
          '-=0.9',
        )
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="creator" className={styles.creator} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      <div className={styles.canvas}>
        <p className={styles.meta} data-reveal>
          <span>02 / Creator</span>
          <span className={styles.metaRule} aria-hidden="true" />
          <span>Creator overview</span>
        </p>

        <div className={styles.type}>
          <p className={styles.kicker} data-reveal>
            The Creator
          </p>
          <h2 className={styles.headline} data-headline-line>
            Hardware knowledge, delivered without the fluff.
          </h2>

          <div className={styles.body}>
            <p data-reveal>
              A daily short-form record of PC builds, smartphones, and everyday
              tech decisions — filmed fast, tested by hand, and built for
              viewers who want the point without losing the context.
            </p>
            <p data-reveal>
              The tone stays direct on purpose: plain-English breakdowns, a
              willingness to call out bad hardware and worse marketing, and a
              sense of humor that never strays far from the internet it grew up
              on.
            </p>
          </div>
        </div>

        <div className={styles.footer} data-reveal>
          <p className={styles.tags}>
            PC Hardware — Mobile Tech — Consumer Tech — Scam-Busting
          </p>
          <p className={styles.platforms}>
            TikTok · YouTube Shorts · Instagram Reels
          </p>
        </div>
      </div>

      {/* Development placeholder media stage — no CarterPCs assets are used.
          Ordered after .canvas in markup so mobile naturally stacks
          text-then-image (per ARCHITECTURE.md's Section 3 responsive spec)
          without needing a separate mobile-only DOM order; desktop lifts it
          out of flow with position: absolute (see Creator.module.css). */}
      <div
        className={styles.stage}
        aria-hidden="true"
        data-reveal-stage
        data-dev-placeholder="true"
      >
        <div className={styles.stageSurface}>
          <span className={styles.stageGuide} aria-hidden="true" />
          <span className={styles.stageCorner} aria-hidden="true" />
          <span className={styles.stageCornerEnd} aria-hidden="true" />
        </div>
        <span className={styles.stageNumeral} aria-hidden="true">
          02
        </span>
      </div>

      {/* Creator → Featured transition: mirrors the Hero → Creator seam
          above, picked up by Featured's matching top seam (see
          Featured.module.css's .seam). Purely additive — nothing else in
          the approved Creator composition changes. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default Creator
