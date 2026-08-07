import { useLenis } from '../hooks/useLenis'
import styles from './App.module.css'

/**
 * Temporary development shell. Not the final Hero/navigation/section
 * design — those are built in a later task, section by section, per
 * docs/ARCHITECTURE.md.
 */
function App() {
  useLenis()

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className={styles.header}>
        <p className={styles.wordmark}>CarterPCs Portfolio Concept</p>
      </header>

      <main id="main-content" className={styles.main}>
        <h1 className={styles.heading}>CarterPCs Portfolio Concept</h1>
        <p className={styles.status}>Development foundation initialized.</p>
        <p className={styles.disclaimer}>
          Unofficial interactive portfolio concept inspired by CarterPCs.
        </p>
      </main>
    </>
  )
}

export default App
