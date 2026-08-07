import path from 'path'
import type { StorageState } from '@playwright/test'

export const authDir = path.join(__dirname, '..', '.auth')

export const testUserAuthFile = path.join(authDir, 'test-user.json')

export const transferUserAuthFile = path.join(authDir, 'transfer-user.json')

/** Clears project-level storage state for specs that exercise the login flow. */
export const emptyStorageState: StorageState = { cookies: [], origins: [] }
