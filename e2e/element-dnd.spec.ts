import { test, expect } from '@playwright/test'

test('Element Library panel is visible by default', async ({ page }) => {
  await page.goto('/wp-admin/admin.php?page=nivorax')

  const firstPageLink = page.locator('table.wp-list-table tbody tr:first-child td:first-child a')
  await expect(firstPageLink).toBeVisible()
  await firstPageLink.click()

  await expect(page.locator('[data-testid="canvas-iframe"]')).toBeAttached()

  // The Elements button should be present in the activity bar
  await expect(page.locator('[data-testid="rail-btn-elements"]')).toBeVisible()

  // The left panel host should be visible (elements panel is default)
  await expect(page.locator('[data-testid="left-panel-host"]')).toBeVisible()

  // Element cards should be visible in the panel
  await expect(page.locator('[data-testid="element-card-section"]')).toBeVisible()
  await expect(page.locator('[data-testid="element-card-container"]')).toBeVisible()
  await expect(page.locator('[data-testid="element-card-heading"]')).toBeVisible()
  await expect(page.locator('[data-testid="element-card-text"]')).toBeVisible()
})

test('Activity bar toggles left panel open/closed', async ({ page }) => {
  await page.goto('/wp-admin/admin.php?page=nivorax')
  const firstPageLink = page.locator('table.wp-list-table tbody tr:first-child td:first-child a')
  await firstPageLink.click()
  await expect(page.locator('[data-testid="canvas-iframe"]')).toBeAttached()

  const elementsBtn = page.locator('[data-testid="rail-btn-elements"]')

  // Panel is open by default — clicking the active icon collapses it
  await elementsBtn.click()
  await expect(page.locator('[data-testid="left-panel-host"]')).not.toBeVisible()

  // Clicking again re-opens it
  await elementsBtn.click()
  await expect(page.locator('[data-testid="left-panel-host"]')).toBeVisible()
})

test('Navigator button switches to the navigator panel', async ({ page }) => {
  await page.goto('/wp-admin/admin.php?page=nivorax')
  const firstPageLink = page.locator('table.wp-list-table tbody tr:first-child td:first-child a')
  await firstPageLink.click()
  await expect(page.locator('[data-testid="canvas-iframe"]')).toBeAttached()

  await page.locator('[data-testid="rail-btn-navigator"]').click()
  await expect(page.locator('[data-testid="left-panel-host"]')).toBeVisible()
  // Navigator placeholder text
  await expect(page.locator('[data-testid="left-panel-host"]')).toContainText('Navigator')
})

test('Element Library search filters elements', async ({ page }) => {
  await page.goto('/wp-admin/admin.php?page=nivorax')
  const firstPageLink = page.locator('table.wp-list-table tbody tr:first-child td:first-child a')
  await firstPageLink.click()
  await expect(page.locator('[data-testid="canvas-iframe"]')).toBeAttached()
  await expect(page.locator('[data-testid="left-panel-host"]')).toBeVisible()

  const search = page.getByRole('searchbox', { name: /search elements/i })
  await search.fill('text')

  // Only Text should be visible; Section should not
  await expect(page.locator('[data-testid="element-card-text"]')).toBeVisible()
  await expect(page.locator('[data-testid="element-card-section"]')).not.toBeVisible()
})
