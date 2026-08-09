import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registered once at module scope — ES modules are evaluated a single time,
// so importing this file anywhere is safe and never re-registers the plugin.
gsap.registerPlugin(ScrollTrigger)

/**
 * Left-to-right clip wipe shared by every section headline (Creator,
 * Featured, Hardware, Content Universe). Two details matter, and neither is
 * visible from the tween that uses them:
 *
 * 1. VERTICAL BLEED. `inset()` clips to the element's BORDER BOX, and these
 *    headlines are set at line-height 0.95–1.02 — tighter than the font's
 *    own line box — so ascenders and descenders render OUTSIDE that box.
 *    Measured against the shipped build at 320–390px, glyph ink sat 4–7px
 *    above and 2.7–6.4px below the box on every headline in all three
 *    languages. A plain `inset(0 … 0 0)` slices exactly that ink: the "p" in
 *    "superflu." and the cap tops of the first line were being cut flat.
 *    The negative vertical insets push the clip rectangle past the box so
 *    the wipe only ever clips horizontally, which is the whole point of it.
 *
 * 2. NO RESTING ARTIFACT. GSAP writes the tween's final value to the
 *    element as an inline style and leaves it there, so a finished reveal
 *    still carries a live cropping rectangle for the rest of the session —
 *    and it does not always land exactly on 0% (residual right insets of
 *    0.17–0.24% were measured on the shipped build). Callers therefore
 *    clear the property in the tween's own onComplete; the two constants
 *    alone are not enough.
 */
export const HEADLINE_WIPE_FROM = 'inset(-20% 100% -20% 0%)'
export const HEADLINE_WIPE_TO = 'inset(-20% 0% -20% 0%)'

export { gsap, ScrollTrigger }
