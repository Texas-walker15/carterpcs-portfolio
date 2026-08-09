import { test, expect, type Page } from '@playwright/test'
import { en } from '../src/i18n/en'
import { fr } from '../src/i18n/fr'
import { es } from '../src/i18n/es'
import { getContentCategories } from '../src/data/contentUniverse'
import { getFeaturedStories } from '../src/data/featured'
import { getHardwareBeats } from '../src/data/hardware'

test('Hero loads with heading, subhead, and navigation', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /^carterpcs — built different$/i,
    }),
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

  // The Creator section's nav entry is the "About Carter" control in the
  // bar's right zone (see Nav.tsx) — the only link targeting #creator.
  await page.getByRole('link', { name: /^about carter$/i }).click()
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

  // "Work" is the reference bar's Featured entry (see Nav.tsx).
  await page.getByRole('link', { name: /^work$/i }).click()
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

  // "Systems" is the reference bar's Hardware entry (see Nav.tsx).
  await page.getByRole('link', { name: /^systems$/i }).click()
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

test('scrolling from Hardware reveals the Content Universe section', async ({
  page,
}) => {
  await page.goto('/')

  const heading = page.getByRole('heading', {
    level: 2,
    name: /six territories/i,
  })
  await expect(heading).toBeAttached()

  await heading.scrollIntoViewIfNeeded()
  await expect(heading).toBeVisible()
})

test('Content nav link scrolls to the Content Universe section', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByRole('link', { name: /^content$/i }).click()
  await expect(page).toHaveURL(/#content-universe$/)
})

test('desktop: Content Universe choreography progresses and resolves with all six categories reachable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const heading = page.getByRole('heading', {
    level: 2,
    name: /six territories/i,
  })
  const hardwareCategory = page.getByRole('heading', {
    level: 3,
    name: /pc hardware & custom builds/i,
  })
  const communityCategory = page.getByRole('heading', {
    level: 3,
    name: /community & storytelling/i,
  })

  await heading.scrollIntoViewIfNeeded()
  await expect(heading).toBeVisible()
  await expect(hardwareCategory).toBeAttached()
  await expect(communityCategory).toBeAttached()

  // Scroll well past the pin's distance so it releases and normal vertical
  // flow resumes, reaching the section's resolved end (the closing index
  // line lists all six categories as one connected list).
  await page.evaluate(() => window.scrollBy(0, 1400))
  await page.waitForTimeout(500)

  await communityCategory.scrollIntoViewIfNeeded()
  await expect(communityCategory).toBeVisible()

  const index = page.getByText(
    /hardware.*mobile tech.*tech news.*scam tech.*emerging tech.*community/i,
  )
  await index.scrollIntoViewIfNeeded()
  await expect(index).toBeVisible()

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(true)
})

test('mobile: Content Universe categories are reachable through natural vertical scroll with no overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const heading = page.getByRole('heading', {
    level: 2,
    name: /six territories/i,
  })
  await heading.scrollIntoViewIfNeeded()
  await expect(heading).toBeVisible()

  const communityCategory = page.getByRole('heading', {
    level: 3,
    name: /community & storytelling/i,
  })
  await communityCategory.scrollIntoViewIfNeeded()
  await expect(communityCategory).toBeVisible()

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  )
  expect(overflow).toBe(true)
})

/* ------------------------------------------------------------------ *
 * Localization
 *
 * The unit suite proves the dictionary is wired into every component and
 * that no English copy survives a language change. These tests cover what
 * jsdom cannot: the dropdown genuinely opening on hover in a real browser,
 * the choice surviving a reload, and — the reason display-type translations
 * are risky at all — the translated composition still fitting its viewport
 * at both approved sizes with no horizontal overflow.
 * ------------------------------------------------------------------ */

const DESKTOP = { width: 1536, height: 1024 }
const MOBILE = { width: 390, height: 844 }

/**
 * Opens the language menu the way a visitor does — the trigger is a real
 * disclosure button now, so it is clicked rather than hovered. The trigger's
 * accessible name is itself translated, so it is passed in rather than
 * hard-coded.
 */
async function selectLanguage(
  page: Page,
  triggerLabel: string,
  option: string,
) {
  await page.getByRole('button', { name: triggerLabel, exact: true }).click()
  await page.getByRole('menuitemradio', { name: option, exact: true }).click()
}

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  )
}

test('language menu opens on click and switches the page without a reload', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP)
  await page.goto('/')

  // Proves the switch is in-place: a marker on the live window object would
  // not survive a navigation.
  await page.evaluate(() => {
    ;(window as unknown as { __noReload: boolean }).__noReload = true
  })

  await selectLanguage(page, en.a11y.chooseLanguage, en.nav.languages.fr)

  expect(
    await page.evaluate(
      () => (window as unknown as { __noReload?: boolean }).__noReload,
    ),
  ).toBe(true)

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
  await expect(page).toHaveTitle(fr.meta.title)
  await expect(page.getByText(fr.hero.support)).toBeVisible()
  await expect(page.getByText(en.hero.support)).toHaveCount(0)
  await expect(
    page.getByRole('heading', { level: 1, name: fr.hero.headlineLabel }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: fr.nav.sections[0], exact: true }),
  ).toHaveAttribute('href', '#featured')

  // Switching again from within French uses the French control labels.
  await selectLanguage(page, fr.a11y.chooseLanguage, fr.nav.languages.es)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.getByText(es.hero.support)).toBeVisible()
})

