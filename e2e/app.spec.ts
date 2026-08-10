import { test, expect, type Page } from '@playwright/test'
import { en } from '../src/i18n/en'
import { fr } from '../src/i18n/fr'
import { es } from '../src/i18n/es'
import { getContentCategories } from '../src/data/contentUniverse'
import { getFeaturedStories } from '../src/data/featured'
import { getHardwareBeats } from '../src/data/hardware'

/**
 * The six section labels now appear twice — once in the bar and once in the
 * footer's compact row — so a bare name is ambiguous. Scoping to the landmark
 * is also a stronger assertion than the bare name was.
 */
const primaryNav = (page: Page) =>
  page.getByRole('navigation', { name: en.a11y.primaryNavigation })

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
  await primaryNav(page)
    .getByRole('link', { name: /^work$/i })
    .click()
  await expect(page).toHaveURL(/#featured$/)
})

test('desktop: the horizontal sequence progresses through all three stories on scroll', async ({
  page,
}) => {
  await page.goto('/')

  const firstStory = page.getByRole('heading', {
    level: 3,
    name: /best pc/i,
  })
  const lastStory = page.getByRole('heading', {
    level: 3,
    name: /lenovo thinkpad/i,
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
    name: /lenovo thinkpad/i,
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

/* ===== Featured: click-to-play Shorts ===== */

const FEATURED = getFeaturedStories('en')
const shortTitle = (index: number) => FEATURED[index].headlineLines.join(' ')
const playName = (index: number) =>
  `${en.featured.playShort} — ${shortTitle(index)}`

test('the page loads with no YouTube iframe anywhere, at any scroll position', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('iframe')).toHaveCount(0)

  // Scrolling Featured into view must not create one either — the embeds are
  // built on click, not on visibility.
  await page
    .getByRole('heading', { level: 2, name: /selected stories/i })
    .scrollIntoViewIfNeeded()
  await page.waitForTimeout(800)
  await expect(page.locator('iframe')).toHaveCount(0)

  await expect(
    page.getByRole('button', {
      name: new RegExp(`^${en.featured.playShort} `),
    }),
  ).toHaveCount(3)
})

test('mobile: playing a Short creates a nocookie player, and a second one replaces it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const first = page.getByRole('button', { name: playName(0), exact: true })
  await first.scrollIntoViewIfNeeded()
  await first.click()

  const player = page.locator('#featured iframe')
  await expect(player).toHaveCount(1)
  await expect(player).toHaveAttribute(
    'src',
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/JekaYRzZRfU\?/,
  )
  // Exact string, not a regex: these titles contain `$` and `?`, which a
  // RegExp would read as anchors and quantifiers rather than characters.
  await expect(player).toHaveAttribute(
    'title',
    `${en.featured.a11y.player} — ${shortTitle(0)}`,
  )

  // Starting the second Short must leave exactly one player, and it must be
  // the second one — the first is removed, not paused offscreen.
  const second = page.getByRole('button', { name: playName(1), exact: true })
  await second.scrollIntoViewIfNeeded()
  await second.click()

  await expect(player).toHaveCount(1)
  await expect(player).toHaveAttribute('src', /1iBOP4Gyfi8/)
  await expect(
    page.getByRole('button', { name: playName(0), exact: true }),
  ).toBeVisible()

  // The portrait frame must not push the page sideways at 390px.
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true)
})

test('mobile: closing a player restores the poster and the Play control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const play = page.getByRole('button', { name: playName(0), exact: true })
  await play.scrollIntoViewIfNeeded()
  await play.click()
  await expect(page.locator('#featured iframe')).toHaveCount(1)

  await page
    .getByRole('button', {
      name: `${en.featured.closePlayer} — ${shortTitle(0)}`,
      exact: true,
    })
    .click()

  await expect(page.locator('#featured iframe')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: playName(0), exact: true }),
  ).toBeVisible()
  // The poster is back: three stories, three local images, no embed.
  await expect(page.locator('#featured img')).toHaveCount(3)
})

