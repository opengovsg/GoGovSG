import fs from 'fs'
import path from 'path'
import type { BrowserContext, Page } from '@playwright/test'

/**
 * `@playwright/test` exports no `StorageState` type, so derive it from the
 * method that produces it. Importing a non-existent name silently widened every
 * use of it below to `any`.
 */
type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>
import { rootLocation } from './config'
import { gotoPage } from './navigation'

export const authDir = path.join(__dirname, '..', '.auth')

/**
 * Storage state is keyed by browser because CI installs only the browser for
 * its matrix shard (`playwright install <browser>`). Each browser project
 * authenticates through its own setup project, so the login run never reaches
 * for a binary that shard did not install.
 */
export const testUserAuthFile = (browserName: string): string =>
  path.join(authDir, `${browserName}-test-user.json`)

export const transferUserAuthFile = (browserName: string): string =>
  path.join(authDir, `${browserName}-transfer-user.json`)

/** Clears project-level storage state for specs that exercise the login flow. */
export const emptyStorageState: StorageState = { cookies: [], origins: [] }

/**
 * Swap the current page onto a different saved session. Use this to change
 * accounts mid-test instead of signing out: /api/logout destroys the session
 * server-side, which would invalidate the storage state shared by every
 * later test.
 */
export async function restoreAuthState(
  page: Page,
  authFile: string,
): Promise<void> {
  const state = JSON.parse(fs.readFileSync(authFile, 'utf-8')) as StorageState

  await page.context().clearCookies()
  if (state.cookies.length > 0) {
    await page.context().addCookies(state.cookies)
  }

  // The app is single-origin, so every saved localStorage entry belongs to
  // rootLocation. Writing them in one pass avoids navigating per origin --
  // `announcement` in particular has to be in place before the user page
  // mounts, or the post-login modal reappears and swallows the next click.
  const storedItems = (state.origins ?? []).flatMap(
    (origin) => origin.localStorage,
  )

  await gotoPage(page, rootLocation)
  if (storedItems.length > 0) {
    await page.evaluate((items) => {
      items.forEach(({ name, value }) =>
        window.localStorage.setItem(name, value),
      )
    }, storedItems)
    await gotoPage(page, rootLocation)
  }
}
