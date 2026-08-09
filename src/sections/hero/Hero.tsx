import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../../animations/gsap'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { usePreferences } from '../../app/Preferences'
import portrait from '../../assets/hero/carter-hero-portrait-cutout.webp'
import audienceAvatars from '../../assets/hero/about-audience-avatars.webp'
import tileBuilds from '../../assets/hero/tile-media-builds.webp'
import tileStudio from '../../assets/hero/tile-media-studio.webp'
import tileUniverse from '../../assets/hero/tile-media-universe.webp'
import appleLogo from '../../assets/hero/apple-logo.svg'
import styles from './Hero.module.css'

interface HeroProps {
  /** True once the Intro is done (or was skipped) and Hero should reveal. */
  ready: boolean
}

const REVEAL_SELECTOR =
  '[data-reveal], [data-headline-line], [data-stage], [data-about], [data-stats]'

/**
 * Hero — a 1:1 recreation of the approved reference composition. The
 * reference image is the single visual source of truth for this section:
 * nav bar, left index rail, eyebrow, "Built / Different." headline,
 * three-line support, twin CTAs, Carter portrait region, environmental
 * disc, About Carter card, By The Numbers card, three lower content
 * tiles, and the Featured-In strip, in the reference's positions and
 * proportions.
 *
 * FACTUAL-INTEGRITY DEVIATIONS (the only intentional ones):
 * - The By The Numbers card keeps the reference's container geometry but
 *   carries user-verified statistics (see STATS' provenance notes),
 *   never the concept image's illustrative 1.2M+ / 100M+ / 4K+.
 * - The Featured-In strip is a VISUAL recreation only (see PRESS_MARKS):
 *   aria-hidden typographic approximations plus a supplied Apple mark,
 *   with the visible disclaimer directly beneath — never an
 *   endorsement claim anywhere semantic.
 * - The About card reproduces the reference's avatar-row geometry with
 *   finished circular crops from the approved reference render and the
 *   supported qualitative claim "Millions across platforms" — the
 *   reference's "+1.2M" figure is not reproduced.
 *
 * PORTRAIT MEDIA
 * The supplied asset is used as-is — nothing is scraped, generated, or
 * retouched. `src/assets/hero/carter-hero-portrait.png` is preserved
 * unchanged as the source; the production asset is a non-destructive
 * derivative (cropped to the subject's alpha bounds, re-encoded to
 * WebP). No pixel of the person is altered: the supplied PNG already
 * carried a clean alpha channel, so no background-removal pass — and no
 * AI alteration — was applied to the figure.
 *
 * Geometry is derived from the reference: cap top, chin and head centre
 * are matched to the reference's landmarks, the figure runs behind the
 * By The Numbers card and the lower tiles, and the lower torso is
 * dissolved by a CSS mask rather than cut. Layer order (see the CSS)
 * puts the environmental disc behind the portrait and the cards and
 * tiles in front of it.
 *
 * ACCESSIBILITY
 * Visible headline lines are aria-hidden; the h1 carries the accessible
 * name "CarterPCs — Built Different". The portrait is editorial media
 * whose subject the h1 already names, so it carries alt="" rather than
 * duplicating that for screen readers. Environment and index rail are
 * aria-hidden. Every control is a real link to a real section.
 */

/**
 * Lower editorial tiles, matched to the reference's three modules.
 * MEDIA: temporary reference assets, cropped non-destructively from the
 * media regions of the user's approved concept render (no text, borders
 * or UI cropped; nothing scraped from third parties). Swap for final
 * approved photography when it exists.
 */
/**
 * Structure only — index, destination and media never change with language.
 * `copy` names the tile's entry in the active dictionary (`t.hero.tiles`), so
 * a translated title/body can never drift away from its own href or asset.
 */
const TILES = [
  {
    index: '03',
    copy: 'builds',
    href: '#hardware',
    media: tileBuilds,
  },
  {
    index: '04',
    copy: 'content',
    href: '#featured',
    media: tileStudio,
  },
  {
    index: '05',
    copy: 'universe',
    href: '#content-universe',
    media: tileUniverse,
  },
] as const

