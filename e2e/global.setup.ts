import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const AUTH_FILE = path.join(import.meta.dirname, '.auth/admin.json')

const WP_URL        = process.env['WP_URL']           ?? 'http://localhost:8080'
const ADMIN_USER    = process.env['WP_ADMIN_USER']     ?? 'admin'
const ADMIN_PASS    = process.env['WP_ADMIN_PASSWORD'] ?? 'admin'

setup('authenticate as WP admin', async ({ page }) => {
  // Ensure auth dir exists
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  await page.goto(`${WP_URL}/wp-login.php`)
  await page.fill('#user_login', ADMIN_USER)
  await page.fill('#user_pass', ADMIN_PASS)
  await page.click('#wp-submit')
  await expect(page).toHaveURL(/wp-admin/)

  await page.context().storageState({ path: AUTH_FILE })
})
