import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the development foundation shell', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /CarterPCs Portfolio Concept/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Development foundation initialized\./i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /skip to content/i }),
    ).toBeInTheDocument()
  })
})
