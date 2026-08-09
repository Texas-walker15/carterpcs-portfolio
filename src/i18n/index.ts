/**
 * Central translation source for the whole site.
 *
 * Components read a fully-resolved dictionary object (`const { t } =
 * usePreferences()`) and render `t.hero.support` directly, so a language
 * change is an ordinary React re-render — no DOM text-node walking, no
 * `MutationObserver`, no browser auto-translation, and nothing that could
 * fight GSAP for ownership of the same nodes.
 *
 * TYPE CONTRACT
 * `Dictionary` is derived from the English object rather than declared
 * separately, so `en.ts` is the single place a new string is introduced and
 * `fr.ts`/`es.ts` are checked against it at compile time. Arrays widen to
 * `string[]` (no `as const`), which is what the components want.
 */

import { en } from './en'
import { fr } from './fr'
import { es } from './es'

export type Language = 'en' | 'fr' | 'es'

/** Every supported language, in nav display order. English stays first/default. */
export const LANGUAGES: Language[] = ['en', 'fr', 'es']

export const DEFAULT_LANGUAGE: Language = 'en'

export type Dictionary = typeof en

const dictionaries: Record<Language, Dictionary> = { en, fr, es }

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language] ?? dictionaries[DEFAULT_LANGUAGE]
}

export function isLanguage(value: string | null): value is Language {
  return value !== null && (LANGUAGES as string[]).includes(value)
}

/**
 * One translated value per language, used by the `src/data/*` content files.
 *
 * Those files own structural fields the copy must never drift from — panel
 * `index`, media `variant`, category `id`, scale `tier` — so their text fields
 * are stored as `Localized<...>` alongside that structure and resolved once
 * per render by each file's `get*(language)` selector. One row per item, three
 * translations inside it: adding a language can never leave an item's index
 * and its copy out of sync.
 */
export type Localized<T> = Record<Language, T>

/** Resolves a `Localized` field, falling back to English if a locale is absent. */
export function localize<T>(value: Localized<T>, language: Language): T {
  return value[language] ?? value[DEFAULT_LANGUAGE]
}
