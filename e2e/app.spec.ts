import { test, expect } from '@playwright/test'

test('development shell loads successfully', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /CarterPCs Portfolio Concept/i }),
  ).toBeVisible()
  await expect(
    page.getByText(/Development foundation initialized\./i),
  ).toBeVisible()
})