test('desktop: the player is confined to its media frame and never covers the headline', async ({
  page,
}) => {
  await page.goto('/')
  // Park the pinned TRACK at the viewport top. That is where the pin starts
  // and the rail is still at x = 0, so panel 1 is squarely in frame and the
  // measurement below is taken against its own headline rather than against a
  // half-finished transition between two panels.
  await page.evaluate(() => {
    const track = document.querySelector('#featured [class*="track"]')!
    window.scrollTo(0, window.scrollY + track.getBoundingClientRect().top)
  })
  await page.waitForTimeout(1200)

  const firstPanel = page.locator('#featured [data-panel]').first()
  await firstPanel.getByRole('button', { name: playName(0) }).click()

  const player = page.locator('#featured iframe')
  await expect(player).toHaveCount(1)

  const overlap = await page.evaluate(() => {
    const iframe = document.querySelector('#featured iframe')!
    const frame = iframe.closest('[data-media-frame]')!
    const panel = iframe.closest('[data-panel]')!
    const headline = panel.querySelector('h3')!
    const support = panel.querySelector('h3 + p')!
    const r = (el: Element) => el.getBoundingClientRect()
    const cross = (a: DOMRect, b: DOMRect) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
    const pr = r(iframe)
    const fr = r(frame)
    return {
      // The player fills its frame and nothing more.
      escapesFrame: +Math.max(
        0,
        fr.left - pr.left,
        pr.right - fr.right,
        fr.top - pr.top,
        pr.bottom - fr.bottom,
      ).toFixed(1),
      // ...and the frame is nowhere near the copy.
      overHeadline: cross(pr, r(headline)),
      overSupport: cross(pr, r(support)),
      // The panel is not one big video: how much of it the player covers.
      panelShare: +(
        (pr.width * pr.height) /
        (r(panel).width * r(panel).height)
      ).toFixed(3),
    }
  })

  expect(overlap.escapesFrame).toBeLessThanOrEqual(0.5)
  expect(overlap.overHeadline).toBe(0)
  expect(overlap.overSupport).toBe(0)
  // Editorial, not a wall of YouTube.
  expect(overlap.panelShare).toBeLessThan(0.25)
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
  await primaryNav(page)
    .getByRole('link', { name: /^systems$/i })
    .click()
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

  await primaryNav(page)
    .getByRole('link', { name: /^content$/i })
    .click()
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
    page
      .getByRole('navigation', { name: fr.a11y.primaryNavigation })
      .getByRole('link', { name: fr.nav.sections[0], exact: true }),
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
    await primaryNav(page)
      .getByRole('link', { name: en.nav.about, exact: true })
      .focus()
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
    // The BAR's own links — the footer has a `nav ul a` row too now, and it
    // sits far below; including it would weaken this assertion to nothing.
    // Both navs carry an aria-label, so the footer is excluded explicitly.
    const barLinks = [...document.querySelectorAll('nav ul a')].filter(
      (a) => !a.closest('footer'),
    )
    for (const link of barLinks) {
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
    primaryNav(page).getByRole('link', { name: 'Work', exact: true }),
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

/* ------------------------------------------------------------------ *
 * Responsive QA — the narrow-desktop nav band (1024–1239)
 *
 * `.nav` is position:fixed, so anything the bar pushes past the end never
 * reaches documentElement.scrollWidth — the language button sat 25px OFF the
 * right edge of a 1024px viewport in French while every page-overflow check
 * read clean. Asserted against the viewport and the bar's own padding box,
 * plus glyph ink for the identity/link collision in the same band.
 * ------------------------------------------------------------------ */

/** Every nav control's box, plus the bar's content box, in one round trip. */
async function barGeometry(page: Page) {
  return page.evaluate(() => {
    const nav = document.querySelector('nav')!
    const bar = nav.firstElementChild as HTMLElement
    const cs = getComputedStyle(bar)
    const barRect = bar.getBoundingClientRect()
    const ink = (el: Element) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      const rects = [...range.getClientRects()]
      return {
        left: Math.min(...rects.map((r) => r.left)),
        right: Math.max(...rects.map((r) => r.right)),
      }
    }
    const controls = [
      ...nav.querySelectorAll<HTMLElement>('a[href], button[aria-haspopup]'),
    ]
    const links = [...nav.querySelectorAll('ul a')]
    const wordmark = nav.querySelector('a[href="#hero"]')!
    return {
      viewportWidth: document.documentElement.clientWidth,
      contentLeft: barRect.left + parseFloat(cs.paddingLeft),
      contentRight: barRect.right - parseFloat(cs.paddingRight),
      controls: controls.map((el) => {
        const r = el.getBoundingClientRect()
        return {
          name: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim(),
          left: r.left,
          right: r.right,
        }
      }),
      identityToFirstLink: ink(links[0]).left - ink(wordmark).right,
    }
  })
}

for (const language of ['en', 'fr', 'es'] as const) {
  test(`${language} @ 1024x768: every nav control stays inside the bar`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.addInitScript((lang) => {
      window.localStorage.setItem('carterpcs-language', lang)
    }, language)
    await page.goto('/')

    const bar = await barGeometry(page)

    for (const control of bar.controls) {
      expect(
        control.right,
        `"${control.name}" runs off the right of the viewport`,
      ).toBeLessThanOrEqual(bar.viewportWidth)
      expect(
        control.right,
        `"${control.name}" runs past the bar's padding edge`,
      ).toBeLessThanOrEqual(bar.contentRight + 0.5)
      expect(
        control.left,
        `"${control.name}" runs off the left`,
      ).toBeGreaterThanOrEqual(bar.contentLeft - 0.5)
    }

    // Glyph ink, not the inline box: side bearings mean overlapping boxes are
    // not by themselves overlapping letters, and vice versa.
    expect(
      bar.identityToFirstLink,
      'the wordmark collides with the first section link',
    ).toBeGreaterThan(8)
  })
}

test('the approved 1240+ bar geometry keeps its optical centre-shift', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1240, height: 800 })
  await page.goto('/')

  // The shift is calibrated on the 1536 frame and must still be in force from
  // 1240 up — it is only held back below it.
  const shift = await page.evaluate(
    () => getComputedStyle(document.querySelector('nav ul')!).translate,
  )
  expect(shift).not.toBe('none')
})