test('the chosen language persists across a reload', async ({ page }) => {
  await page.setViewportSize(DESKTOP)
  await page.goto('/')

  await selectLanguage(page, en.a11y.chooseLanguage, en.nav.languages.es)
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')

  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.getByText(es.hero.support)).toBeVisible()
  await expect(
    page.getByRole('heading', { level: 2, name: es.hardware.headline }),
  ).toBeVisible()
})

for (const [language, dictionary] of [
  ['fr', fr],
  ['es', es],
] as const) {
  for (const [sizeName, size] of [
    ['desktop 1536x1024', DESKTOP],
    ['mobile 390x844', MOBILE],
  ] as const) {
    test(`${language} @ ${sizeName}: every section renders with no horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize(size)
      // Seeded before the app boots so the very first paint is translated —
      // this measures the translated layout, not a re-layout after a switch.
      await page.addInitScript((lang) => {
        window.localStorage.setItem('carterpcs-language', lang)
      }, language)
      await page.goto('/')

      await expect(page.locator('html')).toHaveAttribute('lang', language)
      expect(await hasHorizontalOverflow(page)).toBe(false)

      // Hero
      await expect(
        page.getByRole('heading', {
          level: 1,
          name: dictionary.hero.headlineLabel,
        }),
      ).toBeVisible()
      await expect(page.getByText(dictionary.hero.support)).toBeVisible()
      await expect(page.getByText(dictionary.hero.statsTitle)).toBeVisible()

      // Creator → Content Universe, walked in document order so each section's
      // ScrollTrigger fires the way it would for a visitor.
      const sectionHeadings = [
        dictionary.creator.headline,
        dictionary.featured.title,
        dictionary.hardware.headline,
        dictionary.contentUniverse.headline,
      ]
      for (const name of sectionHeadings) {
        const heading = page.getByRole('heading', { level: 2, name })
        await heading.scrollIntoViewIfNeeded()
        await expect(heading).toBeVisible()
        expect(await hasHorizontalOverflow(page)).toBe(false)
      }

      // Data-driven content in the translated language.
      const stories = getFeaturedStories(language)
      const lastStory = page.getByRole('heading', {
        level: 3,
        name: stories[2].headlineLines.join(' '),
      })
      await lastStory.scrollIntoViewIfNeeded()
      await expect(lastStory).toBeVisible()

      const beats = getHardwareBeats(language)
      const lastBeat = page.getByText(beats[2].description)
      await lastBeat.scrollIntoViewIfNeeded()
      await expect(lastBeat).toBeVisible()

      const categories = getContentCategories(language)
      const lastCategory = page.getByRole('heading', {
        level: 3,
        name: categories[5].fullName,
      })
      await lastCategory.scrollIntoViewIfNeeded()
      await expect(lastCategory).toBeVisible()

      expect(await hasHorizontalOverflow(page)).toBe(false)
    })
  }
}

test('desktop: the Featured horizontal sequence still completes in French', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP)
  await page.addInitScript(() => {
    window.localStorage.setItem('carterpcs-language', 'fr')
  })
  await page.goto('/')

  const stories = getFeaturedStories('fr')
  const firstStory = page.getByRole('heading', {
    level: 3,
    name: stories[0].headlineLines.join(' '),
  })
  const lastStory = page.getByRole('heading', {
    level: 3,
    name: stories[2].headlineLines.join(' '),
  })

  await firstStory.scrollIntoViewIfNeeded()
  await expect(firstStory).toBeVisible()
  await expect(lastStory).not.toBeInViewport()

  await page.evaluate(() => window.scrollBy(0, 2200))
  await page.waitForTimeout(500)

  await expect(lastStory).toBeInViewport()
  expect(await hasHorizontalOverflow(page)).toBe(false)
})

/* ------------------------------------------------------------------ *
 * Mobile QA — preference menus
 *
 * The CSS-only `:hover`/`:focus-within` menus these replaced never closed
 * after a selection (the chosen item still held focus) and, on mobile,
 * dropped straight over the bar's own second row of section links.
 * ------------------------------------------------------------------ */

const languageTrigger = (page: Page, label = en.a11y.chooseLanguage) =>
  page.getByRole('button', { name: label, exact: true })

const themeTrigger = (page: Page, label = en.a11y.chooseTheme) =>
  page.getByRole('button', { name: label, exact: true })

for (const [sizeName, size] of [
  ['desktop', DESKTOP],
  ['mobile', MOBILE],
] as const) {
  test(`${sizeName}: the theme menu closes on selection, Escape, and focus loss`, async ({
    page,
  }) => {
    await page.setViewportSize(size)
    await page.goto('/')

    const trigger = themeTrigger(page)
    const menu = page.getByRole('menu', { name: en.a11y.themeMenu })

    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(menu).toBeHidden()

    // 1. Selecting an option applies it AND closes the menu.
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(menu).toBeVisible()

    await page.getByRole('menuitemradio', { name: en.nav.themes.light }).click()
    await expect(menu).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

    // Re-opening shows the new choice as the checked item.
    await trigger.click()
    await expect(
      page.getByRole('menuitemradio', { name: en.nav.themes.light }),
    ).toHaveAttribute('aria-checked', 'true')

    // 2. Escape closes and hands focus back to the trigger.
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()

    // 3. Focus leaving the wrapper closes it.
    await trigger.click()
    await expect(menu).toBeVisible()
    await page.getByRole('link', { name: en.nav.about, exact: true }).focus()
    await expect(menu).toBeHidden()

    // 4. A pointer press outside closes it.
    await trigger.click()
    await expect(menu).toBeVisible()
    await page.mouse.click(20, size.height - 40)
    await expect(menu).toBeHidden()
  })
}

test('mobile: an open menu clears the bar’s own section links', async ({
  page,
}) => {
  await page.setViewportSize(MOBILE)
  await page.goto('/')

  await languageTrigger(page).click()
  const menu = page.getByRole('menu', { name: en.a11y.languageMenu })
  await expect(menu).toBeVisible()

  const overlap = await page.evaluate(() => {
    const panel = [...document.querySelectorAll('[role="menu"]')].find(
      (m) => getComputedStyle(m).display !== 'none',
    )
    if (!panel) return { found: false, coversNavLinks: false, height: 0 }
    const r = panel.getBoundingClientRect()
    let coversNavLinks = false
    for (const link of document.querySelectorAll('nav ul a')) {
      const l = link.getBoundingClientRect()
      if (
        r.left < l.right &&
        r.right > l.left &&
        r.top < l.bottom &&
        r.bottom > l.top
      )
        coversNavLinks = true
    }
    return {
      found: true,
      coversNavLinks,
      // How far down the viewport the panel reaches — it must stay a small
      // dropdown, not a sheet over the Hero.
      height: r.height,
      viewportShare: r.height / window.innerHeight,
    }
  })

  expect(overlap.found).toBe(true)
  expect(overlap.coversNavLinks).toBe(false)
  expect(overlap.viewportShare).toBeLessThan(0.25)

  // Every section link stays clickable while the menu is open.
  await expect(
    page.getByRole('link', { name: 'Work', exact: true }),
  ).toBeVisible()
  expect(await hasHorizontalOverflow(page)).toBe(false)
})

/* ------------------------------------------------------------------ *
 * Mobile QA — headline clipping
 *
 * The reveal wipes each headline in with `clip-path: inset()`, which clips
 * to the BORDER box. These headings run line-height < 1, so ascenders and
 * descenders sit outside that box and were being sliced — and GSAP left the
 * final clip-path on the element permanently, so the slice outlived the
 * animation. Asserted as real geometry: glyph ink vs. the clipping box.
 * ------------------------------------------------------------------ */

for (const width of [320, 390]) {
  for (const language of ['en', 'fr', 'es'] as const) {
    test(`${language} @ ${width}px: section headings wrap without clipped glyphs`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.addInitScript((lang) => {
        window.localStorage.setItem('carterpcs-language', lang)
      }, language)
      await page.goto('/')

      for (const selector of [
        '#creator h2',
        '#featured h2',
        '#hardware h2',
        '#content-universe h2',
      ]) {
        const heading = page.locator(selector).first()
        await heading.scrollIntoViewIfNeeded()
        // Let the one-shot reveal finish; the artifact only appears at rest.
        await page.waitForTimeout(1200)

        const m = await heading.evaluate((el) => {
          const box = el.getBoundingClientRect()
          const range = document.createRange()
          range.selectNodeContents(el)
          const rects = [...range.getClientRects()]
          return {
            residualClip: el.style.clipPath || '',
            lines: rects.length,
            cutTop: Math.min(...rects.map((r) => r.top)) - box.top,
            cutBottom: Math.max(...rects.map((r) => r.bottom)) - box.bottom,
            cutRight: Math.max(...rects.map((r) => r.right)) - box.right,
          }
        })

        // No clip-path survives the reveal, so nothing can be cropped at rest.
        expect(
          m.residualClip,
          `${selector} kept a clip-path after revealing`,
        ).toBe('')
        // It wraps rather than running past its box.
        expect(m.lines, `${selector} did not wrap`).toBeGreaterThan(1)
        expect(m.cutRight, `${selector} overflows horizontally`).toBeLessThan(1)
      }

      expect(await hasHorizontalOverflow(page)).toBe(false)
    })
  }
}
