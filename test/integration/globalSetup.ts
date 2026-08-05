import 'reflect-metadata'
import fetch from 'cross-fetch'
import { Sequelize } from 'sequelize'
import { DB_URI } from './config'
import setIntegrationServerEnv from './env'

const API_HEALTH_URL = 'http://localhost:8080/api/login/message'
const WAIT_TIMEOUT_MS = 180_000
const POLL_INTERVAL_MS = 2_000

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const withPostgres = async <T>(
  fn: (sequelize: Sequelize) => Promise<T>,
): Promise<T> => {
  const sequelize = new Sequelize(DB_URI, {
    dialect: 'postgres',
    logging: false,
  })

  try {
    return await fn(sequelize)
  } finally {
    await sequelize.close().catch(() => undefined)
  }
}

const waitForPostgres = async (): Promise<void> => {
  const deadline = Date.now() + WAIT_TIMEOUT_MS

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    try {
      await withPostgres(async (sequelize) => {
        await sequelize.authenticate()
      })
      return
    } catch {
      await sleep(POLL_INTERVAL_MS)
    }
  }
  /* eslint-enable no-await-in-loop */

  throw new Error('Timed out waiting for Postgres')
}

const usersTableExists = async (): Promise<boolean> =>
  withPostgres(async (sequelize) => {
    const [rows] = await sequelize.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS "exists"`,
    )
    return Boolean(rows[0]?.exists)
  })

const waitForUsersTable = async (): Promise<void> => {
  const deadline = Date.now() + WAIT_TIMEOUT_MS

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    if (await usersTableExists()) {
      return
    }
    await sleep(POLL_INTERVAL_MS)
  }
  /* eslint-enable no-await-in-loop */

  throw new Error('Timed out waiting for users table')
}

const bootstrapSchemaIfNeeded = async (): Promise<void> => {
  if (await usersTableExists()) {
    return
  }

  setIntegrationServerEnv()
  const initDb = (await import('../../src/server/models')).default
  await initDb()
}

const waitForApiReady = async (): Promise<void> => {
  const deadline = Date.now() + WAIT_TIMEOUT_MS

  /* eslint-disable no-await-in-loop */
  while (Date.now() < deadline) {
    try {
      const res = await fetch(API_HEALTH_URL)
      if (res.ok) {
        return
      }
    } catch {
      // API may still be starting
    }
    await sleep(POLL_INTERVAL_MS)
  }
  /* eslint-enable no-await-in-loop */

  throw new Error(`Timed out waiting for API health at ${API_HEALTH_URL}`)
}

export default async (): Promise<void> => {
  await waitForPostgres()
  try {
    await waitForUsersTable()
  } catch {
    await bootstrapSchemaIfNeeded()
    await waitForUsersTable()
  }
  await waitForApiReady()
}