/* ------------------------------------------------------------------ *
 * Responsive QA — light theme
 *
 * The Hero's light-mode overrides were scoped by a `.hero` class that CSS
 * Modules hashes away, so they matched nothing: the section kept its
 * hard-coded near-black environment while every text token flipped to
 * near-black. Asserted as measured luminance and contrast, not by eye.
 * ------------------------------------------------------------------ */

type Rgb = [number, number, number]

const relativeLuminance = (rgb: Rgb) => {
  const channel = (value: number) => {
    const v = value / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return (
    0.2126 * channel(rgb[0]) +
    0.7152 * channel(rgb[1]) +
    0.0722 * channel(rgb[2])
  )
}

const contrastRatio = (a: Rgb, b: Rgb) => {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)]
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

test('light theme: the Hero renders on a light ground, not the dark one', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP)
  await page.addInitScript(() => {
    window.localStorage.setItem('carterpcs-theme', 'light')
  })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  // Sampled from rendered pixels rather than from the stylesheet, so a rule
  // that silently matches nothing cannot pass this.
  const shot = await page.locator('#hero').screenshot()
  const sample = (await page.evaluate(
    async (bytes) => {
      const blob = new Blob([new Uint8Array(bytes)], { type: 'image/png' })
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d')!
      context.drawImage(bitmap, 0, 0)
      // Top-left corner of the Hero — environment only, no type over it.
      const { data } = context.getImageData(4, 4, 1, 1)
      return [data[0], data[1], data[2]]
    },
    [...shot],
  )) as Rgb

  expect(
    relativeLuminance(sample),
    `Hero environment rendered as rgb(${sample.join(',')}) in light mode`,
  ).toBeGreaterThan(0.5)
})

test('light theme: the primary Hero CTA label is readable on its pill', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP)
  await page.addInitScript(() => {
    window.localStorage.setItem('carterpcs-theme', 'light')
  })
  await page.goto('/')

  const measured = await page.evaluate(() => {
    const cta = document.querySelector<HTMLElement>(
      '#hero a[href="#content-universe"]',
    )!
    const parse = (value: string) =>
      value
        .match(/\d+(\.\d+)?/g)!
        .slice(0, 3)
        .map(Number)
    const style = getComputedStyle(cta)
    return {
      color: parse(style.color),
      background: parse(style.backgroundColor),
    }
  })

  expect(
    contrastRatio(measured.color as Rgb, measured.background as Rgb),
    'the primary CTA label does not meet 4.5:1 against its own pill',
  ).toBeGreaterThanOrEqual(4.5)
})