/**
 * USER-VERIFIED STATISTICS (discrepancy resolved by the user,
 * 2026-08-08): a newer Social Blade read — 2.94M subscribers and
 * 6,868,093,822 total YouTube views as of 28 July 2026, gaining tens of
 * millions of views per day — supersedes the stale ~4.5B tracker figure
 * and supports "7.0B+" as the current rounded threshold. The label
 * reads "Total YouTube Views" precisely so the figure is never taken
 * as a cross-platform total.
 * - "Dozens" stays qualitative: no verified lifetime build counter
 *   exists, so no precise total may be invented.
 * Social metrics are time-sensitive — refresh all three against live
 * sources before any future production release. Never substitute the
 * concept image's illustrative figures (1.2M+ / 100M+ / 4K+).
 *
 * LOCALIZATION: the two numeric values are rendered from this module
 * constant in every language and are never passed through the dictionary —
 * a verified figure must not be re-typed per locale where it could be
 * mistranscribed. Only the LABELS are translated, plus the third row's
 * deliberately qualitative value ("Dozens"), which is a word rather than a
 * figure and is resolved from `t.hero.stats.dozens` (see `statLines`).
 */
const STATS = [
  { value: '3.0M+', label: 'subscribers' },
  { value: '7.0B+', label: 'views' },
  { value: null, label: 'builds' },
] as const

/**
 * Featured-In strip — VISUAL RECREATION of the approved reference only,
 * per the user's explicit direction (2026-08-09). These are typographic
 * approximations of the reference's wordmarks, NOT verified
 * relationships: the strip is aria-hidden, the visible disclaimer sits
 * directly beneath it, and these names must never appear in metadata,
 * SEO, structured data or accessibility text as endorsements. No logo
 * files are bundled — type styling only.
 */
const PRESS_MARKS = [
  { name: 'Apple', style: styles.markGlyph },
  { name: 'Forbes', style: styles.markSerif },
  { name: 'The Verge', style: styles.markVerge },
  { name: 'HYPEBEAST', style: styles.markCaps },
  { name: 'Linus Tech Tips', style: styles.markSans },
  { name: 'uncrate', style: styles.markLower },
]

/**
 * The supplied Apple logo is decorative and rendered only inside the
 * aria-hidden strip. The nearby disclaimer clarifies that this concept
 * makes no affiliation or endorsement claim.
 */
function AppleMark() {
  return <img src={appleLogo} alt="" />
}

