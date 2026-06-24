import { test, expect } from '@playwright/test'

test('NivoraX editor admin page loads', async ({ page }) => {
  await page.goto('/wp-admin/admin.php?page=nivorax-editor')

  // The mount node injected by EditorPage::render() must be present
  await expect(page.locator('#nivorax-editor-root')).toBeAttached()

  // The placeholder heading confirms the React bundle loaded
  await expect(page.locator('#nivorax-editor-placeholder h1')).toContainText('NivoraX Editor')
})