/* ------------------------------------------------------------------ *
 * Responsive QA — target size (WCAG 2.2 AA, SC 2.5.8)
 *
 * The six section labels set a 17px line box. The area is enlarged with an
 * overlay rather than padding, so the element's own rect still reports 17px —
 * this asserts what the browser actually hit-tests.
 * ------------------------------------------------------------------ */

test('mobile: nav section links meet the 24px minimum target size', async ({
  page,
}) => {
  await page.setViewportSize(MOBILE)
  await page.goto('/')

  const targets = await page.evaluate(() => {
    const hits = (el: Element, x: number, y: number) => {
      const found = document.elementFromPoint(x, y)
      return !!found && (found === el || el.contains(found))
    }
    // Scoped to the bar: the footer now has a `nav ul a` row of its own,
    // and both navs carry an aria-label — so exclude the footer explicitly.
    return [...document.querySelectorAll('nav ul a')]
      .filter((a) => !a.closest('footer'))
      .map((el) => {
        const r = el.getBoundingClientRect()
        const [cx, cy] = [r.left + r.width / 2, r.top + r.height / 2]
        let up = 0
        let down = 0
        while (up < 20 && hits(el, cx, cy - (up + 1))) up += 1
        while (down < 20 && hits(el, cx, cy + (down + 1))) down += 1
        return { name: el.textContent, height: up + down, width: r.width }
      })
  })

  expect(targets).toHaveLength(6)
  for (const target of targets) {
    expect(
      target.height,
      `"${target.name}" target height`,
    ).toBeGreaterThanOrEqual(24)
    expect(
      target.width,
      `"${target.name}" target width`,
    ).toBeGreaterThanOrEqual(24)
  }
})

/* ------------------------------------------------------------------ *
 * Closing statement (06)
 *
 * The site's last beat, directly after Content Universe. Nothing here
 * anticipates the footer, which is a separate task.
 * ------------------------------------------------------------------ */

const DICTIONARIES = { en, fr, es } as const

for (const language of ['en', 'fr', 'es'] as const) {
  test(`${language}: the Closing section renders its statement and returns to the Hero`, async ({
    page,
  }) => {
    const dictionary = DICTIONARIES[language]
    await page.setViewportSize(DESKTOP)
    await page.addInitScript((lang) => {
      window.localStorage.setItem('carterpcs-language', lang)
    }, language)
    await page.goto('/')

    const closing = page.locator('#closing')
    await closing.scrollIntoViewIfNeeded()
    // The reveal is one-shot; the resting state is what matters.
    await page.waitForTimeout(1600)

    // Directly after Content Universe.
    expect(
      await page.evaluate(
        () =>
          document.querySelector('#content-universe')?.nextElementSibling?.id,
      ),
    ).toBe('closing')

    // The identity is a proper noun and reads the same in every language.
    await expect(closing.getByText('CarterPCs', { exact: true })).toBeVisible()
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: `${dictionary.closing.headlineLineOne} ${dictionary.closing.headlineLineTwo}`,
      }),
    ).toBeVisible()
    await expect(
      closing.getByText(dictionary.closing.disclaimerLineOne),
    ).toBeVisible()
    await expect(
      closing.getByText(dictionary.closing.disclaimerLineTwo),
    ).toBeVisible()

    // Every revealed element settles fully visible with no cropping rectangle
    // left behind — the entrance tween states both ends explicitly precisely
    // so this cannot regress (see Closing.tsx).
    const resting = await page.evaluate(() =>
      [
        ...document.querySelectorAll(
          '#closing [data-reveal], #closing [data-headline-line]',
        ),
      ].map((el) => ({
        text: (el.textContent ?? '').trim().slice(0, 20),
        opacity: getComputedStyle(el).opacity,
        clip: (el as HTMLElement).style.clipPath || '',
      })),
    )
    expect(resting).toHaveLength(5)
    for (const item of resting) {
      expect(item.opacity, `"${item.text}" never became visible`).toBe('1')
      expect(item.clip, `"${item.text}" kept a clip-path`).toBe('')
    }

    // Back to top actually goes back to the top.
    const backToTop = closing.getByRole('link', {
      name: dictionary.closing.backToTop,
    })
    await expect(backToTop).toHaveAttribute('href', '#hero')
    await backToTop.click()
    await page.waitForTimeout(1500)
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(0)
    await expect(page).toHaveURL(/#hero$/)
  })
}

