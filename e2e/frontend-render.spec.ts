import { test, expect, type Page } from '@playwright/test'

/**
 * E2E: Front-end rendering — edit → publish → view on front end.
 *
 * Seeds a document via the REST API with a section that has a known
 * backgroundColor, publishes it (triggering CSS generation), then navigates
 * to the public front-end page and verifies:
 *   1. The scoped CSS class rule appears in the page <head>.
 *   2. The element HTML is rendered with the correct data-node-id attribute.
 */

const TEST_COLOR = '#c0392b'
const SECTION_ID = 'fe-section'
const HEADING_ID = 'fe-heading'

async function openEditor(page: Page) {
  await page.goto('/wp-admin/admin.php?page=nivorax')

  const firstPageLink = page.locator('table.wp-list-table tbody tr:first-child td:first-child a')
  await expect(firstPageLink).toBeVisible()
  await firstPageLink.click()

  await expect(page.locator('#nivorax-editor-root')).toBeAttached()
  await expect(page.locator('[data-testid="canvas-iframe"]')).toBeAttached()
}

async function seedAndPublish(page: Page) {
  const bootstrap = await page.evaluate(
    () => (window as Window & { nivoraxBootstrap?: { postId: number; restRoot: string; restNonce: string } }).nivoraxBootstrap,
  )
  expect(bootstrap?.postId).toBeTruthy()
  expect(bootstrap?.restRoot).toBeTruthy()
  expect(bootstrap?.restNonce).toBeTruthy()

  const response = await page.request.put(
    `${bootstrap!.restRoot}nivorax/v1/documents/${bootstrap!.postId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': bootstrap!.restNonce,
      },
      data: {
        version: 1,
        tree: {
          rootId: 'fe-root',
          nodes: {
            'fe-root': {
              id: 'fe-root',
              type: '__root__',
              props: {},
              children: [SECTION_ID],
              overrides: {},
              meta: { name: 'Page' },
            },
            [SECTION_ID]: {
              id: SECTION_ID,
              type: 'section',
              props: { backgroundColor: TEST_COLOR },
              children: [HEADING_ID],
              overrides: {},
              meta: { name: 'Hero' },
            },
            [HEADING_ID]: {
              id: HEADING_ID,
              type: 'heading',
              props: { text: 'Front-end render test', level: 1 },
              children: [],
              overrides: {},
              meta: { name: 'Title' },
            },
          },
        },
        meta: { title: 'Front-end render test' },
        publish: true,
      },
    },
  )

  expect(response.status()).toBe(200)
  const body = await response.json() as { saved: boolean }
  expect(body.saved).toBe(true)

  return bootstrap!.postId
}

test('published NivoraX page renders scoped CSS and element HTML on front end', async ({
  page,
}) => {
  await openEditor(page)

  const postId = await seedAndPublish(page)

  // Navigate to the front-end page using the WordPress p= permalink.
  await page.goto(`/?p=${String(postId)}`)

  // 1. Scoped CSS rule should appear somewhere in the page <head>.
  //    CssPipeline enqueues a <link> or falls back to a <style> tag.
  //    We check that the color ends up in the page's stylesheet content.
  const styleContent = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets)
    try {
      const rules = sheets.flatMap((s) => {
        try {
          return Array.from(s.cssRules ?? [])
        } catch {
          return []
        }
      })
      return rules.map((r) => r.cssText).join('\n')
    } catch {
      return ''
    }
  })

  // Accept either the CSS class rule or an inline style containing the color.
  // The class selector is .nivorax-fe-section, the color must appear.
  const hasColor =
    styleContent.includes(`background-color: ${TEST_COLOR}`) ||
    styleContent.includes(`background-color:${TEST_COLOR}`)
  expect(hasColor, `Expected background-color ${TEST_COLOR} in page CSS`).toBe(true)

  // 2. The element HTML is rendered with correct data-node-id attribute.
  const sectionEl = page.locator(`[data-node-id="${SECTION_ID}"]`)
  await expect(sectionEl).toBeAttached()

  const headingEl = page.locator(`[data-node-id="${HEADING_ID}"]`)
  await expect(headingEl).toBeAttached()
  await expect(headingEl).toContainText('Front-end render test')
})

test('CSS link tag is present in front-end page <head> for a published NivoraX page', async ({
  page,
}) => {
  await openEditor(page)
  const postId = await seedAndPublish(page)

  await page.goto(`/?p=${String(postId)}`)

  // CssPipeline should enqueue a stylesheet or inline style.
  // Accept either a <link> with nivorax in the href, or an inline <style> tag.
  const hasNivoraxCss = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[]
    if (links.some((l) => l.href.includes('nivorax'))) return true
    const styles = Array.from(document.querySelectorAll('style')) as HTMLStyleElement[]
    return styles.some((s) => s.textContent?.includes('nivorax'))
  })

  expect(hasNivoraxCss, 'Expected NivoraX stylesheet or <style> tag in page <head>').toBe(true)
})
