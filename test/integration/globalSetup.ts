import 'reflect-metadata'
import { Sequelize } from 'sequelize'
import { DB_URI } from './config'
import setIntegrationServerEnv from './env'

const WAIT_TIMEOUT_MS = 120_000
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
    const [rows] = await sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS "exists"`,
    )
    return Boolean((rows[0] as { exists: boolean })?.exists)
  })

const bootstrapSchemaIfNeeded = async (): Promise<void> => {
  if (await usersTableExists()) {
    return
  }

  setIntegrationServerEnv()
  const initDb = (await import('../../src/server/models')).default
  await initDb()
}

export default async (): Promise<void> => {
  await waitForPostgres()
  await bootstrapSchemaIfNeeded()
}