for (const width of [320, 390]) {
  test(`mobile @ ${width}px: the Closing section fits without overflow in every language`, async ({
    page,
  }) => {
    for (const language of ['en', 'fr', 'es'] as const) {
      await page.setViewportSize({ width, height: 844 })
      await page.addInitScript((lang) => {
        window.localStorage.setItem('carterpcs-language', lang)
      }, language)
      await page.goto('/')

      await page.locator('#closing').scrollIntoViewIfNeeded()
      await page.waitForTimeout(1600)

      const measured = await page.evaluate(() => {
        const section = document.querySelector('#closing')!
        const canvas = section.querySelector('[class*="canvas"]')!
        const cs = getComputedStyle(canvas)
        const box = canvas.getBoundingClientRect()
        const [padLeft, padRight] = [
          parseFloat(cs.paddingLeft),
          parseFloat(cs.paddingRight),
        ]
        let worst = -Infinity
        // Copy only: the section numeral is a decorative bleed by design.
        for (const el of section.querySelectorAll('h2 span, p, p span, a')) {
          if (!el.textContent?.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(el)
          const rects = [...range.getClientRects()]
          if (!rects.length) continue
          worst = Math.max(
            worst,
            Math.max(...rects.map((r) => r.right)) - (box.right - padRight),
            box.left + padLeft - Math.min(...rects.map((r) => r.left)),
          )
        }
        return {
          pastCanvas: worst,
          overflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        }
      })

      expect(
        measured.pastCanvas,
        `${language} copy runs outside the canvas at ${width}px`,
      ).toBeLessThanOrEqual(0.5)
      expect(measured.overflow).toBe(false)
    }
  })
}

test('light theme: the Closing copy meets AA contrast on its own ground', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP)
  await page.addInitScript(() => {
    window.localStorage.setItem('carterpcs-theme', 'light')
  })
  await page.goto('/')
  await page.locator('#closing').scrollIntoViewIfNeeded()
  await page.waitForTimeout(1600)

  const samples = await page.evaluate(() => {
    const parse = (value: string) =>
      value
        .match(/\d+(\.\d+)?/g)!
        .slice(0, 3)
        .map(Number) as [number, number, number]
    const body = parse(getComputedStyle(document.body).backgroundColor)
    return [
      ...document.querySelectorAll('#closing h2, #closing p, #closing a'),
    ].map((el) => {
      const style = getComputedStyle(el)
      return {
        text: (el.textContent ?? '').trim().slice(0, 24),
        size: parseFloat(style.fontSize),
        weight: parseInt(style.fontWeight, 10) || 400,
        color: parse(style.color),
        background: body,
      }
    })
  })

  expect(samples.length).toBeGreaterThan(0)
  for (const sample of samples) {
    const large =
      sample.size >= 24 || (sample.size >= 18.66 && sample.weight >= 700)
    expect(
      contrastRatio(sample.color as Rgb, sample.background as Rgb),
      `"${sample.text}" contrast`,
    ).toBeGreaterThanOrEqual(large ? 3 : 4.5)
  }
})

test('reduced motion: the Closing section is fully present with no animation left running', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize(MOBILE)
  await page.goto('/')

  await page.locator('#closing').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)

  const state = await page.evaluate(() => {
    const section = document.querySelector('#closing')!
    return {
      stranded: [...section.querySelectorAll('h2, p, a, span')]
        .filter((el) => el.textContent?.trim())
        .filter((el) => {
          const style = getComputedStyle(el)
          return (
            parseFloat(style.opacity) < 0.99 ||
            style.visibility === 'hidden' ||
            !!(el as HTMLElement).style.clipPath
          )
        }).length,
      backToTop: !!section.querySelector('a[href="#hero"]'),
    }
  })

  expect(state.stranded).toBe(0)
  expect(state.backToTop).toBe(true)
})

