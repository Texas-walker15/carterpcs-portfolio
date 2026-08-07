import styles from './Nav.module.css'

/**
 * Minimal navigation foundation for this phase: just the wordmark, per
 * ARCHITECTURE.md's Global Navigation ("Wordmark, top-left, fixed... low
 * visual weight").
 *
 * ARCHITECTURE.md also specifies a fixed section-index (01–11) and a
 * full-screen menu overlay listing all sections. Both are deliberately
 * deferred: with only Intro/Hero built, a section index would either link
 * to content that doesn't exist yet or show 9 of 11 markers permanently
 * inert — neither reads as intentional. They belong in the same phase that
 * builds enough sections to navigate between (see final report).
 */
function Nav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <a className={styles.wordmark} href="#hero">
        CarterPCs
      </a>
    </nav>
  )
}

export default Nav
