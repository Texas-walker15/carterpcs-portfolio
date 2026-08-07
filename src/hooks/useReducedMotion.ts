import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getInitialState(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false
  }
  return window.matchMedia(QUERY).matches
}

/** Tracks the user's `prefers-reduced-motion` preference, live. */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(getInitialState)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(QUERY)
    const listener = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }

    mediaQueryList.addEventListener('change', listener)
    return () => mediaQueryList.removeEventListener('change', listener)
  }, [])

  return reducedMotion
}
