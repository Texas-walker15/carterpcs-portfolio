import { test, expect } from '@playwright/test'

test('Hero loads with heading, subhead, and navigation', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { level: 1, name: /^carterpcs$/i }),
  ).toBeVisible()
  await expect(page.getByText(/making tech interesting\./i)).toBeVisible()
  await expect(page.getByRole('navigation', { name: /primary/i })).toBeVisible()
})

test('skip link is keyboard-reachable and targets main content', async ({
  page,
}) => {
  await page.goto('/')

  const skipLink = page.getByRole('link', { name: /skip to content/i })
  await expect(skipLink).toHaveAttribute('href', '#main-content')
})
