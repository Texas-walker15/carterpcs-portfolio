import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  gsap,
  ScrollTrigger,
  HEADLINE_WIPE_FROM,
  HEADLINE_WIPE_TO,
} from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import { getHardwareBeats } from '../../data/hardware'
import styles from './Hardware.module.css'

/**
 * Hardware Experience, per ARCHITECTURE.md's Section 5 spec: the site's
 * signature hardware showcase, shifting the narrative from "what CarterPCs
 * creates" (Featured) into "the physical technology world his content
 * revolves around." One immersive composition, not three more panels —
 * Featured already owns the multi-entry/horizontal-story grammar, so this
 * section is deliberately a single dominant stage instead.
 *
 * Depth is real DOM layering, not a 3D library (TECH_STACK.md §3 keeps
 * Three.js/R3F optional and explicitly scopes Hardware's default
 * implementation to CSS/GSAP): `.backdrop` (background — the environmental
 * "04"), `.hardwareStage` (midground — the layered component-scale planes),
 * `.intro`/`.beats`/`.tags` (foreground — headline and editorial metadata).
 * Three real, independently-positioned layers, so the depth-separation
 * scroll choreography can move each at its own subtle rate instead of
 * faking depth with a single flattened layer.
 *
 * The "04" is deliberately NOT a repeat of Creator's/Featured's corner-accent
 * numeral treatment: it lives in its own full-bleed `.backdrop` layer
 * *behind* the stage rather than beside it, so the stage's layered planes
 * visually sit "in" the numeral's environment — integrated background
 * typography, not a decorative corner label.
 *
 * No approved CarterPCs media exists yet. `.mediaLayer` is the single
 * primary drop-in target (see the media-stage contract note above it in
 * JSX) — the two accent planes around it are decorative depth/composition
 * elements, not additional required media slots.
 *
 * Copy: headline/support/beat text is original editorial development
 * language grounded in RESEARCH.md §7's "Custom PCs vs. Overpriced
 * Prebuilts" theme (value-oriented, hands-on, unfiltered tone) and
 * CONTENT.md §Hardware Sequence's category list — see data/hardware.ts's
 * top comment for the full sourcing note. No specs, benchmarks, prices, or
 * quotes are used anywhere.
 *
 * Motion grammar deliberately differs from Featured's horizontal pin+scrub:
 * this section introduces a brief VERTICAL pin (desktop only, ~0.65 of a
 * viewport of scroll) during which only the background numeral and the
 * stage's two accent planes visibly separate in depth and then recompose —
 * headline, beats, and tags stay completely still throughout, so the
 * motion clearly belongs to the hardware object, not the page. Entrance
 * reveal (headline clip, stage fade, staggered text) is a separate,
 * independent trigger — the same one-time "top 75%" pattern
 * Hero/Creator/Featured already use — so the two motion concerns never
 * fight over the same elements or timing.
 */
