import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import styles from './Nav.module.css'
import {
  usePreferences,
  type Language,
  type ThemePreference,
} from '../../app/Preferences'

/**
 * Primary navigation — 1:1 recreation of the approved Hero reference's
 * bar: mark + wordmark + violet indicator left, six section labels
 * centred, "About Carter ↗" pill and the square theme utility right.
 *
 * LINK TARGETS: the reference's labels (Work / Systems / Process /
 * Impact / Content / Universe) describe the full 11-section site, most
 * of which is not built yet. Every label therefore anchors to the
 * nearest EXISTING section so no link is ever dead; the mapping tightens
 * as later sections land. "About Carter" remains the sole #creator
 * entry in spirit — Process points there too only until a real process
 * section exists.
 *
 * PREFERENCE MENUS
 * The theme and language dropdowns are state-driven disclosures, not the
 * CSS-only `:hover`/`:focus-within` pair they started as. That earlier
 * version could not satisfy the behaviour this bar needs, because CSS has
 * no way to express any of it: selecting an option left focus inside the
 * menu, so `:focus-within` held it open indefinitely; Escape did nothing;
 * and the trigger exposed no `aria-expanded`, so assistive tech was never
 * told a popup existed at all, let alone whether it was open.
 *
 * Open/close is therefore owned by `openMenu` — one menu at a time — and
 * closes on: selecting an option, Escape (focus returns to the trigger),
 * focus leaving the wrapper, and a pointer press outside it. Triggers
 * carry `aria-haspopup`/`aria-expanded`/`aria-controls`; items stay
 * `menuitemradio` with live `aria-checked`. Keyboard support is a superset
 * of what the CSS version offered: Enter/Space and Arrow keys open the
 * menu and land on an item, arrows and Home/End move within it, Tab still
 * walks through naturally, and Escape returns to the trigger.
 */

const SECTIONS = [
  '#featured',
  '#hardware',
  '#creator',
  '#featured',
  '#content-universe',
  '#content-universe',
]

const LANGUAGES: { code: Language; flag: string }[] = [
  { code: 'en', flag: '🇺🇸' },
  { code: 'fr', flag: '🇫🇷' },
  { code: 'es', flag: '🇪🇸' },
]

/** Order only — the visible label comes from the active dictionary. */
const THEMES: ThemePreference[] = ['dark', 'light', 'system']

type MenuId = 'theme' | 'language'

