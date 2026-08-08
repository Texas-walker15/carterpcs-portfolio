import styles from './Nav.module.css'

/**
 * Minimal navigation foundation, per ARCHITECTURE.md's Global Navigation
 * ("Wordmark, top-left, fixed... low visual weight").
 *
 * ARCHITECTURE.md also specifies a fixed section-index (01–11) and a
 * full-screen menu overlay listing all sections. Both remain deliberately
 * deferred: with only three of eleven sections built, a full index would
 * still show 8 markers permanently inert — that belongs in the phase that
 * builds enough sections to make it a real index rather than mostly-dead
 * chrome.
 *
 * What's added now that Featured exists: one more real link, continuing the
 * same wordmark-as-breadcrumb pattern established when Creator shipped —
 * every target here is a real, currently-existing section, so this
 * introduces no dead links.
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
      <span className={styles.divider} aria-hidden="true">
        /
      </span>
      <a className={styles.link} href="#featured">
        Featured
      </a>
    </nav>
  )
}

export default Nav
