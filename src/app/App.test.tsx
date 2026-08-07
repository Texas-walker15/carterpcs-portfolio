import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the skip link, navigation, and Hero heading', () => {
    render(<App />)

    expect(
      screen.getByRole('link', { name: /skip to content/i }),
    ).toHaveAttribute('href', '#main-content')

    expect(
      screen.getByRole('navigation', { name: /primary/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^carterpcs$/i })).toHaveAttribute(
      'href',
      '#hero',
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /^carterpcs$/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/making tech interesting\./i)).toBeInTheDocument()
  })

  it('has a main landmark containing the Hero', () => {
    render(<App />)

    const main = screen.getByRole('main')
    expect(main).toContainElement(
      screen.getByRole('heading', { level: 1, name: /^carterpcs$/i }),
    )
  })

  it('renders Hero content immediately when reduced motion is preferred', () => {
    mockMatchMedia(true)
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: /^carterpcs$/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/making tech interesting\./i)).toBeInTheDocument()
  })
})
