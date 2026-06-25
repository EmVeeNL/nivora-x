import { test, expect } from '@playwright/test'

async function openEditor(page: import('@playwright/test').Page) {
  await page.goto('/wp-admin/admin.php?page=nivorax')

  const firstPageLink = page.locator('table.wp-list-table tbody tr:first-child td:first-child a')
  await expect(firstPageLink).toBeVisible()
  await firstPageLink.click()

  await expect(page.locator('[data-testid="canvas-iframe"]')).toBeAttached()
}

async function openElementsPanel(page: import('@playwright/test').Page) {
  const elementsBtn = page.locator('[data-testid="rail-btn-elements"]')
  await expect(elementsBtn).toBeVisible()
  await elementsBtn.click({ force: true })
  await expect(page.locator('[data-testid="left-panel-host"]')).toContainText('Elements')
}

test('Element Library panel opens from the rail', async ({ page }) => {
  await openEditor(page)

  // The Elements button should be present in the activity bar
  await expect(page.locator('[data-testid="rail-btn-elements"]')).toBeVisible()

  // Navigator is the current default panel; switch to Elements before asserting cards.
  await expect(page.locator('[data-testid="left-panel-host"]')).toBeVisible()
  await expect(page.locator('[data-testid="left-panel-host"]')).toContainText('Navigator')
  await openElementsPanel(page)

  // Element cards should be visible in the panel
  await expect(page.locator('[data-testid="element-card-section"]')).toBeVisible()
  await expect(page.locator('[data-testid="element-card-container"]')).toBeVisible()
  await expect(page.locator('[data-testid="element-card-heading"]')).not.toBeVisible()
  await expect(page.locator('[data-testid="element-card-text"]')).not.toBeVisible()

  await page.getByRole('button', { name: /content/i }).click({ force: true })
  await expect(page.locator('[data-testid="element-card-heading"]')).toBeVisible()
  await expect(page.locator('[data-testid="element-card-text"]')).toBeVisible()
})

test('Activity bar toggles left panel open/closed', async ({ page }) => {
  await openEditor(page)
  await openElementsPanel(page)

  const elementsBtn = page.locator('[data-testid="rail-btn-elements"]')

  // Panel is open by default — clicking the active icon collapses it
  await elementsBtn.click({ force: true })
  await expect(page.locator('[data-testid="left-panel-host"]')).not.toBeVisible()

  // Clicking again re-opens it
  await elementsBtn.click({ force: true })
  await expect(page.locator('[data-testid="left-panel-host"]')).toBeVisible()
})

test('Navigator button switches to the navigator panel', async ({ page }) => {
  await openEditor(page)
  await openElementsPanel(page)

  await page.locator('[data-testid="rail-btn-navigator"]').click({ force: true })
  await expect(page.locator('[data-testid="left-panel-host"]')).toBeVisible()
  await expect(page.locator('[data-testid="left-panel-host"]')).toContainText('Navigator')
})

test('Element Library search filters elements', async ({ page }) => {
  await openEditor(page)
  await openElementsPanel(page)

  const search = page.getByRole('searchbox', { name: /search elements/i })
  await search.fill('text')
  await page.getByRole('button', { name: /content/i }).click({ force: true })

  // Only Text should be visible; Section should not
  await expect(page.locator('[data-testid="element-card-text"]')).toBeVisible()
  await expect(page.locator('[data-testid="element-card-section"]')).not.toBeVisible()
})
