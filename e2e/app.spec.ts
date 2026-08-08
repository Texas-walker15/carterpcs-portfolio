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

test('scrolling from Hero reveals the Creator section', async ({ page }) => {
  await page.goto('/')

  const creatorHeading = page.getByRole('heading', {
    level: 2,
    name: /hardware knowledge/i,
  })
  await expect(creatorHeading).toBeAttached()

  await creatorHeading.scrollIntoViewIfNeeded()
  await expect(creatorHeading).toBeVisible()
})

test('Creator nav link scrolls to the Creator section', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: /^creator$/i }).click()
  await expect(page).toHaveURL(/#creator$/)
})

test('scrolling from Creator reveals the Featured section', async ({
  page,
}) => {
  await page.goto('/')

  const featuredTitle = page.getByRole('heading', {
    level: 2,
    name: /selected stories/i,
  })
  await expect(featuredTitle).toBeAttached()

  await featuredTitle.scrollIntoViewIfNeeded()
  await expect(featuredTitle).toBeVisible()
})

test('Featured nav link scrolls to the Featured section', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: /^featured$/i }).click()
  await expect(page).toHaveURL(/#featured$/)
})

test('desktop: the horizontal sequence progresses through all three stories on scroll', async ({
  page,
}) => {
  await page.goto('/')

  const firstStory = page.getByRole('heading', {
    level: 3,
    name: /budget builds/i,
  })
  const lastStory = page.getByRole('heading', {
    level: 3,
    name: /when the industry/i,
  })

  await firstStory.scrollIntoViewIfNeeded()
  await expect(firstStory).toBeVisible()
  // Not yet reached — still off-screen to the right of the pinned track.
  await expect(lastStory).not.toBeInViewport()

  // Scroll past the pinned track's distance so the sequence completes.
  // Kept close to that distance (not a large overshoot): Hardware now
  // follows Featured, so once the pin releases, scrolling continues
  // normally into Hardware — too generous an overshoot here would carry
  // the viewport past Featured's last panel and into Hardware instead.
  await page.evaluate(() => window.scrollBy(0, 2200))
  await page.waitForTimeout(500)

  await expect(lastStory).toBeInViewport()
})

test('mobile: Featured stories are reachable through natural vertical scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const lastStory = page.getByRole('heading', {
    level: 3,
    name: /when the industry/i,
  })
  await lastStory.scrollIntoViewIfNeeded()
  await expect(lastStory).toBeVisible()

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(true)
})

test('scrolling from Featured reveals the Hardware section', async ({
  page,
}) => {
  await page.goto('/')

  const hardwareHeading = page.getByRole('heading', {
    level: 2,
    name: /built from the inside out/i,
  })
  await expect(hardwareHeading).toBeAttached()

  await hardwareHeading.scrollIntoViewIfNeeded()
  await expect(hardwareHeading).toBeVisible()
})

test('Hardware nav link scrolls to the Hardware section', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: /^hardware$/i }).click()
  await expect(page).toHaveURL(/#hardware$/)
})

test('desktop: Hardware choreography resolves and normal scroll flow resumes after it', async ({
  page,
}) => {
  await page.goto('/')

  const hardwareHeading = page.getByRole('heading', {
    level: 2,
    name: /built from the inside out/i,
  })
  await hardwareHeading.scrollIntoViewIfNeeded()
  await expect(hardwareHeading).toBeVisible()

  // Scroll well past the brief pin's distance so it releases and normal
  // vertical flow resumes, reaching the final beat below the stage.
  await page.evaluate(() => window.scrollBy(0, 1400))
  await page.waitForTimeout(500)

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(true)

  const lastBeat = page.getByText(/^performance$/i)
  await lastBeat.scrollIntoViewIfNeeded()
  await expect(lastBeat).toBeVisible()
})

test('mobile: Hardware section is reachable through natural vertical scroll with no overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const hardwareHeading = page.getByRole('heading', {
    level: 2,
    name: /built from the inside out/i,
  })
  await hardwareHeading.scrollIntoViewIfNeeded()
  await expect(hardwareHeading).toBeVisible()

  const lastBeat = page.getByText(/^performance$/i)
  await lastBeat.scrollIntoViewIfNeeded()
  await expect(lastBeat).toBeVisible()

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(true)
})
