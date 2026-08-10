/**
 * English dictionary — the SHAPE SOURCE OF TRUTH for the whole i18n layer.
 *
 * `Dictionary` is derived from this object (`typeof en`, see ./index.ts), so
 * `fr.ts` and `es.ts` are compile-time checked against it: a missing key, an
 * extra key, or a wrong value type is a typecheck failure, not a silent
 * English fallback at runtime. Adding a new visible string therefore means
 * adding it here first, then translating it in the other two files.
 *
 * SCOPE: this file holds interface/section copy. Per-item content that already
 * has a typed home stays in `src/data/*` (featured, hardware, contentUniverse),
 * where each text field is a `Localized<...>` record — same compile-time
 * guarantee, colocated with the structural data (index, variant, tier, id)
 * those files own.
 *
 * NOT TRANSLATED, deliberately:
 * - "CarterPCs" and the third-party wordmarks in Hero's Featured-In strip are
 *   proper nouns.
 * - Platform names (TikTok / YouTube Shorts / Instagram Reels) are proper
 *   nouns; they carry a per-language entry only so the separator/order stays
 *   editable per locale.
 * - Hero's numeric statistics ("3.0M+", "7.0B+") are user-verified figures and
 *   are rendered from `Hero.tsx`'s STATS unchanged. Only their LABELS and the
 *   qualitative "Dozens" value are localized (see hero.stats below).
 * - Section numerals ("02 / …") stay Arabic numerals in every language; only
 *   the word after the slash is translated.
 */