function Hardware() {
  const reducedMotion = useReducedMotion()
  const { t, language } = usePreferences()
  const beats = useMemo(() => getHardwareBeats(language), [language])
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (reducedMotion) {
      return
    }

    const ctx = gsap.context(() => {
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
          '[data-reveal-stage]',
          { opacity: 0, y: 24, duration: 1, scale: 0.97 },
          '-=0.7',
        )
        .from(
          '[data-reveal]',
          { opacity: 0, y: 18, duration: 0.7, stagger: 0.08 },
          '-=0.8',
        )

      // Brief depth-separation pin — desktop only. Foreground content
      // (headline/beats/tags) is intentionally left untouched here; only
      // the background numeral and the stage's two accent planes move.
      // Movement was increased from an earlier, too-subtle pass (±22px,
      // ±4% scale) after a real recording showed the separation was barely
      // perceptible — values below are tuned so the "layers pulling apart"
      // moment reads clearly on screen without becoming showy. The rear
      // plate and foreground slab each carry a static base `rotate()` in
      // CSS (see stageAccentBack/stageAccentFront) — recompose targets
      // that exact base angle, not 0, so "recomposed" matches the settled
      // static frame precisely rather than flattening the tilt out.
      ScrollTrigger.matchMedia({
        '(min-width: 1024px)': () => {
          const BACK_BASE_ROTATE = -2
          const FRONT_BASE_ROTATE = 1.4

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              // The section's BOTTOM edge, not its top. When the composition
              // fits the viewport — which, after the layout fix in
              // Hardware.module.css, it does at every standard desktop size —
              // the two are the same scroll position to the pixel, because the
              // section is exactly 100vh tall. They differ only when it does
              // NOT fit: a short desktop window, a long translation, a large
              // browser zoom. Pinning from the top there froze the section for
              // 0.65 of a viewport with the rest of it still below the fold —
              // measured before this change at 1024/1440/1920, where the tags
              // line was off-screen for the pin's entire duration and the
              // third beat was too at 1024. Hanging the pin off the bottom
              // edge means the visitor has always reached the end of the
              // section before its scroll is borrowed.
              start: 'bottom bottom',
              end: () => `+=${Math.round(window.innerHeight * 0.65)}`,
              scrub: 1,
              pin: true,
              invalidateOnRefresh: true,
            },
          })

          // Rear plate drifts further back/up and tilts slightly more.
          tl.to(
            '[data-stage-plane="back"]',
            { y: -55, x: -16, scale: 0.92, rotate: BACK_BASE_ROTATE - 3 },
            0,
          )
            // Foreground slab pushes forward/down and laterally, tilting
            // the other way — the largest, most legible move of the three.
            .to(
              '[data-stage-plane="front"]',
              { y: 60, x: 18, scale: 1.06, rotate: FRONT_BASE_ROTATE + 3 },
              0,
            )
            // Numeral moves least of all — the deepest, slowest layer.
            .to('[data-numeral]', { y: -14 }, 0)
            .to(
              '[data-stage-plane="back"]',
              { y: 0, x: 0, scale: 1, rotate: BACK_BASE_ROTATE },
              1,
            )
            .to(
              '[data-stage-plane="front"]',
              { y: 0, x: 0, scale: 1, rotate: FRONT_BASE_ROTATE },
              1,
            )
            .to('[data-numeral]', { y: 0 }, 1)
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="hardware" className={styles.hardware} ref={rootRef}>
      <span className={styles.seam} aria-hidden="true" />

      {/* Background layer — environmental "04", see top-of-file comment. */}
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.backdropNumeral} data-numeral>
          04
        </span>
      </div>

      <div className={styles.canvas}>
        <div className={styles.intro}>
          <p className={styles.meta} data-reveal>
            <span>{t.hardware.metaLabel}</span>
            <span className={styles.metaRule} aria-hidden="true" />
            <span>{t.hardware.metaNote}</span>
          </p>
          <p className={styles.kicker} data-reveal>
            {t.hardware.kicker}
          </p>
          <h2 className={styles.headline} data-headline-line>
            {t.hardware.headline}
          </h2>
          <p className={styles.support} data-reveal>
            {t.hardware.support}
          </p>
        </div>

        {/* Development placeholder hardware stage — no CarterPCs assets are
            used. `.mediaLayer` is the drop-in target for future approved
            hardware photography/video/cutouts; the accent planes around it
            are decorative depth, not additional required media slots. */}
        <figure
          className={styles.hardwareStage}
          aria-hidden="true"
          data-reveal-stage
          data-dev-placeholder="true"
        >
          <div className={styles.stageAccentBack} data-stage-plane="back" />
          <div className={styles.mediaLayer} data-stage-plane="mid">
            <span className={styles.stageGuide} aria-hidden="true" />
            <span className={styles.stageCorner} aria-hidden="true" />
            <span className={styles.stageCornerEnd} aria-hidden="true" />
          </div>
          <div className={styles.stageAccentFront} data-stage-plane="front" />
        </figure>

        <ul className={styles.beats}>
          {beats.map((beat) => (
            <li key={beat.index} className={styles.beat} data-reveal>
              <p className={styles.beatMeta}>
                <span className={styles.beatIndex}>{beat.index}</span>
                <span className={styles.beatLabel}>{beat.label}</span>
              </p>
              <p className={styles.beatDescription}>{beat.description}</p>
            </li>
          ))}
        </ul>

        <p className={styles.tags} data-reveal>
          {t.hardware.tags}
        </p>
      </div>

      {/* Hardware → Content Universe transition: same hairline motif used
          at every prior section boundary, picked up by Content Universe's
          matching top seam (see ContentUniverse.module.css's .seam).
          Purely additive — nothing else in the approved Hardware
          composition changes. */}
      <span className={styles.seamEnd} aria-hidden="true" />
    </section>
  )
}

export default Hardware