/* ------------------------------------------------------------------ *
 * Footer
 *
 * The site's last row, after the Closing statement. Exactly nine links: the
 * bar's six destinations and the three supplied social profiles.
 * ------------------------------------------------------------------ */

const SOCIAL = [
  ['YouTube', 'https://www.youtube.com/@actuallycarterpcs'],
  ['Instagram', 'https://www.instagram.com/carterpcs_/?hl=en'],
  ['TikTok', 'https://www.tiktok.com/@carterpcs?lang=en'],
] as const

for (const language of ['en', 'fr', 'es'] as const) {
  test(`${language}: the Footer renders its destinations, platforms and copy`, async ({
    page,
  }) => {
    const dictionary = DICTIONARIES[language]
    await page.setViewportSize(DESKTOP)
    await page.addInitScript((lang) => {
      window.localStorage.setItem('carterpcs-language', lang)
    }, language)
    await page.goto('/')

    const footer = page.getByRole('contentinfo')
    await footer.scrollIntoViewIfNeeded()

    // After the Closing section, and outside main.
    expect(
      await page.evaluate(() => {
        const el = document.querySelector('footer')!
        const closing = document.querySelector('#closing')!
        return {
          follows:
            closing.compareDocumentPosition(el) ===
            Node.DOCUMENT_POSITION_FOLLOWING,
          outsideMain: !el.closest('main'),
        }
      }),
    ).toEqual({ follows: true, outsideMain: true })

    const footerNav = footer.getByRole('navigation', {
      name: dictionary.footer.a11y.footerNavigation,
    })
    await expect(footerNav.getByRole('link')).toHaveCount(6)
    for (const label of dictionary.nav.sections) {
      await expect(
        footerNav.getByRole('link', { name: label, exact: true }),
      ).toBeVisible()
    }

    // Copy, in this language.
    await expect(
      footer.getByText(`© 2026 ${dictionary.footer.copyright}`),
    ).toBeVisible()
    await expect(footer.getByText(dictionary.footer.disclaimer)).toBeVisible()

    // Stated once: the footer does not repeat the Closing statement's
    // "Independent creative concept." line above it.
    await expect(
      footer.getByText(dictionary.closing.disclaimerLineOne),
    ).toHaveCount(0)

    // Exactly the three supplied destinations, opened safely, with the
    // new-tab warning appended AFTER the visible platform name.
    for (const [name, href] of SOCIAL) {
      const link = footer.getByRole('link', {
        name: `${name} — ${dictionary.footer.a11y.opensInNewTab}`,
        exact: true,
      })
      await expect(link).toHaveAttribute('href', href)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', 'noreferrer')
      await expect(link).toContainText(name)
    }
  })
}

test('the Footer links nowhere it was not told to, and claims nothing', async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP)
  await page.goto('/')
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded()

  const audit = await page.evaluate(() => {
    const footer = document.querySelector('footer')!
    const links = [...footer.querySelectorAll('a')]
    const external = links.filter((a) =>
      a.getAttribute('href')!.startsWith('http'),
    )
    return {
      total: links.length,
      internal: links.filter((a) => a.getAttribute('href')!.startsWith('#'))
        .length,
      hosts: external.map((a) => new URL(a.href).hostname),
      unsafe: external.filter(
        (a) =>
          a.getAttribute('target') !== '_blank' ||
          !(a.getAttribute('rel') ?? '').includes('noreferrer'),
      ).length,
      controls: footer.querySelectorAll('button, form, input').length,
      contact: /mailto:|tel:/i.test(footer.innerHTML),
      digits: (footer.innerText.match(/\d+/g) ?? []).join(','),
    }
  })

  expect(audit).toEqual({
    total: 9,
    internal: 6,
    hosts: ['www.youtube.com', 'www.instagram.com', 'www.tiktok.com'],
    unsafe: 0,
    controls: 0,
    contact: false,
    // The copyright year is the only figure the footer states.
    digits: '2026',
  })
})

