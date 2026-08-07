import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Without vitest's `globals: true`, Testing Library can't auto-detect a
// global `afterEach` to hook its automatic unmount-between-tests cleanup
// into, so it's registered explicitly here.
afterEach(cleanup)

// jsdom does not implement matchMedia. GSAP/ScrollTrigger registration and
// useReducedMotion() both call it at module/mount time, so the smoke test
// needs a minimal stand-in.
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom does not implement ResizeObserver either, which Lenis relies on to
// measure the scroll container.
if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
