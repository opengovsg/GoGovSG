import fs from 'fs'
import path from 'path'
import type { Page, StorageState } from '@playwright/test'
import { rootLocation } from './config'
import { gotoPage } from './navigation'

export const authDir = path.join(__dirname, '..', '.auth')

export const testUserAuthFile = path.join(authDir, 'test-user.json')

export const transferUserAuthFile = path.join(authDir, 'transfer-user.json')

/** Clears project-level storage state for specs that exercise the login flow. */
export const emptyStorageState: StorageState = { cookies: [], origins: [] }

/** Restore a saved session onto the current page (e.g. after logout). */
export async function restoreAuthState(
  page: Page,
  authFile: string,
): Promise<void> {
  const state = JSON.parse(fs.readFileSync(authFile, 'utf-8')) as StorageState

  await page.context().clearCookies()
  if (state.cookies.length > 0) {
    await page.context().addCookies(state.cookies)
  }

  for (const origin of state.origins ?? []) {
    await page.goto(origin.origin)
    if (origin.localStorage.length > 0) {
      await page.evaluate((items) => {
        for (const { name, value } of items) {
          window.localStorage.setItem(name, value)
        }
      }, origin.localStorage)
    }
  }

  await gotoPage(page, rootLocation)
}