for (const width of [320, 390]) {
  test(`mobile @ ${width}px: the Footer fits, with no overlap and 24px targets`, async ({
    page,
  }) => {
    for (const language of ['en', 'fr', 'es'] as const) {
      await page.setViewportSize({ width, height: 844 })
      await page.addInitScript((lang) => {
        window.localStorage.setItem('carterpcs-language', lang)
      }, language)
      await page.goto('/')
      await page.getByRole('contentinfo').scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)

      const measured = await page.evaluate(() => {
        const footer = document.querySelector('footer')!
        const canvas = footer.querySelector('[class*="canvas"]')!
        const cs = getComputedStyle(canvas)
        const box = canvas.getBoundingClientRect()
        const [padLeft, padRight] = [
          parseFloat(cs.paddingLeft),
          parseFloat(cs.paddingRight),
        ]
        const links = [...footer.querySelectorAll('a')]

        let pastCanvas = -Infinity
        for (const el of footer.querySelectorAll('a, p, p span')) {
          if (!el.textContent?.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(el)
          const rects = [...range.getClientRects()]
          if (!rects.length) continue
          pastCanvas = Math.max(
            pastCanvas,
            Math.max(...rects.map((r) => r.right)) - (box.right - padRight),
            box.left + padLeft - Math.min(...rects.map((r) => r.left)),
          )
        }

        let overlaps = 0
        for (let i = 0; i < links.length; i += 1) {
          for (let j = i + 1; j < links.length; j += 1) {
            const [a, b] = [
              links[i].getBoundingClientRect(),
              links[j].getBoundingClientRect(),
            ]
            if (
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5
            )
              overlaps += 1
          }
        }

        return {
          pastCanvas,
          overlaps,
          smallest: Math.min(
            ...links.map((a) => {
              const r = a.getBoundingClientRect()
              return Math.min(r.width, r.height)
            }),
          ),
          overflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        }
      })

      expect(
        measured.pastCanvas,
        `${language} footer copy runs outside the canvas at ${width}px`,
      ).toBeLessThanOrEqual(0.5)
      expect(measured.overlaps, 'footer links overlap').toBe(0)
      expect(
        measured.smallest,
        'smallest footer target',
      ).toBeGreaterThanOrEqual(24)
      expect(measured.overflow).toBe(false)
    }
  })
}

test('light theme: the Footer copy meets AA contrast', async ({ page }) => {
  await page.setViewportSize(DESKTOP)
  await page.addInitScript(() => {
    window.localStorage.setItem('carterpcs-theme', 'light')
  })
  await page.goto('/')
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded()

  const samples = await page.evaluate(() => {
    const parse = (value: string) =>
      value
        .match(/\d+(\.\d+)?/g)!
        .slice(0, 3)
        .map(Number)
    const background = parse(getComputedStyle(document.body).backgroundColor)
    return [...document.querySelectorAll('footer a, footer p')].map((el) => {
      const style = getComputedStyle(el)
      return {
        text: (el.textContent ?? '').trim().slice(0, 24),
        size: parseFloat(style.fontSize),
        color: parse(style.color),
        background,
      }
    })
  })

  expect(samples.length).toBeGreaterThan(0)
  for (const sample of samples) {
    expect(
      contrastRatio(sample.color as Rgb, sample.background as Rgb),
      `"${sample.text}" contrast`,
    ).toBeGreaterThanOrEqual(4.5)
  }
})

test('reduced motion: the Footer carries no animation at all', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize(MOBILE)
  await page.goto('/')
  await page.getByRole('contentinfo').scrollIntoViewIfNeeded()

  const state = await page.evaluate(() => {
    const footer = document.querySelector('footer')!
    return {
      // Nothing animates it, so nothing should have written an inline style.
      inlineStyled: [...footer.querySelectorAll('*')].filter((el) =>
        el.getAttribute('style'),
      ).length,
      notVisible: [...footer.querySelectorAll('a, p, span')]
        .filter((el) => el.textContent?.trim())
        .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99).length,
    }
  })

  expect(state).toEqual({ inlineStyled: 0, notVisible: 0 })
})
