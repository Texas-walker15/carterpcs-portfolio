import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './Hero.module.css'

interface HeroProps {
  /** True once the Intro is done (or was skipped) and Hero should reveal. */
  ready: boolean
}

const REVEAL_SELECTOR =
  '[data-reveal], [data-headline-line], [data-reveal-stage]'

/**
 * First full statement of identity and tone, per ARCHITECTURE.md's Hero spec.
 *
 * Art direction: a single canvas rather than a text column beside a media
 * card. The media stage sits on the same near-black base as the page and is
 * lit only by restrained accent glow fields, with its leading edge dissolved
 * by a mask — so there is no vertical seam and the headline can cross into it
 * at full contrast.
 *
 * Copy is unchanged placeholder text from CONTENT.md (§Hero for the kicker /
 * title / supporting line, §Closing Section for the disclaimer). Metadata
 * labels are project-level only — no CarterPCs facts, figures, dates, or
 * quotes are introduced anywhere in this section.
 *
 * The visible title is art-directed onto two lines while the accessible name
 * stays exactly "CarterPCs" via aria-label, with the visual line spans hidden
 * from the accessibility tree.
 *
 * No approved CarterPCs media exists yet. `.stageSurface` is the drop-in
 * target: replacing its background with an <img>/<video> that fills the frame
 * needs no other structural change. Placeholder status is marked in this
 * comment, via `data-dev-placeholder`, and by a small on-stage caption.
 */
function Hero({ ready }: HeroProps) {
  const reducedMotion = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (!ready) {
      return
    }

    if (reducedMotion) {
      gsap.set(REVEAL_SELECTOR, { clearProps: 'all' })
      return
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-reveal-stage]', {
          opacity: 0,
          xPercent: 6,
          duration: 1.4,
        })
        .fromTo(
          '[data-headline-line]',
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1, stagger: 0.14 },
          '-=1.1',
        )
        .from(
          '[data-reveal]',
          { opacity: 0, y: 18, duration: 0.7, stagger: 0.1 },
          '-=0.8',
        )
    }, rootRef)

    return () => ctx.revert()
  }, [ready, reducedMotion])

  return (
    <section id="hero" className={styles.hero} ref={rootRef}>
      {/* Development placeholder media stage — no CarterPCs assets are used. */}
      <div
        className={styles.stage}
        aria-hidden="true"
        data-reveal-stage
        data-dev-placeholder="true"
      >
        <div className={styles.stageSurface}>
          <span className={styles.stageGuide} data-guide="v" />
          <span className={styles.stageGuide} data-guide="h" />
          <span className={styles.stageCorner} data-corner="tr" />
          <span className={styles.stageCorner} data-corner="bl" />
        </div>
        <span className={styles.stageCaption}>
          Visual placeholder — development build
        </span>
      </div>

      <div className={styles.canvas}>
        <p className={styles.meta} data-reveal>
          <span>01 / Hero</span>
          <span className={styles.metaRule} aria-hidden="true" />
          <span>Unofficial concept</span>
        </p>

        <div className={styles.type}>
          <p className={styles.kicker} data-reveal>
            Tech. Hardware. Culture.
          </p>
          <h1 className={styles.headline} aria-label="CarterPCs">
            <span className={styles.line} data-headline-line aria-hidden="true">
              Carter
            </span>
            <span
              className={`${styles.line} ${styles.lineOffset}`}
              data-headline-line
              aria-hidden="true"
            >
              PCs
            </span>
          </h1>
          <p className={styles.subhead} data-reveal>
            Making tech interesting.
          </p>
        </div>

        <div className={styles.footer} data-reveal>
          <p className={styles.disclaimer}>
            Independent creative concept. Not affiliated with or endorsed by
            CarterPCs.
          </p>
          <span className={styles.footerRule} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export default Hero
