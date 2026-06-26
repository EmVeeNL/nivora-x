import { test, expect, type Page, type APIRequestContext } from '@playwright/test'

/**
 * E2E: Theme builder happy path.
 *
 * Builds a header + footer + single template, gives them site-wide display
 * conditions, seeds the current page's body, then loads the page on the front
 * end and asserts the header, the single template's content slot (showing the
 * page body), and the footer all render — proving the template-hierarchy
 * override composes a themed page.
 */

interface Bootstrap {
  postId: number
  restRoot: string
  restNonce: string
}

interface TemplateSummary {
  id: number
  editUrl: string
}

async function openEditor(page: Page): Promise<Bootstrap> {
  await page.goto('/wp-admin/admin.php?page=nivorax')
  const firstPageLink = page.locator('table.wp-list-table tbody tr:first-child td:first-child a')
  await expect(firstPageLink).toBeVisible()
  await firstPageLink.click()
  await expect(page.locator('#nivorax-editor-root')).toBeAttached()

  const bootstrap = await page.evaluate(
    () => (window as Window & { nivoraxBootstrap?: Bootstrap }).nivoraxBootstrap,
  )
  expect(bootstrap?.postId).toBeTruthy()
  expect(bootstrap?.restNonce).toBeTruthy()
  return bootstrap!
}

function headers(bs: Bootstrap) {
  return { 'Content-Type': 'application/json', 'X-WP-Nonce': bs.restNonce }
}

/** A simple single-heading document tree. */
function headingTree(rootId: string, headingId: string, text: string) {
  return {
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        type: '__root__',
        props: {},
        children: [headingId],
        overrides: {},
        meta: { name: 'Root' },
      },
      [headingId]: {
        id: headingId,
        type: 'heading',
        props: { text, level: 2 },
        children: [],
        overrides: {},
        meta: { name: 'Heading' },
      },
    },
  }
}

async function createTemplate(
  req: APIRequestContext,
  bs: Bootstrap,
  type: string,
  title: string,
): Promise<TemplateSummary> {
  const res = await req.post(`${bs.restRoot}nivorax/v1/templates`, {
    headers: headers(bs),
    data: { type, title },
  })
  expect(res.status()).toBe(200)
  const body = (await res.json()) as { template: TemplateSummary }
  return body.template
}

async function seedDocument(
  req: APIRequestContext,
  bs: Bootstrap,
  postId: number,
  tree: unknown,
) {
  const res = await req.put(`${bs.restRoot}nivorax/v1/documents/${postId}`, {
    headers: headers(bs),
    data: { version: 1, tree, meta: {}, publish: true },
  })
  expect(res.status()).toBe(200)
}

async function setSiteWideConditions(req: APIRequestContext, bs: Bootstrap, templateId: number) {
  const res = await req.put(`${bs.restRoot}nivorax/v1/templates/${templateId}/conditions`, {
    headers: headers(bs),
    data: { conditions: [{ behavior: 'include', object: 'entire_site', value: '' }] },
  })
  expect(res.status()).toBe(200)
}

test('header + footer + single template compose a themed page on the front end', async ({
  page,
}) => {
  const bs = await openEditor(page)
  const req = page.request

  // 1. Build the three templates.
  const header = await createTemplate(req, bs, 'header', 'E2E Header')
  const footer = await createTemplate(req, bs, 'footer', 'E2E Footer')
  const single = await createTemplate(req, bs, 'single', 'E2E Single')

  // 2. Seed their documents.
  await seedDocument(req, bs, header.id, headingTree('h-root', 'h-head', 'SITE HEADER NX'))
  await seedDocument(req, bs, footer.id, headingTree('f-root', 'f-head', 'SITE FOOTER NX'))

  // Single template: a section wrapping the post content slot.
  await seedDocument(req, bs, single.id, {
    rootId: 's-root',
    nodes: {
      's-root': {
        id: 's-root',
        type: '__root__',
        props: {},
        children: ['s-slot'],
        overrides: {},
        meta: { name: 'Root' },
      },
      's-slot': {
        id: 's-slot',
        type: 'content-slot',
        props: {},
        children: [],
        overrides: {},
        meta: { name: 'Content' },
      },
    },
  })

  // 3. Assign all three site-wide.
  await setSiteWideConditions(req, bs, header.id)
  await setSiteWideConditions(req, bs, footer.id)
  await setSiteWideConditions(req, bs, single.id)

  // 4. Seed the current page's own body (renders inside the content slot).
  await seedDocument(req, bs, bs.postId, headingTree('p-root', 'p-head', 'PAGE BODY NX'))

  // 5. View the page on the front end.
  await page.goto(`/?page_id=${String(bs.postId)}`)

  // Header, content slot (page body), and footer all render.
  await expect(page.locator('.nivorax-template-root')).toBeAttached()
  await expect(page.getByText('SITE HEADER NX')).toBeVisible()
  await expect(page.getByText('PAGE BODY NX')).toBeVisible()
  await expect(page.getByText('SITE FOOTER NX')).toBeVisible()

  // The content slot wrapper is present.
  await expect(page.locator('[data-nivorax-slot="content"]')).toBeAttached()
})
