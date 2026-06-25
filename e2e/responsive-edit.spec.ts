import { test, expect, type Page } from '@playwright/test'

async function openEditor(page: Page) {
  await page.goto('/wp-admin/admin.php?page=nivorax')

  const firstPageLink = page.locator('table.wp-list-table tbody tr:first-child td:first-child a')
  await expect(firstPageLink).toBeVisible()
  await firstPageLink.click()

  await expect(page.locator('#nivorax-editor-root')).toBeAttached()
  await expect(page.locator('[data-testid="canvas-iframe"]')).toBeAttached()
}

async function seedResponsiveFixture(page: Page) {
  const bootstrap = await page.evaluate(() => window.nivoraxBootstrap)
  expect(bootstrap?.postId).toBeTruthy()
  expect(bootstrap?.restRoot).toBeTruthy()
  expect(bootstrap?.restNonce).toBeTruthy()

  await page.request.put(`${bootstrap!.restRoot}nivorax/v1/documents/${bootstrap!.postId}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': bootstrap!.restNonce,
    },
    data: {
      version: 1,
      tree: {
        rootId: 'e2e-root',
        nodes: {
          'e2e-root': {
            id: 'e2e-root',
            type: '__root__',
            props: {},
            children: ['e2e-section'],
            overrides: {},
            meta: { name: 'Page' },
          },
          'e2e-section': {
            id: 'e2e-section',
            type: 'section',
            props: {},
            children: [],
            overrides: {},
            meta: { name: 'Hero Section' },
          },
        },
      },
      meta: { title: 'Michael' },
      publish: false,
    },
  })

  await page.reload()
  await expect(page.locator('#nivorax-editor-root')).toBeAttached()
  await expect(page.locator('[data-testid="canvas-iframe"]')).toBeAttached()
}

async function getCanvasDisplay(page: Page) {
  return page.locator('[data-testid="canvas-iframe"]').evaluate((iframe) => {
    if (!(iframe instanceof HTMLIFrameElement)) return null
    const section = iframe.contentDocument?.querySelector(
      'section[data-node-id]',
    ) as HTMLElement | null
    return section ? getComputedStyle(section).display : null
  })
}

test('responsive edit flow preserves desktop base and preview/save actions coexist', async ({
  page,
}) => {
  await openEditor(page)
  await seedResponsiveFixture(page)

  const canvas = page.frameLocator('[data-testid="canvas-iframe"]')
  const section = canvas.locator('section[data-node-id]').first()
  await expect(section).toBeVisible()
  await section.click({ force: true })

  await expect(page.getByText('Section', { exact: true })).toBeVisible()

  const createTabletOverride = page.getByRole('button', { name: 'Create tablet override' }).first()
  const resetTabletOverride = page
    .getByRole('button', { name: 'Reset tablet to inherited value' })
    .first()
  const displaySelect = page.locator('label', { hasText: 'Display' }).locator('select')

  await page.getByRole('button', { name: 'Tablet' }).click({ force: true })
  await expect(page.getByTestId('canvas-breakpoint-label')).toContainText('768px')
  await expect(createTabletOverride).toBeVisible()

  await createTabletOverride.click({ force: true })
  await expect(resetTabletOverride).toBeVisible()
  await displaySelect.selectOption('flex')
  await expect.poll(() => getCanvasDisplay(page)).toBe('flex')

  await page.getByRole('button', { name: 'Desktop' }).click({ force: true })
  await expect(page.getByTestId('canvas-breakpoint-label')).toContainText('1440px')
  await expect.poll(() => getCanvasDisplay(page)).toBe('block')

  await page.getByRole('button', { name: 'Tablet' }).click({ force: true })
  await resetTabletOverride.click({ force: true })
  await expect(createTabletOverride).toBeVisible()
  await expect.poll(() => getCanvasDisplay(page)).toBe('block')

  await expect(page.getByTestId('autosave-indicator')).toContainText('Saved', { timeout: 10000 })

  await page.getByRole('button', { name: 'Preview page' }).click({ force: true })
  await expect(page.getByTestId('preview-mode')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exit preview' })).toBeVisible()
  await page.getByRole('button', { name: 'Exit preview' }).click({ force: true })
  await expect(page.getByTestId('region-toolbar')).toBeVisible()

  await createTabletOverride.click({ force: true })
  await displaySelect.selectOption('flex')
  await page.getByRole('button', { name: 'Save draft' }).click({ force: true })
  await expect(page.getByText('Draft saved')).toBeVisible()

  await page.getByRole('button', { name: 'Publish page' }).click({ force: true })
  await expect(page.getByText('Published')).toBeVisible()
})