function Hero({ ready }: HeroProps) {
  const reducedMotion = useReducedMotion()
  const { t } = usePreferences()
  const rootRef = useRef<HTMLElement>(null)

  // `value: null` marks the one qualitative row, whose value is a translated
  // word rather than a verified figure (see STATS' provenance note).
  const statLines = STATS.map(({ value, label }) => ({
    value: value ?? t.hero.stats.dozens,
    label: t.hero.stats[label],
  }))

  useLayoutEffect(() => {
    if (!ready) {
      return
    }

    if (reducedMotion) {
      gsap.set(REVEAL_SELECTOR, { clearProps: 'all' })
      return
    }

    const ctx = gsap.context(() => {
      // Entrance — heavily overlapped so it reads cinematic, and every
      // element settles exactly onto the reference composition.
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-stage]', {
          opacity: 0,
          scale: 1.04,
          duration: 1.6,
          ease: 'power2.out',
        })
        .from(
          '[data-reveal="eyebrow"]',
          { opacity: 0, y: 12, duration: 0.7 },
          0.1,
        )
        // Masked vertical reveal: each line rises out of its own clip box.
        .fromTo(
          '[data-headline-line]',
          { yPercent: 110 },
          { yPercent: 0, duration: 1.15, stagger: 0.09, ease: 'power4.out' },
          0.18,
        )
        .from(
          '[data-reveal="support"]',
          { opacity: 0, y: 14, duration: 0.75 },
          0.66,
        )
        .from(
          '[data-reveal="actions"]',
          { opacity: 0, y: 12, duration: 0.65 },
          0.8,
        )
        .from('[data-about]', { opacity: 0, y: 20, duration: 0.85 }, 0.92)
        .from('[data-stats]', { opacity: 0, y: 20, duration: 0.85 }, 1.02)
        .from(
          '[data-reveal="tiles"]',
          { opacity: 0, y: 24, duration: 0.9 },
          1.12,
        )
        .from('[data-reveal="strip"]', { opacity: 0, duration: 0.8 }, 1.3)
        .from('[data-reveal="rail"]', { opacity: 0, duration: 0.8 }, 1.2)

      // Scroll depth — a few pixels of differential drift, desktop only.
      // Restrained so the resting frame stays the reference composition;
      // the Hero is never pinned, so the handoff into Creator stays an
      // ordinary, uninterrupted scroll.
      ScrollTrigger.matchMedia({
        // Matches the CSS breakpoint where the absolute reference
        // composition engages — the stacked flow below it never drifts.
        '(min-width: 1240px)': () => {
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: rootRef.current,
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            })
            .to('[data-stage]', { y: 44 }, 0)
            .to('[data-headline]', { y: -30 }, 0)
            .to('[data-about]', { y: 16 }, 0)
            .to('[data-stats]', { y: 22 }, 0)
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [ready, reducedMotion])

  return (
    <section id="hero" className={styles.hero} ref={rootRef}>
      {/* 0 — Environmental light wash. Full-bleed, decorative. */}
      <div className={styles.env} aria-hidden="true" />

      {/* Shared ~1536px composition canvas: every major element below is
          positioned against this one centred frame, so wide viewports
          never spread the composition apart. */}
      <div className={styles.canvas}>
        {/* Environmental disc — canvas-locked so it stays behind Carter
            at every viewport width. Decorative. */}
        <span className={styles.envDisc} aria-hidden="true" />

        {/* 1 — Carter portrait. Sits in front of the environmental disc
            and behind the cards and lower tiles (see the CSS layers). */}
        <div className={styles.stage} data-stage>
          <img
            className={styles.media}
            src={portrait}
            alt=""
            width={1018}
            height={897}
            decoding="async"
            fetchPriority="high"
            draggable={false}
          />
        </div>

        {/* Left editorial index rail. Decorative. */}
        <div className={styles.index} aria-hidden="true" data-reveal="rail">
          <span className={styles.indexLine} />
          <span className={styles.indexActive} />
          <span className={styles.indexTick} />
          <span className={styles.indexTick} />
          <p className={styles.indexCount}>
            <span>01</span>
            <span className={styles.indexTotal}>/06</span>
          </p>
        </div>

        {/* 2 — Type column */}
        <div className={styles.inner}>
          <p className={styles.eyebrow} data-reveal="eyebrow">
            <span>{t.hero.eyebrow}</span>
            <span className={styles.eyebrowDot} aria-hidden="true" />
          </p>

          {/* The two visible lines stay aria-hidden in every language; the
            h1's accessible name is the dictionary's own translated
            equivalent of "CarterPCs — Built Different". */}
          <h1
            className={styles.headline}
            aria-label={t.hero.headlineLabel}
            data-headline
          >
            <span className={styles.lineMask} aria-hidden="true">
              <span className={styles.line} data-headline-line>
                {t.hero.headlineLineOne}
              </span>
            </span>
            <span className={styles.lineMask} aria-hidden="true">
              <span className={styles.line} data-headline-line>
                {t.hero.headlineLineTwo}
                <span className={styles.period}>.</span>
              </span>
            </span>
          </h1>

          {/* Approved copy (CONTENT.md §Hero) shaped to the reference's
            three-line support block. */}
          <p className={styles.support} data-reveal="support">
            {t.hero.support}
          </p>

          <div className={styles.actions} data-reveal="actions">
            <a
              className={`${styles.cta} ${styles.ctaPrimary}`}
              href="#content-universe"
            >
              {t.hero.ctaPrimary}
              <span className={styles.ctaBadge} aria-hidden="true">
                →
              </span>
            </a>
            {/* No reel exists yet — routes to the selected-work sequence,
              keeping the reference's visual treatment. */}
            <a
              className={`${styles.cta} ${styles.ctaSecondary}`}
              href="#featured"
            >
              {t.hero.ctaSecondary}
              <span className={styles.play} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* 3 — Right card rail. One column on desktop so the two cards
            space themselves and can never collide as the viewport
            height compresses; dissolves on mobile (display: contents). */}
        <div className={styles.cards}>
          {/* About Carter card */}
          <aside className={styles.about} data-about>
            <p className={styles.cardMeta}>
              <span className={styles.cardIndex}>01</span>
              <span>{t.hero.aboutTitle}</span>
            </p>
            {/* User-supplied preferred positioning copy (2026-08). */}
            <p className={styles.aboutText}>{t.hero.aboutText}</p>
            <a className={styles.aboutLink} href="#creator">
              {t.hero.aboutLink}
              <span className={styles.aboutArrow} aria-hidden="true">
                ↗
              </span>
            </a>
            {/* Reference avatar row — the finished circular crops from
            the approved reference render (cropped non-destructively,
            like the tile media), paired with the supported qualitative
            claim. The reference's "+1.2M" figure is deliberately not
            reproduced. Decorative. */}
            <p className={styles.aboutAudience}>
              <img
                className={styles.audienceAvatars}
                src={audienceAvatars}
                alt=""
                width={376}
                height={144}
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              {t.hero.audience}
            </p>
          </aside>

          {/* 4 — By The Numbers card: reference geometry, user-verified
          statistics (see STATS' provenance notes). */}
          <aside className={styles.stats} data-stats>
            <p className={styles.cardMeta}>
              <span>{t.hero.statsTitle}</span>
              <span className={styles.cardIndex}>02</span>
            </p>
            <ul className={styles.statsList}>
              {statLines.map(({ value, label }) => (
                <li key={label} className={styles.stat}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        {/* 5 — Lower rail: three content tiles + Featured-In strip */}
        <div className={styles.lower}>
          <div className={styles.tiles} data-reveal="tiles">
            {TILES.map(({ index, copy, href, media }) => (
              <a key={index} className={styles.tile} href={href}>
                {/* Temporary reference asset (see TILES' provenance note);
                  decorative — the tile's text names the destination. */}
                <img
                  className={styles.tileMedia}
                  src={media}
                  alt=""
                  width={208}
                  height={168}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
                <span className={styles.tileBody}>
                  <span className={styles.tileIndex}>{index}</span>
                  <span className={styles.tileTitle}>
                    {t.hero.tiles[copy].title}
                  </span>
                  <span className={styles.tileText}>
                    {t.hero.tiles[copy].body}
                  </span>
                </span>
                <span className={styles.tileArrow} aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </div>

          {/* Featured-In strip — a VISUAL recreation of the reference
              only. aria-hidden keeps the brand names out of the
              accessibility tree (they are not endorsements and must
              never read as such to assistive tech, metadata or SEO);
              the visible disclaimer below is the honest counterpart
              and stays fully readable. */}
          <div className={styles.strip} data-reveal="strip" aria-hidden="true">
            <span className={styles.stripLabel}>{t.hero.featuredIn}</span>
            <ul className={styles.stripSlots}>
              {PRESS_MARKS.map(({ name, style }) => (
                <li key={name} className={`${styles.stripSlot} ${style}`}>
                  {name === 'Apple' ? <AppleMark /> : name}
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.disclaimer}>{t.hero.disclaimer}</p>
        </div>
      </div>

      {/* Hero → Creator transition: picked up by Creator's matching top
          seam (see Creator.module.css's .seam) so the section boundary
          reads as one hairline crossed, not a hard cut. */}
      <span className={styles.seam} aria-hidden="true" />
    </section>
  )
}

export default Hero
