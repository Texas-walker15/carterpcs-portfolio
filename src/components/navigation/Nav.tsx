import styles from './Nav.module.css'

/**
 * Minimal navigation foundation, per ARCHITECTURE.md's Global Navigation
 * ("Wordmark, top-left, fixed... low visual weight").
 *
 * ARCHITECTURE.md also specifies a fixed section-index (01–11) and a
 * full-screen menu overlay listing all sections. Both remain deliberately
 * deferred: with only Hero and Creator built, a full index would still show
 * 9 of 11 markers permanently inert — that belongs in the phase that builds
 * enough sections to make it a real index rather than mostly-dead chrome.
 *
 * What's added now that Creator exists: one real link to it, styled as a
 * continuation of the wordmark (using the same "/" separator as the
 * section-number metadata already established in Hero/Creator) rather than
 * a second nav-bar item — both targets are real, currently-existing
 * sections, so this introduces no dead links.
 */
function Nav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <a className={styles.wordmark} href="#hero">
        CarterPCs
      </a>
      <span className={styles.divider} aria-hidden="true">
        /
      </span>
      <a className={styles.link} href="#creator">
        Creator
      </a>
    </nav>
  )
}

export default Nav
