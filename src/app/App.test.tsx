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

  it('has a real navigation link to the Creator section', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /^creator$/i })).toHaveAttribute(
      'href',
      '#creator',
    )
  })

  it('renders the Creator section with an accessible heading and content', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /hardware knowledge/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/tiktok/i)).toBeInTheDocument()
    expect(screen.getByText(/youtube shorts/i)).toBeInTheDocument()
  })

  it('has a real navigation link to the Featured section', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /^featured$/i })).toHaveAttribute(
      'href',
      '#featured',
    )
  })

  it('renders the Featured section with an accessible heading and all three stories', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 2, name: /selected stories/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 3, name: /budget builds/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /phones\.\s*features/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /when the industry/i,
      }),
    ).toBeInTheDocument()

    expect(screen.getByText(/01 — hardware/i)).toBeInTheDocument()
    expect(screen.getByText(/02 — tech/i)).toBeInTheDocument()
    expect(screen.getByText(/03 — commentary/i)).toBeInTheDocument()
  })

  it('has a main landmark containing Hero, Creator, and Featured with no duplicate headings', () => {
    render(<App />)

    const main = screen.getByRole('main')
    const h1s = screen.getAllByRole('heading', { level: 1 })
    const h2s = screen.getAllByRole('heading', { level: 2 })

    expect(h1s).toHaveLength(1)
    expect(main).toContainElement(h1s[0])
    expect(h1s[0]).toHaveAccessibleName(/^carterpcs$/i)

    // One h2 per major section (Creator, Featured) — not a duplicate.
    const h2Names = h2s.map((h) => h.textContent)
    expect(new Set(h2Names).size).toBe(h2Names.length)
    expect(main).toContainElement(
      screen.getByRole('heading', { level: 2, name: /hardware knowledge/i }),
    )
    expect(main).toContainElement(
      screen.getByRole('heading', { level: 2, name: /selected stories/i }),
    )
  })

  it('renders Hero, Creator, and Featured content immediately when reduced motion is preferred', () => {
    mockMatchMedia(true)
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: /^carterpcs$/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/making tech interesting\./i)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /hardware knowledge/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /selected stories/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: /budget builds/i }),
    ).toBeInTheDocument()
  })
})