export const en = {
  /** Document-level metadata, mirrored onto <title> and <meta name="description">. */
  meta: {
    title: 'CarterPCs Portfolio Concept',
    description:
      'Unofficial interactive portfolio concept inspired by CarterPCs.',
  },

  /** Accessible names that are never visible on screen. */
  a11y: {
    skipToContent: 'Skip to content',
    primaryNavigation: 'Primary',
    chooseTheme: 'Choose theme',
    chooseLanguage: 'Choose language',
    themeMenu: 'Theme',
    languageMenu: 'Language',
  },

  nav: {
    /** Six centre labels, in bar order. Targets live in Nav.tsx's SECTIONS. */
    sections: ['Work', 'Systems', 'Process', 'Impact', 'Content', 'Universe'],
    about: 'About Carter',
    themes: {
      dark: 'Dark',
      light: 'Light',
      system: 'System',
    },
    /** Language names as written IN the currently selected language. */
    languages: {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
    },
  },

  hero: {
    eyebrow: 'Cinematic Computers',
    /** h1 accessible name — the visible two-line headline is aria-hidden. */
    headlineLabel: 'CarterPCs — Built Different',
    headlineLineOne: 'Built',
    /** The period is a separate styled span in Hero.tsx and is not part of this string. */
    headlineLineTwo: 'Different',
    support:
      'Making tech interesting. PC builds, hardware, and the everyday technology decisions in between.',
    ctaPrimary: 'Explore the Universe',
    ctaSecondary: 'Watch Reel',
    aboutTitle: 'About Carter',
    aboutText:
      'Carter creates fast, accessible technology content across hardware, mobile tech, builds and the wider tech world.',
    aboutLink: 'Learn more',
    audience: 'Millions across platforms',
    statsTitle: 'By The Numbers',
    stats: {
      subscribers: 'YouTube Subscribers',
      views: 'Total YouTube Views',
      builds: 'Custom PCs Built',
      /** Qualitative value — no verified lifetime build counter exists. */
      dozens: 'Dozens',
    },
    tiles: {
      builds: {
        title: 'Custom Builds',
        body: 'High-performance computers engineered for aesthetics and reliability.',
      },
      content: {
        title: 'Content Creation',
        body: 'Cinematic tech content that educates, entertains, and inspires.',
      },
      universe: {
        title: 'The Universe',
        body: 'Explore the systems, philosophy, and process behind everything.',
      },
    },
    featuredIn: 'Featured in',
    disclaimer: 'Unofficial concept. No affiliation or endorsement implied.',
  },

  creator: {
    metaLabel: '02 / Creator',
    metaNote: 'Creator overview',
    kicker: 'The Creator',
    headline: 'Hardware knowledge, delivered without the fluff.',
    bodyOne:
      'A daily short-form record of PC builds, smartphones, and everyday tech decisions — filmed fast, tested by hand, and built for viewers who want the point without losing the context.',
    bodyTwo:
      'The tone stays direct on purpose: plain-English breakdowns, a willingness to call out bad hardware and worse marketing, and a sense of humor that never strays far from the internet it grew up on.',
    tags: 'PC Hardware — Mobile Tech — Consumer Tech — Scam-Busting',
    /** Proper nouns — identical in every language, kept per-locale only so the separator can move. */
    platforms: 'TikTok · YouTube Shorts · Instagram Reels',
  },

  /**
   * The three Shorts are click-to-play: nothing is fetched from YouTube until
   * a visitor asks for it. Only the INTERFACE is translated here. The video
   * titles themselves stay in English in every language — they are the real,
   * published titles of the Shorts (see data/featured.ts, where all three
   * `headlineLines` carry the same English text in all three locales), and
   * translating a published title would misstate what the visitor is about to
   * open.
   *
   * Each accessible name is composed as `${visible label} — ${title}`, so the
   * visible label always STARTS the accessible name (WCAG 2.5.3 Label in Name)
   * and the name still says which of the three Shorts it acts on.
   */
  featured: {
    metaLabel: '03 / Featured',
    metaNote: 'Selected editorial stories',
    title: 'Selected Stories',
    playShort: 'Play Short',
    closePlayer: 'Close player',
    watchShort: 'Watch the Short',
    a11y: {
      /** Prefix for the iframe's title attribute. */
      player: 'YouTube player',
      opensInNewTab: 'opens in a new tab',
    },
  },

  hardware: {
    metaLabel: '04 / Hardware',
    metaNote: 'Hardware experience',
    kicker: 'Inside the build',
    headline: 'Built from the inside out.',
    support:
      'Every component judged on what it does, not what the box promises.',
    tags: 'Custom Builds — Component Testing — Value vs. Prebuilt',
  },

  contentUniverse: {
    metaLabel: '05 / Content Universe',
    metaNote: 'The full range',
    kicker: 'Beyond the featured stories',
    headline: 'Six territories, one connected feed.',
    support:
      'The recurring ground every video comes back to — from custom builds to the stories that have nothing to do with hardware at all.',
  },

  /**
   * Closing statement — the site's last beat before the footer (a separate
   * task; nothing here belongs to it).
   *
   * `wordmark` is absent on purpose: the identity is the proper noun
   * "CarterPCs" and is rendered as a literal in Closing.tsx, exactly as the
   * nav bar and Hero's Featured-In strip already do.
   *
   * `headlineLineOne`/`headlineLineTwo` are one sentence broken across two
   * display lines, so each language keeps its own natural break point rather
   * than inheriting English's. The sentence deliberately restates
   * `hero.support`'s opening claim — it is the bookend to it — so each
   * language reuses its own existing phrasing rather than inventing a second
   * translation of the same line.
   */
  closing: {
    disclaimerLineOne: 'Independent creative concept.',
    disclaimerLineTwo: 'Not affiliated with CarterPCs.',
    headlineLineOne: 'Making tech',
    headlineLineTwo: 'interesting.',
    backToTop: 'Back to top',
  },

  /**
   * Footer — the site's last, quietest row.
   *
   * `copyright` holds only the NAME. The "©" and the year are language-neutral
   * and are composed in Footer.tsx from a single constant, so the year is one
   * edit rather than three.
   *
   * The three platform names are proper nouns and are NOT translated; they
   * appear here only so `opensInNewTab` can be appended to each accessible
   * name in the right language. Those are the only three destinations that
   * exist — see Footer.tsx.
   *
   * `disclaimer` is a SINGLE line. The Closing statement above already says
   * "Independent creative concept.", so the footer does not repeat it.
   */
  footer: {
    copyright: 'CarterPCs Portfolio Concept',
    disclaimer: 'No affiliation or endorsement implied.',
    a11y: {
      footerNavigation: 'Footer',
      socialLinks: 'Social',
      /** Appended after the platform name, so the visible label is preserved. */
      opensInNewTab: 'opens in a new tab',
    },
  },
}