function Nav() {
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    t,
    languageLabels,
    navigationLabels,
  } = usePreferences()

  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)

  const baseId = useId()
  const menuId = (id: MenuId) => `${baseId}-${id}-menu`

  const themeWrapRef = useRef<HTMLDivElement>(null)
  const languageWrapRef = useRef<HTMLDivElement>(null)
  const themeTriggerRef = useRef<HTMLButtonElement>(null)
  const languageTriggerRef = useRef<HTMLButtonElement>(null)

  const wrapRef = useCallback(
    (id: MenuId): RefObject<HTMLDivElement | null> =>
      id === 'theme' ? themeWrapRef : languageWrapRef,
    [],
  )
  const triggerRef = useCallback(
    (id: MenuId): RefObject<HTMLButtonElement | null> =>
      id === 'theme' ? themeTriggerRef : languageTriggerRef,
    [],
  )

  const closeMenu = useCallback(
    (id: MenuId, returnFocus: boolean) => {
      setOpenMenu((current) => (current === id ? null : current))
      if (returnFocus) triggerRef(id).current?.focus()
    },
    [triggerRef],
  )

  // Escape anywhere, and any pointer press outside the open wrapper, close
  // it. Both live on the document rather than the wrapper so they still fire
  // when focus has drifted somewhere else entirely (a click on inert page
  // chrome, say) instead of stranding an open menu over the page.
  useEffect(() => {
    if (!openMenu) return

    const wrap = wrapRef(openMenu).current

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      closeMenu(openMenu, true)
    }

    const handlePointerDown = (event: Event) => {
      if (wrap && !wrap.contains(event.target as Node))
        closeMenu(openMenu, false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [openMenu, closeMenu, wrapRef])

  const items = (id: MenuId) =>
    Array.from(
      wrapRef(id).current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitemradio"]',
      ) ?? [],
    )

  const focusItem = (id: MenuId, index: number) => {
    const list = items(id)
    if (!list.length) return
    const wrapped = (index + list.length) % list.length
    list[wrapped].focus()
  }

  /** Opens the menu and lands on an item in the same tick as the keypress. */
  const openAt = (id: MenuId, edge: 'first' | 'last') => {
    setOpenMenu(id)
    // The menu is display:none until the state lands, so focus has to wait
    // for the committed DOM rather than run against the closed markup.
    window.requestAnimationFrame(() =>
      focusItem(id, edge === 'first' ? 0 : items(id).length - 1),
    )
  }

  const handleTriggerKeyDown =
    (id: MenuId) => (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        openAt(id, 'first')
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        openAt(id, 'last')
      }
    }

  const handleMenuKeyDown =
    (id: MenuId) => (event: KeyboardEvent<HTMLDivElement>) => {
      const list = items(id)
      const index = list.indexOf(document.activeElement as HTMLButtonElement)
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        focusItem(id, index + 1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        focusItem(id, index - 1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        focusItem(id, 0)
      } else if (event.key === 'End') {
        event.preventDefault()
        focusItem(id, list.length - 1)
      }
    }

  const handleFocusOut =
    (id: MenuId) => (event: FocusEvent<HTMLDivElement>) => {
      const wrap = event.currentTarget
      const next = event.relatedTarget as Node | null
      if (next) {
        if (!wrap.contains(next)) closeMenu(id, false)
        return
      }
      // Some browsers report a null relatedTarget when a press moves focus to
      // the body. Deciding immediately would close the menu before the click
      // on the item it contains had a chance to land, so let activeElement
      // settle first.
      window.setTimeout(() => {
        if (!wrap.contains(document.activeElement)) closeMenu(id, false)
      }, 0)
    }

  /** Applies a selection, then closes and hands focus back to the trigger. */
  const select = (id: MenuId, apply: () => void) => {
    apply()
    closeMenu(id, true)
  }

  return (
    <nav className={styles.nav} aria-label={t.a11y.primaryNavigation}>
      {/* Same shared ~1536px composition canvas as the Hero, so the bar
          never spreads apart from the content on wide viewports. */}
      <div className={styles.bar}>
        <a className={styles.wordmark} href="#hero">
          {/* Neutral abstract mark — original geometry, not a copied logo. */}
          <svg
            className={styles.mark}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M8 1.5v13M3 4.25l10 7.5M13 4.25l-10 7.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          CarterPCs
          <span className={styles.markDot} aria-hidden="true" />
        </a>

        <ul className={styles.sections}>
          {SECTIONS.map((href, index) => (
            <li key={`${href}-${index}`}>
              <a className={styles.link} href={href}>
                {navigationLabels[index]}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.utils}>
          <a className={styles.about} href="#creator">
            {t.nav.about}
            <span className={styles.aboutArrow} aria-hidden="true">
              ↗
            </span>
          </a>

          <div
            className={styles.menuWrap}
            ref={themeWrapRef}
            onBlur={handleFocusOut('theme')}
          >
            <button
              className={styles.theme}
              type="button"
              ref={themeTriggerRef}
              aria-label={t.a11y.chooseTheme}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'theme'}
              aria-controls={menuId('theme')}
              onClick={() =>
                setOpenMenu((current) => (current === 'theme' ? null : 'theme'))
              }
              onKeyDown={handleTriggerKeyDown('theme')}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle
                  cx="8"
                  cy="8"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.95 3.05l-1.13 1.13M4.18 11.82l-1.13 1.13M12.95 12.95l-1.13-1.13M4.18 4.18 3.05 3.05"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div
              className={
                openMenu === 'theme'
                  ? `${styles.menu} ${styles.menuOpen}`
                  : styles.menu
              }
              id={menuId('theme')}
              role="menu"
              aria-label={t.a11y.themeMenu}
              // Programmatically focusable only: the arrow-key handler lives
              // on the container (keydown bubbles up from the items), and an
              // element carrying an interactive role must be able to hold
              // focus. It is never a Tab stop.
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown('theme')}
            >
              {THEMES.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={theme === value}
                  className={theme === value ? styles.menuActive : undefined}
                  onClick={() => select('theme', () => setTheme(value))}
                >
                  {t.nav.themes[value]}
                </button>
              ))}
            </div>
          </div>

          <div
            className={styles.menuWrap}
            ref={languageWrapRef}
            onBlur={handleFocusOut('language')}
          >
            <button
              className={styles.language}
              type="button"
              ref={languageTriggerRef}
              aria-label={t.a11y.chooseLanguage}
              aria-haspopup="menu"
              aria-expanded={openMenu === 'language'}
              aria-controls={menuId('language')}
              onClick={() =>
                setOpenMenu((current) =>
                  current === 'language' ? null : 'language',
                )
              }
              onKeyDown={handleTriggerKeyDown('language')}
            >
              <span aria-hidden="true">◎</span>
            </button>
            <div
              className={
                openMenu === 'language'
                  ? `${styles.menu} ${styles.menuOpen}`
                  : styles.menu
              }
              id={menuId('language')}
              role="menu"
              aria-label={t.a11y.languageMenu}
              // See the theme menu above — programmatically focusable only.
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown('language')}
            >
              {LANGUAGES.map(({ code, flag }) => (
                <button
                  key={code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={language === code}
                  className={language === code ? styles.menuActive : undefined}
                  onClick={() => select('language', () => setLanguage(code))}
                >
                  <span aria-hidden="true">{flag}</span>
                  {languageLabels[code]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Nav
